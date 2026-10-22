'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let JSDOM;try{({JSDOM}=require('jsdom'));}catch{({JSDOM}=require('../../.qa/node_modules/jsdom'));}
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script(?: defer)? src="\.\/([^"<>]+)"/g)].map(x=>x[1]);
const tick=()=>new Promise(resolve=>setTimeout(resolve,10));
function setup({saved=null,blocked=false,file=false,reduced=false,viewport=false}={}){
  const dom=new JSDOM(html,{url:file?'file:///test/index.html':'https://test.invalid/course/index.html',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,errors=[];w.matchMedia=()=>({matches:reduced});w.addEventListener('error',event=>errors.push(event.error));w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
  if(viewport){const v=new w.EventTarget();v.height=720;v.offsetTop=0;Object.defineProperty(w,'visualViewport',{value:v});}
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('blocked');}});else if(saved)w.localStorage.setItem('fysiikka-sprintti-v1',saved);
  for(const script of scripts)w.eval(fs.readFileSync(path.join(root,script),'utf8'));
  return {dom,w,d:w.document,errors,close:()=>w.close()};
}
const saved=app=>JSON.parse(app.w.localStorage.getItem('fysiikka-sprintti-v1'));
async function route(app,name){app.w.location.hash=name;await tick();}
async function click(app,id){app.d.getElementById(id).click();await tick();}
async function confirmReplace(app,value='confirm'){const dialog=app.d.getElementById('replace-dialog');if(!dialog.open)return false;dialog.returnValue=value;dialog.close();await tick();return true;}
const playing=app=>!app.d.getElementById('view-play').hidden;
async function family(app,id,teach=true){await route(app,'skills');const select=app.d.getElementById('skill-priority');select.value='all';select.dispatchEvent(new app.w.Event('change'));const row=app.d.querySelector('.skill-row[data-family="'+id+'"]');assert(row,id);row.querySelector('.skill-button').click();await tick();await confirmReplace(app);if(teach)await finishTeaching(app);}
function task(app){const s=saved(app).session,q=s.review?s.queue[s.editing]:s.queue[s.index];return app.w.Physics.generate(q.family,q.seed);}
function fillCurrent(app,wrong=false){
  const t=task(app),i=saved(app).session.current.step,field=t.fields[i];assert(field);
  if(field.type==='number'){const input=app.d.getElementById('answer-'+i);input.value=wrong?String(field.answer+1000):String(field.answer).replace('.',',');input.dispatchEvent(new app.w.Event('input',{bubbles:true}));}
  else if(field.type==='choice'){const value=wrong?field.options.find(o=>o.value!==field.answer).value:field.answer,input=app.d.querySelector(`input[name="answer-${i}"][value="${value}"]`);input.checked=true;input.dispatchEvent(new app.w.Event('change',{bubbles:true}));}
  else for(const name of field.names){const select=app.d.getElementById('force-'+name);select.value=wrong?'up':field.answer[name]||'none';select.dispatchEvent(new app.w.Event('change',{bubbles:true}));}
}
async function submit(app){app.d.getElementById('answer-form').dispatchEvent(new app.w.Event('submit',{bubbles:true,cancelable:true}));await tick();}
async function finishTeaching(app){
  for(let i=0;i<30&&!app.d.getElementById('lesson-panel').hidden;i++){
    const choice=app.d.querySelector('[data-lesson-answer="0"]');if(choice){choice.click();await tick();}
    await click(app,'next-task');
  }
  assert(app.d.getElementById('lesson-panel').hidden,'Opetus etenee omaan tehtävään.');
}
async function beginTask(app){await finishTeaching(app);if(saved(app).session.current.step<0)await click(app,'next-task');}
async function finishTask(app){
  await finishTeaching(app);const initial=saved(app).session.index;
  for(let guard=0;guard<30;guard++){
    const s=saved(app).session;if(!s||s.index!==initial||s.current.done||s.review&&s.editing===null)return;
    if(s.current.step<0||s.current.checked[s.current.step])await click(app,'next-task');
    else{assert.equal(app.d.querySelectorAll('#task-fields .field').length,1);fillCurrent(app);await submit(app);}
  }
  assert.fail('Tehtävän vaiheistus ei päättynyt.');
}

