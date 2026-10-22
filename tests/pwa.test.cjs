'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
let JSDOM;try{({JSDOM}=require('jsdom'));}catch{({JSDOM}=require('../../.qa/node_modules/jsdom'));}
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const swSource=fs.readFileSync(path.join(root,'sw.js'),'utf8'),pwaSource=fs.readFileSync(path.join(root,'js/pwa.js'),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,10));

function worker(base='https://user.github.io/course/'){
  const listeners={},stores=new Map(),deleted=[];let claims=0,activated=0,network=0;
  const key=req=>typeof req==='string'?req:req.url;
  const caches={
    async open(name){if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return {
      async addAll(requests){for(const req of requests){assert.equal(req.cache,'reload');const url=new URL(req.url);assert(url.href.startsWith(base));const file=path.join(root,decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)));assert(fs.existsSync(file),file);data.set(req.url,new Response(fs.readFileSync(file)));}},
      async match(req){return data.get(key(req))?.clone();},async put(req,res){data.set(key(req),res);}
    };},async keys(){return [...stores.keys()];},async delete(name){deleted.push(name);return stores.delete(name);}
  };
  const self={location:{href:base+'sw.js'},clients:{async claim(){claims++;}},async skipWaiting(){activated++;},addEventListener:(name,fn)=>listeners[name]=fn};
  const context=vm.createContext({self,caches,URL,Request,Response,fetch:async()=>{network++;throw Error('offline');}});vm.runInContext(swSource,context);
  return {listeners,stores,deleted,context,caches,base,get claims(){return claims;},get activated(){return activated;},get network(){return network;},
    async event(name,extra={}){let promise;listeners[name]({...extra,waitUntil:p=>promise=p});await promise;},
    async request(url,method='GET'){let response;listeners.fetch({request:new Request(url,{method}),respondWith:p=>response=p});return response?await response:null;}
  };
}

test('PWA-manifesti ja aidot sovelluskuvakkeet toimivat Pagesin alikansiossa',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
  assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'./');assert.equal(manifest.id,'./');assert.equal(manifest.lang,'fi');
  const base='https://user.github.io/course/';assert(new URL(manifest.start_url,base).href.startsWith(base));
  for(const size of [192,512])assert(manifest.icons.some(i=>i.sizes===size+'x'+size&&i.purpose==='any'));
  assert(manifest.icons.some(i=>i.purpose==='maskable'));
  for(const icon of manifest.icons){const data=fs.readFileSync(path.join(root,icon.src)),size=Number(icon.sizes.split('x')[0]);assert.equal(data.subarray(1,4).toString(),'PNG');assert.equal(data.readUInt32BE(16),size);assert.equal(data.readUInt32BE(20),size);}
  const apple=fs.readFileSync(path.join(root,'assets/icons/apple-touch-icon.png'));assert.equal(apple.readUInt32BE(16),180);
});

