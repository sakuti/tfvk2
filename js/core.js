(function (root) {
  'use strict';
  const P = root.Physics = {};
  P.g = 9.81;
  const formatters=new Map();
  P.format = (n, d = 2) => {if(!formatters.has(d))formatters.set(d,new Intl.NumberFormat('fi-FI',{maximumFractionDigits:d,useGrouping:false}));return formatters.get(d).format(Math.abs(n)<.5*10**-d?0:Number(n));};
  P.rad = x => x * Math.PI / 180;
  P.sin = x => Math.sin(P.rad(x));
  P.cos = x => Math.cos(P.rad(x));
  P.random = function(seed) {
    let s = seed >>> 0;
    const next = () => {s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296;};
    return {next, int:(a,b)=>Math.floor(next()*(b-a+1))+a, pick:a=>a[Math.floor(next()*a.length)], step:(a,b,step=.1)=>Math.round((a+Math.floor(next()*((b-a)/step+1))*step)*1e8)/1e8,
      shuffle:a=>{const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}};
  };
  P.seed = () => root.crypto && root.crypto.getRandomValues ? root.crypto.getRandomValues(new Uint32Array(1))[0] : (Date.now() ^ Math.floor(Math.random()*0xffffffff)) >>> 0;
  P.variant = task => {let hash=2166136261;for(const ch of task.context+'|'+task.fields.map(f=>f.label).join('|')){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16);};
  P.number = (label,answer,unit,digits=1,diagnostics=[]) => ({type:'number',label,answer,unit,digits,diagnostics});
  P.choice = (label,options,correct=0,rng) => {
    const items=options.map((label,i)=>({value:String(i),label}));
    return {type:'choice',label,options:rng?rng.shuffle(items):items,answer:String(correct)};
  };
  P.parse = raw => {
    if(typeof raw !== 'string' && typeof raw !== 'number') return NaN;
    const text=String(raw).trim().replace(/\u2212/g,'-').replace(/[\s\u00a0]/g,'');
    if(!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(text)) return NaN;
    const value=Number(text.replace(',','.')); return Number.isFinite(value)?value:NaN;
  };
  P.tolerance = field => .5 * 10 ** -field.digits + 1e-9 * Math.max(1,Math.abs(field.answer));
  P.checkField = (field,raw) => {
    if(field.type==='forces') {
      const input=raw && typeof raw==='object'?raw:{};
      const wrong=field.names.filter(n=>(input[n]||'none')!==(field.answer[n]||'none'));
      return {ok:wrong.length===0,message:wrong.length?'Tarkista voimien '+wrong.join(', ')+' olemassaolo ja suunta.':'Voimat ja suunnat oikein.'};
    }
    if(field.type==='choice') return {ok:raw===field.answer,message:raw==null||raw===''?'Valitse vaihtoehto.':'Tarkista tilanteen fysikaalinen perustelu.'};
    const value=P.parse(raw);
    if(!Number.isFinite(value)) return {ok:false,message:'Kirjoita luku ilman yksikköä. Pilkku, piste ja e-merkintä käyvät.'};
    const ok=Math.abs(value-field.answer)<=P.tolerance(field);
    if(ok) return {ok:true,message:'Oikein.'};
    const diagnostic=(field.diagnostics||[]).find(d=>Math.abs(value-d.value)<=P.tolerance(field));
    const message=diagnostic?diagnostic.message:Math.abs(value+field.answer)<=P.tolerance(field)&&Math.abs(field.answer)>P.tolerance(field)?'Suuruus näyttää oikealta. Tarkista positiivinen suunta ja etumerkki.':'Tarkista yhtälö, SI-yksiköt ja sijoitus. Säilytä välivaiheissa laskimen tarkkuus.';
    return {ok:false,message};
  };
  P.grade = (task,answers=[]) => task.fields.map((f,i)=>P.checkField(f,answers[i]));
  P.area = points => points.slice(1).reduce((s,p,i)=>s+(p[0]-points[i][0])*(p[1]+points[i][1])/2,0);
  P.distance = points => points.slice(1).reduce((s,p,i)=>{const [t0,v0]=points[i],[t1,v1]=p,dt=t1-t0; return s+(v0*v1<0?dt*(v0*v0+v1*v1)/(2*(Math.abs(v0)+Math.abs(v1))):dt*(Math.abs(v0)+Math.abs(v1))/2);},0);
  P.hints = (observation,equation,substitution) => [observation,equation,substitution];
  P.registry = {};
  P.register = (id,title,category,priority,source,make) => {P.registry[id]={id,title,category,priority,source,make};};
  P.generate = (id,seed) => {
    const family=P.registry[id]; if(!family)throw Error('Tuntematon tehtäväperhe: '+id);
    const task=family.make(P.random(seed));
    return {...task,family:id,title:family.title,category:family.category,priority:family.priority,source:family.source,seed:seed>>>0};
  };
  P.answerText = field => field.type==='number'?P.format(field.answer,Math.max(field.digits,2))+' '+field.unit:field.type==='choice'?field.options.find(o=>o.value===field.answer).label:Object.entries(field.answer).map(([n,d])=>n+': '+d).join('; ');
  // Kaavojen merkinnät selitetään sanoin, jotta pelkkä kirjain ei jää arvoitukseksi.
  P.symbols={
    'ΣF':'kokonaisvoima eli kaikkien voimien summa (N)','ΣFx':'vaakasuuntaisten voimien summa (N)','ΣFy':'pystysuuntaisten voimien summa (N)',
    F:'voima, esim. veto tai työntö (N)',Fx:'voiman vaakakomponentti (N)',Fy:'voiman pystykomponentti (N)','F̄':'voimien keskiarvo (N)',
    G:'painovoima (N)','G∥':'painovoiman tason suuntainen osa (N)','G⊥':'painovoiman tasoa vastaan kohtisuora osa (N)',
    N:'tukivoima eli pinnan kohtisuora voima (N); yksikkönä N = newton',T:'jännitysvoima eli narun tai hihnan veto (N)','T₁':'1. hihnan jännitysvoima (N)','T₂':'2. hihnan jännitysvoima (N)',Tx:'jännitysvoiman vaakaosa (N)','T₁x':'1. hihnan vaakaosa (N)','T₁y':'1. hihnan pystyosa (N)','T₂x':'2. hihnan vaakaosa (N)','T₂y':'2. hihnan pystyosa (N)',Ty:'jännitysvoiman pystyosa (N)',
    f:'kitkavoima (N)',f_s:'lepokitka (N)',f_k:'liikekitka (N)','μ':'kitkakerroin (ei yksikköä)','μs':'lepokitkakerroin (ei yksikköä)','μk':'liikekitkakerroin (ei yksikköä)',
    m:'massa (kg)',g:'putoamiskiihtyvyys 9,81 m/s²',a:'kiihtyvyys (m/s²)','ā':'keskikiihtyvyys (m/s²)','ā':'keskikiihtyvyys (m/s²)',
    v:'nopeus (m/s)','v₀':'alkunopeus (m/s)','v₁':'nopeus hetkellä 1 (m/s)','x₀':'alkupaikka (m)','t₁':'ensimmäisen osan aika','v̄':'keskinopeus (m/s)',t:'aika (s)','Δt':'aikaväli (s)','Δx':'siirtymä (m)','Δv':'nopeuden muutos (m/s)',
    x:'paikka (m)',y:'korkeus (m)',s:'kuljettu matka (m)',hmax:'suurin korkeus (m)',amax:'suurin kiihtyvyys (m/s²)',tmin:'lyhin aika (s)','θraja':'rajakulma, jolla kappale lähtee liukumaan (°)',
    'θ':'kulma (°)','α₁':'1. hihnan kulma pystysuorasta (°)','α₂':'2. hihnan kulma pystysuorasta (°)','α':'kulma (°)'
  };
  const symbolKeys=Object.keys(P.symbols).sort((a,b)=>b.length-a.length),functionWords=new Set(['sin','cos','tan']);
  const decompose=part=>{const out=[];let rest=part;while(rest){const key=symbolKeys.find(k=>rest.startsWith(k));if(!key)return null;out.push(key);rest=rest.slice(key.length);}return out;};
  // Palauttaa tekstin kaavoissa esiintyvät merkinnät. Luvun perässä oleva kirjain tulkitaan yksiköksi.
  P.symbolsIn=(text,{prose=false}={})=>{
    const found=[],words=String(text||'').split(/\s+/);
    if(prose&&!/[=≤≥≠]/.test(text))return found;
    words.forEach((word,i)=>{
      if(i>0&&/\d$/.test(words[i-1]))return;
      const parts=word.split(/[\/·()+\-−*=,;:.!?\[\]{}²³√|<>≤≥≈→←↑↓½'"”“]+/).map(p=>p.replace(/^\d+(?:,\d+)?/,'')).filter(p=>p&&!functionWords.has(p));
      const tokens=[];for(const part of parts){const d=decompose(part);if(!d)return;tokens.push(...d);}
      if(!tokens.length||(prose&&(tokens.length>3||new Set(tokens).size<tokens.length)))return;
      for(const t of tokens)if(!found.includes(t))found.push(t);
    });
    return found;
  };
  if(typeof module==='object' && module.exports)module.exports=P;
})(typeof window!=='undefined'?window:globalThis);