test('33 perhettä: oikea modal, tilanne ensin ja vain yksi ratkaistava kohta kerrallaan',async()=>{
  const app=setup();try{
    assert.equal(app.d.getElementById('view-home').hidden,false);assert.equal(app.d.getElementById('stat-independent').textContent,'0');
    for(const id of Object.keys(app.w.Physics.registry)){
      await family(app,id);const t=task(app);assert.equal(t.family,id);assert(playing(app));assert(app.d.body.classList.contains('is-studying'));
      assert.equal(app.d.querySelectorAll('#task-fields .field').length,0);assert.equal(app.d.getElementById('task-title').textContent,t.title);assert.equal(app.d.getElementById('check-answer').hidden,true);
      await finishTask(app);const state=saved(app);assert.equal(state.session.current.done,true,id);assert.equal(state.stats[id].independent,1,id);assert.equal(app.d.getElementById('next-task').hidden,false,id);assert.equal(app.d.querySelectorAll('#task-fields .field').length,0);
    }
    assert.equal(Object.keys(saved(app).stats).length,33);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Vaihe ei vaihdu väärästä vastauksesta; oikein vastattu vaihe säilyy ja siihen voi palata',async()=>{
  const app=setup();try{
    await family(app,'N06');await beginTask(app);const initial=task(app).seed;fillCurrent(app,true);await submit(app);
    assert.equal(saved(app).session.current.step,0);assert(app.d.getElementById('feedback').classList.contains('error'));assert.equal(app.d.getElementById('next-task').hidden,true);
    fillCurrent(app);await submit(app);assert.equal(saved(app).session.current.checked[0],true);assert.equal(saved(app).session.current.done,false);assert.equal(saved(app).stats.N06,undefined);
    await click(app,'next-task');assert.equal(saved(app).session.current.step,1);assert.equal(task(app).seed,initial);await click(app,'previous-step');assert.equal(saved(app).session.current.step,0);assert.equal(app.d.querySelectorAll('#task-fields .field').length,1);assert(app.d.querySelector('#task-fields input').disabled);
    await finishTask(app);assert.equal(saved(app).stats.N06.independent,0);assert.equal(saved(app).stats.N06.assisted,1);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Vihjeet ovat keskellä, viimeisin avattuna, eivätkä vaihda arvoja tai hukkaa luonnosta',async()=>{
  const app=setup();try{
    await family(app,'K03');await beginTask(app);const seed=task(app).seed,input=app.d.getElementById('answer-0');input.value='123,45';input.dispatchEvent(new app.w.Event('input'));
    for(let i=1;i<=3;i++){await click(app,'hint-button');assert.equal(app.d.querySelectorAll('.hint-item').length,i);assert.equal(app.d.querySelectorAll('.hint-item[open]').length,1);assert.equal(task(app).seed,seed);assert.equal(app.d.getElementById('answer-0').value,'123,45');}
    await finishTask(app);assert.equal(saved(app).stats.K03.independent,0);assert.equal(saved(app).stats.K03.assisted,1);assert.equal(saved(app).session.queue[4].family,'K03');assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Vaihe, luonnos ja aiemmat vastaukset palautuvat uudelleenavauksessa; Escape sulkee tallentaen',async()=>{
  let app=setup(),snapshot,seed;
  try{
    await family(app,'N06');await beginTask(app);fillCurrent(app);await submit(app);await click(app,'next-task');seed=task(app).seed;
    const input=app.d.getElementById('answer-1');input.value='123,45';input.dispatchEvent(new app.w.Event('input'));await click(app,'hint-button');
    const event=new app.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true});app.d.getElementById('answer-1').dispatchEvent(event);await tick();assert(event.defaultPrevented);assert(!playing(app));assert.equal(saved(app).session.current.step,1);snapshot=app.w.localStorage.getItem('fysiikka-sprintti-v1');
  }finally{app.close();}
  app=setup({saved:snapshot});try{await click(app,'resume-home');assert(playing(app));assert.equal(saved(app).session.current.step,1);assert.equal(task(app).seed,seed);assert.equal(app.d.getElementById('answer-1').value,'123,45');assert.equal(app.d.querySelectorAll('.hint-item').length,1);assert.equal(saved(app).session.current.checked[0],true);assert.deepEqual(app.errors,[]);}finally{app.close();}
});
test('Vanha kesken oleva tallennus ilman vaihetilaa säilyttää tehtävän ja etenemisen',async()=>{
  let app=setup(),snapshot;try{await family(app,'N06');const raw=saved(app);delete raw.session.current.step;delete raw.session.current.checked;delete raw.session.current.solutionStep;raw.session.current.answers=['0','72,5'];snapshot=JSON.stringify(raw);}finally{app.close();}
  app=setup({saved:snapshot});try{await click(app,'resume-home');assert.equal(saved(app).session.queue[0].family,'N06');assert.equal(app.d.querySelectorAll('#task-fields .field').length,0);await beginTask(app);assert.equal(saved(app).session.current.answers[1],'72,5');assert.deepEqual(app.errors,[]);}finally{app.close();}
});
test('Koekierros etenee yksi kohta kerrallaan ilman ennakkopalautetta ja säilyttää historian',async()=>{
  const app=setup();let snapshot;try{
    await click(app,'start-exam');for(let i=0;i<12;i++){
      await beginTask(app);assert.equal(app.d.getElementById('hint-button').hidden,true);assert.equal(app.d.getElementById('solution-button').hidden,true);assert.equal(app.d.getElementById('solution-panel').hidden,true);await finishTask(app);
      assert.equal(saved(app).xp,0);assert.deepEqual(saved(app).stats,{});
    }
    assert.equal(app.d.getElementById('exam-review').hidden,false);assert.equal(app.d.querySelectorAll('.exam-review-item').length,12);assert.equal(saved(app).session.review,true);
    await click(app,'next-task');
    assert.equal(app.d.getElementById('view-results').hidden,false);assert(!playing(app));assert.equal(app.d.querySelectorAll('.review-card').length,12);assert.equal(saved(app).history[0].independent,12);assert.equal(saved(app).session,null);
    const detail=app.d.querySelector('.review-card');detail.open=true;await tick();assert(detail.querySelector('.solution-steps'));snapshot=app.w.localStorage.getItem('fysiikka-sprintti-v1');assert.deepEqual(app.errors,[]);
  }finally{app.close();}
  const reopened=setup({saved:snapshot});try{await route(reopened,'skills');reopened.d.querySelector('.history-item button').click();await tick();assert.equal(reopened.d.querySelectorAll('.review-card').length,12);assert.deepEqual(reopened.errors,[]);}finally{reopened.close();}
});
test('Koetilan vastausta voi muokata aiemmassa vaiheessa eikä kaavatuki avaudu',async()=>{
  const app=setup();try{
    await click(app,'start-exam');while(task(app).fields[0].type==='forces'){await click(app,'skip-task');}await beginTask(app);await submit(app);assert.equal(saved(app).session.current.step,0);assert(app.d.getElementById('feedback').textContent.includes('kesken'));
    fillCurrent(app);await submit(app);assert.equal(saved(app).session.current.step,1);await click(app,'previous-step');fillCurrent(app,true);assert.equal(app.d.getElementById('check-answer').hidden,false);await submit(app);assert.equal(saved(app).session.current.step,1);
    await route(app,'formulas');assert.equal(app.d.getElementById('view-formulas').hidden,true);assert.equal(app.d.getElementById('view-play').hidden,false);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Malliratkaisu etenee vaiheissa eikä kirjautuessaan kerrytä itsenäistä onnistumista',async()=>{
  const app=setup();try{
    await family(app,'N10');await beginTask(app);const count=task(app).steps.length;await click(app,'solution-button');assert.equal(saved(app).stats.N10.independent,0);assert.equal(saved(app).session.current.done,true);assert.equal(saved(app).session.current.solutionStep,0);assert.equal(app.d.querySelectorAll('.solution-step-text').length,1);
    for(let i=1;i<count;i++){await click(app,'next-task');assert.equal(saved(app).session.current.solutionStep,i);assert.equal(app.d.querySelectorAll('.solution-step-text').length,1);}
    await click(app,'previous-step');assert.equal(saved(app).session.current.solutionStep,count-2);
    await family(app,'L08');await beginTask(app);await click(app,'formula-button');await finishTask(app);assert.equal(saved(app).stats.L08.independent,0);assert.equal(saved(app).stats.L08.assisted,1);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Tallennuksen esto ja file:// eivät estä vaiheikkunan avaamista',async()=>{
  for(const options of [{blocked:true},{file:true}]){const app=setup(options);try{assert.equal(app.d.getElementById('storage-warning').hidden,false);await click(app,'start-learn');assert(playing(app));assert.equal(app.d.querySelectorAll('#task-fields .field').length,0);assert(app.d.querySelector('.lesson-svg'));await finishTeaching(app);await click(app,'next-task');assert.equal(app.d.querySelectorAll('#task-fields .field').length,1);assert.deepEqual(app.errors,[]);}finally{app.close();}}
});
test('Nollaus edellyttää vahvistusta',async()=>{
  const app=setup();try{await family(app,'N01');await finishTask(app);await route(app,'skills');await click(app,'reset-progress');const dialog=app.d.getElementById('reset-dialog');assert(dialog.open);dialog.returnValue='cancel';dialog.dispatchEvent(new app.w.Event('close'));assert(saved(app).stats.N01);await click(app,'reset-progress');dialog.returnValue='confirm';dialog.dispatchEvent(new app.w.Event('close'));await tick();assert.equal(Object.keys(saved(app).stats).length,0);assert.equal(app.d.getElementById('stat-independent').textContent,'0');assert.deepEqual(app.errors,[]);}finally{app.close();}
});
test('Tumma oletusteema ja pysyvä teemavalinta säilyttävät keskeneräisen tehtävän',async()=>{
  let app=setup(),snapshot,seed,answers;
  try{
    assert.equal(app.d.documentElement.dataset.theme,'dark');await family(app,'N06');await beginTask(app);fillCurrent(app);seed=task(app).seed;answers=saved(app).session.current.answers;
    await click(app,'back-home');await click(app,'theme-toggle');assert.equal(app.d.documentElement.dataset.theme,'light');assert.equal(saved(app).settings.theme,'light');assert.equal(saved(app).session.current.step,0);assert.deepEqual(saved(app).session.current.answers,answers);snapshot=app.w.localStorage.getItem('fysiikka-sprintti-v1');assert.deepEqual(app.errors,[]);
  }finally{app.close();}
  app=setup({saved:snapshot});try{
    assert.equal(app.d.documentElement.dataset.theme,'light');await click(app,'resume-home');assert.equal(task(app).seed,seed);assert.deepEqual(saved(app).session.current.answers,answers);
    await click(app,'back-home');await click(app,'theme-toggle');assert.equal(app.d.documentElement.dataset.theme,'dark');assert.equal(saved(app).settings.theme,'dark');assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});

test('Ensin opetus: säädettävä animaatio, eri esimerkki, ymmärryskysymys ja vasta sitten oma tehtävä',async()=>{
  const app=setup();try{
    await family(app,'K01',false);const challenge=task(app),P=app.w.Physics,module=P.Lessons.module('K01'),example=P.Lessons.example(challenge);
    assert(saved(app).session.current.teaching);assert(app.d.querySelector('.lesson-svg'));assert.equal(app.d.getElementById('task-intro').hidden,true);assert.equal(app.d.querySelectorAll('#task-fields .field').length,0);
    const slider=app.d.querySelector('.lesson-parameter input');slider.value='60';slider.dispatchEvent(new app.w.Event('input'));assert.equal(saved(app).session.current.lessonParameter,60);assert(app.d.querySelector('.lesson-notes').textContent.includes('Liikekitka'));
    await click(app,'next-task');assert(app.d.querySelector('.lesson-formula'));await click(app,'next-task');assert.equal(app.d.querySelector('.lesson-example-context').textContent,example.context);assert.notEqual(P.variant(challenge),P.variant(example));
    while(!app.d.querySelector('.lesson-choices'))await click(app,'next-task');
    assert(app.d.getElementById('next-task').disabled);app.d.querySelector('[data-lesson-answer="1"]').click();await tick();assert(app.d.getElementById('next-task').disabled);assert(app.d.querySelector('.lesson-check.incorrect'));assert.equal(saved(app).stats.K01,undefined);
    app.d.querySelector(`[data-lesson-answer="${module.correct}"]`).click();await tick();assert(!app.d.getElementById('next-task').disabled);await click(app,'next-task');
    assert.equal(saved(app).lessons.K01.completed,true);assert.equal(saved(app).stats.K01,undefined);assert.equal(saved(app).xp,0);assert.equal(task(app).seed,challenge.seed);assert.equal(app.d.getElementById('task-title').textContent,challenge.title);
    await finishTask(app);assert.equal(saved(app).stats.K01.independent,1);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});

test('Opetuksen vaihe, säädin ja ääniasetukset palautuvat; vähennetty liike aloittaa tauolta',async()=>{
  let app=setup({reduced:true}),snapshot,seed;
  try{
    await family(app,'L08',false);seed=task(app).seed;assert.equal(app.d.querySelector('.animation-controls button').getAttribute('aria-label'),'Toista animaatio');assert.equal(saved(app).settings.sound,false);assert.equal(app.d.getElementById('narrate-lesson').disabled,true);
    const slider=app.d.querySelector('.lesson-parameter input');slider.value='9';slider.dispatchEvent(new app.w.Event('input'));await click(app,'next-task');await click(app,'sound-toggle');
    const volume=app.d.getElementById('sound-volume');volume.value='45';volume.dispatchEvent(new app.w.Event('input'));await click(app,'back-home');snapshot=app.w.localStorage.getItem('fysiikka-sprintti-v1');assert.deepEqual(app.errors,[]);
  }finally{app.close();}
  app=setup({saved:snapshot,reduced:true});try{
    await click(app,'resume-home');assert.equal(task(app).seed,seed);assert.equal(saved(app).session.current.lessonPage,1);assert.equal(app.d.querySelector('.lesson-parameter input').value,'9');assert.equal(saved(app).settings.sound,true);assert.equal(saved(app).settings.volume,.45);assert.equal(app.d.getElementById('sound-toggle').getAttribute('aria-pressed'),'true');assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});

test('Opetuksen kertaus kesken oman vastauksen säilyttää luonnoksen ja kirjaa suorituksen tuetuksi',async()=>{
  const app=setup();try{
    await family(app,'N06');await beginTask(app);fillCurrent(app);const before=saved(app).session.current.answers,seed=task(app).seed;await click(app,'lesson-button');assert(saved(app).session.current.teaching);await finishTeaching(app);
    assert.equal(task(app).seed,seed);assert.equal(saved(app).session.current.step,0);assert.deepEqual(saved(app).session.current.answers,before);await finishTask(app);assert.equal(saved(app).stats.N06.assisted,1);assert.equal(saved(app).stats.N06.independent,0);
    await family(app,'N06',false);assert.equal(saved(app).session.current.teaching,false);assert.equal(app.d.getElementById('lesson-button').hidden,false);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});

test('Alavalikko avaa asetukset; edistymiskaari laskee vain vahvistetut ydintaidot',async()=>{
  let app=setup(),snapshot;try{
    const state=app.w.Physics.emptyState();
    for(const id of ['N01','N03'])state.stats[id]={attempts:3,independent:3,assisted:0,wrong:0,last:100,successes:[{seed:1,session:'a'},{seed:2,session:'b'},{seed:3,session:'b'}]};
    state.lessons.N02={completed:true,at:100};snapshot=JSON.stringify(state);
  }finally{app.close();}
  app=setup({saved:snapshot});try{
    assert.equal(app.d.getElementById('mastery-gauge').getAttribute('aria-valuenow'),'6');assert.equal(app.d.getElementById('mastery-fraction').textContent,'1 / 17');
    for(const name of ['settings','skills','formulas','home']){app.d.querySelector('[data-nav="'+name+'"]').click();await tick();await tick();assert.equal(app.w.location.hash,'#'+name);assert.equal(app.d.getElementById('view-'+name).hidden,false,name);assert.equal(app.d.querySelector('[data-nav="'+name+'"]').getAttribute('aria-current'),'page',name);}
    assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});

test('Puhelimen etumerkkipainike ja näppäimistön viewport-muutos säilyttävät vastauksen',async()=>{
  const app=setup({viewport:true});try{
    await family(app,'K03');await beginTask(app);const input=app.d.getElementById('answer-0');assert.equal(input.inputMode,'decimal');input.value='12,5';input.dispatchEvent(new app.w.Event('input'));
    app.d.querySelector('.sign-toggle').click();assert.equal(saved(app).session.current.answers[0],'−12,5');
    app.w.visualViewport.height=340;app.w.visualViewport.offsetTop=12;app.w.visualViewport.dispatchEvent(new app.w.Event('resize'));assert.equal(app.d.documentElement.style.getPropertyValue('--viewport-height'),'340px');assert.equal(saved(app).session.current.answers[0],'−12,5');
    app.d.querySelector('.sign-toggle').click();assert.equal(saved(app).session.current.answers[0],'12,5');fillCurrent(app);await submit(app);assert(app.d.querySelector('.sign-toggle').disabled);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});

test('Uusi aloitus kysyy vahvistuksen kaikista aloituskohdista; peru säilyttää kierroksen',async()=>{
  const app=setup();try{
    await click(app,'start-learn');const id=saved(app).session.id;await click(app,'back-home');
    for(const start of [()=>app.d.getElementById('start-learn').click(),()=>app.d.querySelector('[data-topic="Kitka"]').click(),()=>app.d.getElementById('start-exam').click()]){
      start();await tick();assert(app.d.getElementById('replace-dialog').open);assert(app.d.getElementById('replace-description').textContent.includes('oppimiskierros'));await confirmReplace(app,'cancel');assert.equal(saved(app).session.id,id);assert(!playing(app));
    }
    app.d.getElementById('start-exam').click();await tick();await confirmReplace(app,'resume');assert(playing(app));assert.equal(saved(app).session.id,id);
    await click(app,'back-home');app.d.getElementById('start-exam').click();await tick();await confirmReplace(app,'confirm');assert.equal(saved(app).session.mode,'exam');assert.notEqual(saved(app).session.id,id);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Tyhjä tai virheellinen luku ei kuluta itsenäistä onnistumista; ohitus vie seuraavaan tehtävään',async()=>{
  const app=setup();try{
    await family(app,'K03');await beginTask(app);await submit(app);assert.equal(saved(app).session.current.tries,0);assert(app.d.getElementById('feedback').textContent.includes('ei lasketa'));
    const input=app.d.getElementById('answer-0');input.value='12 N';input.dispatchEvent(new app.w.Event('input'));await submit(app);assert.equal(saved(app).session.current.tries,0);
    await finishTask(app);assert.equal(saved(app).stats.K03.independent,1);
    await family(app,'N06');await beginTask(app);const index=saved(app).session.index;await click(app,'skip-task');
    const s=saved(app).session;assert.equal(s.index,index+1);assert.equal(s.results.at(-1).outcome,'skipped');assert.equal(s.current.solution,false);
    await route(app,'skills');const row=app.d.querySelector('.skill-row[data-family="N06"]');assert.equal(row.querySelector('.skill-status').textContent,'Harjoittelu aloitettu');assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Kaavat-näkymä ei merkitse tehtävää tuetuksi ilman erillistä valintaa',async()=>{
  const app=setup();try{
    await family(app,'K03');await beginTask(app);await route(app,'formulas');assert.equal(saved(app).session.current.formula,false);assert.equal(app.d.getElementById('formula-session').hidden,false);assert.equal(app.d.getElementById('resume-banner').hidden,false);
    await click(app,'formula-use');assert.equal(saved(app).session.current.formula,true);assert(playing(app));assert.equal(app.d.getElementById('inline-formulas').hidden,false);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Kokeen vastauksia voi muokata tarkistusvaiheessa ennen palautusta',async()=>{
  const app=setup();try{
    await click(app,'start-exam');for(let i=0;i<12;i++)await click(app,'skip-task');
    assert.equal(saved(app).session.review,true);assert.equal(app.d.querySelectorAll('.exam-review-status.incomplete').length,12);assert.equal(saved(app).xp,0);
    app.d.querySelector('.exam-review-item .step-tool').click();await tick();assert.equal(saved(app).session.editing,0);
    await finishTask(app);assert.equal(saved(app).session.editing,null);assert.equal(app.d.querySelectorAll('.exam-review-status.incomplete').length,11);
    await click(app,'next-task');const history=saved(app).history.at(-1);assert.equal(history.independent,1);assert.equal(history.skipped,11);assert(saved(app).xp>0);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Vanha välilehti ei ylikirjoita toisen välilehden uudempaa tallennusta',async()=>{
  const app=setup();try{
    await family(app,'N01');await finishTask(app);await click(app,'back-home');
    const newer=saved(app);newer.rev+=5;newer.xp=999;newer.session=null;app.w.localStorage.setItem('fysiikka-sprintti-v1',JSON.stringify(newer));
    await click(app,'theme-toggle');const after=saved(app);assert.equal(after.xp,999);assert.equal(after.session,null);assert.equal(app.d.getElementById('sync-notice').hidden,false);
    app.w.dispatchEvent(new app.w.Event('pagehide'));assert.equal(saved(app).xp,999);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
test('Ohituslinkki siirtää fokuksen vaihtamatta näkymää ja historiaa voi selata yli 10 kierrosta',async()=>{
  const base=setup();let snapshot;try{
    const s=base.w.Physics.emptyState();for(let i=0;i<25;i++)s.history.push({id:'r'+i,at:1000+i,mode:'learn',total:1,independent:0,assisted:0,minutes:1,results:[{family:'N01',seed:i,outcome:'skipped',answers:[]}]});s.completedRounds=25;snapshot=JSON.stringify(s);
  }finally{base.close();}
  const app=setup({saved:snapshot});try{
    await route(app,'settings');app.d.querySelector('.skip-link').click();await tick();assert.equal(app.w.location.hash,'#settings');assert.equal(app.d.getElementById('view-settings').hidden,false);assert.equal(app.d.activeElement.id,'settings-title');
    await route(app,'skills');assert.equal(app.d.querySelectorAll('.history-item').length,10);await click(app,'history-more');await click(app,'history-more');assert.equal(app.d.querySelectorAll('.history-item').length,25);assert(app.d.getElementById('history-more').hidden);assert.deepEqual(app.errors,[]);
  }finally{app.close();}
});