test('Ensimmäinen asennus tallentaa kaikki pelin, fontin ja materiaalikartan resurssit offline-käyttöön',async()=>{
  for(const base of ['https://user.github.io/','https://user.github.io/course/']){
    const w=worker(base);await w.event('install');await w.event('activate');assert.equal(w.claims,1);
    const files=vm.runInContext('FILES',w.context);assert(files.length>=25);
    for(const file of files){const response=await w.request(new URL(file,base).href);assert(response?.ok,file);assert((await response.arrayBuffer()).byteLength>0,file);}
    for(const [,ref] of html.matchAll(/(?:src|href)="(\.\/[^"<>]+)"/g)){if(ref==='./sw.js')continue;assert(files.includes(ref),'Välimuistista puuttuu '+ref);}
    const css=fs.readFileSync(path.join(root,'css/game.css'),'utf8');for(const [,ref] of css.matchAll(/url\("([^"<>]+)"\)/g)){const relative='./'+path.posix.normalize('css/'+ref);assert(files.includes(relative),relative);}
    const home=await w.request(base),query=await w.request(base+'index.html?source=home');assert((await home.text()).includes('Oma oppimispolku'));assert((await query.text()).includes('Oma oppimispolku'));assert.equal(w.network,0);
  }
});

test('Päivitys siivoaa vain saman sovelluksen vanhat välimuistit eikä kaappaa muita osoitteita',async()=>{
  const w=worker();await w.event('install');const prefix=vm.runInContext('PREFIX',w.context),current=vm.runInContext('CACHE',w.context);
  await w.caches.open(prefix+'old');await w.caches.open('other-app-cache');await w.caches.open('fysiikka-sprintti-%2Fanother%2F-1.2');
  await w.event('activate');assert.deepEqual(w.deleted,[prefix+'old']);assert(w.stores.has(current));assert(w.stores.has('other-app-cache'));assert(w.stores.has('fysiikka-sprintti-%2Fanother%2F-1.2'));
  for(const url of ['https://example.org/font.ttf','https://user.github.io/another/index.html',w.base+'unknown.html'])assert.equal(await w.request(url),null);
  assert.equal(await w.request(w.base+'index.html','POST'),null);assert.equal(w.activated,0);
  await w.event('message',{data:{type:'ACTIVATE_UPDATE'}});assert.equal(w.activated,1);
});

function pwaUI({url='https://user.github.io/course/',fail=false,standalone=false,waiting=false,ios=false}={}){
  const dom=new JSDOM(html,{url,runScripts:'outside-only'}),w=dom.window,errors=[];w.addEventListener('error',e=>errors.push(e.error));w.matchMedia=()=>({matches:standalone});
  if(ios)Object.defineProperty(w.navigator,'userAgent',{value:'iPhone'});
  let registered=0,message=null,registerArgs;
  const registration=new w.EventTarget();registration.active={state:'activated'};registration.waiting=waiting?{postMessage:data=>message=data}:null;
  const sw=new w.EventTarget();sw.register=async(...args)=>{registered++;registerArgs=args;if(fail)throw Error('denied');return registration;};sw.ready=Promise.resolve(registration);
  Object.defineProperty(w.navigator,'serviceWorker',{value:sw});w.eval(pwaSource);
  return {w,d:w.document,errors,registration,get registered(){return registered;},get args(){return registerArgs;},get message(){return message;},close:()=>w.close()};
}
test('Asennus pyydetään vain painalluksesta; iPhone-ohje, file-tila ja rekisteröintivirhe toimivat',async()=>{
  let app=pwaUI();try{
    await tick();assert.equal(app.registered,1);assert.equal(app.args[0],'./sw.js');assert.equal(app.args[1].scope,'./');assert(app.d.getElementById('offline-status').classList.contains('is-ready'));
    let prompts=0;const event=new app.w.Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>prompts++;event.userChoice=Promise.resolve({outcome:'accepted'});app.w.dispatchEvent(event);assert(event.defaultPrevented);assert.equal(prompts,0);
    app.d.getElementById('install-app').click();await tick();assert.equal(prompts,1);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
  app=pwaUI({ios:true});try{app.d.getElementById('install-app').click();assert(app.d.getElementById('install-instructions').textContent.includes('Safari'));}finally{app.close();}
  app=pwaUI({url:'file:///course/index.html'});try{assert.equal(app.registered,0);app.d.getElementById('install-app').click();assert(app.d.getElementById('install-instructions').textContent.includes('HTTPS'));assert.deepEqual(app.errors,[]);}finally{app.close();}
  app=pwaUI({fail:true});try{await tick();assert(app.d.getElementById('offline-status').textContent.includes('ei onnistunut'));assert.deepEqual(app.errors,[]);}finally{app.close();}
  app=pwaUI({standalone:true});try{await tick();assert(app.d.getElementById('install-app').hidden);}finally{app.close();}
});
test('Päivitys ei aktivoidu automaattisesti eikä keskellä avointa harjoitusta',async()=>{
  const app=pwaUI({waiting:true});try{
    await tick();const button=app.d.getElementById('update-app');assert(button);assert.equal(app.message,null);
    app.d.body.classList.add('is-studying');button.click();assert.equal(app.message,null);assert(button.parentNode.textContent.includes('tallentuu'));
    app.d.body.classList.remove('is-studying');button.click();assert.equal(app.message.type,'ACTIVATE_UPDATE');assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Fontti on paikallinen ja molempien teemojen leipätekstin kontrasti on vähintään 4,5:1',()=>{
  const css=fs.readFileSync(path.join(root,'css/game.css'),'utf8');assert(css.includes('@font-face'));assert(fs.statSync(path.join(root,'assets/fonts/Manrope-Variable.ttf')).size>10000);assert(fs.readFileSync(path.join(root,'assets/fonts/OFL.txt'),'utf8').includes('SIL OPEN FONT LICENSE'));
  const luminance=hex=>{if(hex.length===4)hex='#'+hex.slice(1).split('').map(c=>c+c).join('');const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  for(const selector of [':root{',':root[data-theme="light"]{']){
    const rules=css.slice(css.indexOf(selector)+selector.length).split('}')[0],vars=Object.fromEntries([...rules.matchAll(/--([a-z-]+):(#[a-f\d]{3,6})/g)].map(m=>[m[1],m[2]]));
    for(const text of ['ink','muted','faint'])for(const bg of ['bg','paper']){const a=luminance(vars[text]),b=luminance(vars[bg]),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5,selector+' '+text+'/'+bg+' '+ratio);}
  }
});
