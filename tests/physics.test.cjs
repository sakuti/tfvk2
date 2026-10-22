'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../js/core.js');
for(const name of ['generators-forces','generators-friction','generators-motion','generators-measurement','diagrams','session'])require('../js/'+name+'.js');
const near=(actual,expected,tolerance=1e-8)=>assert(Math.abs(actual-expected)<tolerance,`${actual} ≠ ${expected}`);
const fake=(ints=[],steps=[],picks=[])=>({int:()=>ints.shift(),step:()=>steps.shift(),pick:()=>picks.shift(),shuffle:a=>a});

test('33 perhettä, 17 ydintaitoa ja kaikki viikkotehtävien perheet',()=>{
  assert.equal(Object.keys(P.registry).length,33);assert.equal(Object.values(P.registry).filter(f=>f.priority==='P1').length,17);
  for(const id of ['N01','N02','N04','N05','N06','N09','N10','N11','K01','K02','K03','L01','L04','L05','L07','L08','L09'])assert(P.registry[id]);
});
test('500 siementä jokaisesta generaattorista: toistettavuus, äärellisyys ja oikeiden vastausten hyväksyntä',()=>{
  for(const id of Object.keys(P.registry))for(let seed=0;seed<500;seed++){
    const t=P.generate(id,seed),again=P.generate(id,seed);assert.deepEqual(t,again);assert(t.context&&t.source&&t.conclusion);assert.equal(t.hints.length,3);assert(t.steps.length>=2);assert(t.fields.length>0);
    const answers=t.fields.map(field=>{
      if(field.type==='number'){assert(Number.isFinite(field.answer),id+'/'+seed);assert(Number.isInteger(field.digits));assert(P.checkField(field,P.format(field.answer,field.digits)).ok,id+'/'+seed+' pyöristys');assert(!P.checkField(field,'').ok);assert(!P.checkField(field,String(field.answer+10+100*P.tolerance(field))).ok);return String(field.answer);}
      if(field.type==='choice'){assert(field.options.some(o=>o.value===field.answer));assert.equal(new Set(field.options.map(o=>o.label)).size,field.options.length,id+'/'+seed+' vaihtoehdot');return field.answer;}
      return {...field.answer};
    });
    assert(P.grade(t,answers).every(g=>g.ok),id+'/'+seed);
    assert(!/undefined|NaN|Infinity/.test(JSON.stringify(t)),id+'/'+seed);
    if(t.diagram){const svg=P.diagramSVG(t.diagram);assert(svg.startsWith('<svg'));assert(!/NaN|undefined|Infinity/.test(svg),id+'/'+seed+' SVG');}
  }
});
test('Lukusyöte: pilkku, piste, miinus, eksponentti; ei tyhjää tai koodia',()=>{
  near(P.parse(' −1,25 '),-1.25);near(P.parse('2.5e-3'),.0025);near(P.parse('1 234,5'),1234.5);
  for(const text of ['', ' ', 'Infinity', '0x10','1,2.3','1+2','NaN','2 N','alert(1)'])assert(Number.isNaN(P.parse(text)),text);
  const field=P.number('Testi',12.34,'m',1);assert(P.checkField(field,'12,3').ok);assert(P.checkField(field,'12.3400').ok);assert(!P.checkField(field,'-12.34').ok);assert(!P.checkField(field,'12.5').ok);
});
test('Vertailutapaus: hissi 72 kg ja a = −1,2 m/s²',()=>{
  const t=P.registry.N06.make(fake([72,1],[1.2],[-1]));const nums=t.fields.filter(x=>x.type==='number');near(nums[0].answer,706.32);near(nums[1].answer,-86.4);near(nums[2].answer,619.92);
});
test('Vertailutapaus: vino veto ja kitka',()=>{
  const t=P.registry.K03.make(fake([50,30,120,0,1],[.2]));near(t.meta.Fx,60*Math.sqrt(3));near(t.meta.Fy,60);near(t.meta.N,430.5);near(t.meta.friction,86.1);near(t.meta.a,(60*Math.sqrt(3)-86.1)/50);
});
test('Vertailutapaus: pystyheitto nousuajasta, laskuvaiheen etumerkki',()=>{
  const t=P.registry.L08.make(fake([1],[1],[1.2]));near(t.meta.v0,9.81);near(t.meta.h,4.905);near(t.meta.y,4.7088);near(t.meta.v,-1.962);
});
test('Etumerkilliset pinta-alat: suunnanvaihto ja matka',()=>{
  const points=[[0,4],[2,4],[6,-4]];near(P.area(points),8);near(P.distance(points),16);
  near(P.area([[0,-2],[2,-2],[4,2]]),-4);near(P.distance([[0,-2],[2,-2],[4,2]]),6);
});
test('Tasapaino ja kontaktiehdot kaikissa arvonnoissa',()=>{
  for(let seed=0;seed<1000;seed++){
    const h=P.generate('N11',seed).meta;near(h.T1*Math.sin(h.a1*Math.PI/180)-h.T2*Math.sin(h.a2*Math.PI/180),0);near(h.T1*Math.cos(h.a1*Math.PI/180)+h.T2*Math.cos(h.a2*Math.PI/180),h.m*9.81);
    const box=P.generate('K03',seed).meta;assert(box.N>0);near(box.m*9.81+(box.down?box.Fy:-box.Fy),box.N);
    const hill=P.generate('K04',seed).meta;assert(hill.angle>hill.critical);assert(hill.a>0);
    const friction=P.generate('K01',seed).meta;assert(friction.muS>friction.muK);if(friction.mode===0){assert(friction.F<friction.max);near(friction.friction,friction.F);}
    const throwTask=P.generate('L08',seed).meta;assert(throwTask.t<=2*throwTask.rise);assert(throwTask.y>=-1e-8);
  }
});
test('Kulman viiteakseli ja komponenttien etumerkki',()=>{
  let horizontal=false,vertical=false;
  for(let seed=0;seed<50;seed++){const m=P.generate('N09',seed).meta;near(m.Fx*m.Fx+m.Fy*m.Fy,m.F*m.F,1e-6);if(m.down)assert(m.Fy<0);else assert(m.Fy>0);if(m.vertical)vertical=true;else horizontal=true;}
  assert(horizontal&&vertical);
});
test('Voimakuva ei hyväksy puuttuvia tai ylimääräisiä voimia',()=>{
  const f=P.generate('N04',19).fields[0];assert(!P.checkField(f,{}).ok);assert(P.checkField(f,f.answer).ok);assert(!P.checkField(f,{...f.answer,P:'up'}).ok);
});
test('Kierrokset: aiheiden kattavuus ja uusia siemeniä',()=>{
  const state=P.emptyState();for(let seed=0;seed<100;seed++)for(const mode of ['learn','baseline','exam','weak']){
    const s=P.createSession(state,mode,'P1',null,null,seed);assert.equal(s.queue.length,mode==='exam'?12:mode==='baseline'?9:8);assert.equal(new Set(s.queue.map(q=>q.seed)).size,s.queue.length);
    const categories=new Set(s.queue.map(q=>P.registry[q.family].category));assert.equal(categories.size,3);
    assert(s.queue.every(q=>P.registry[q.family].priority==='P1'));assert(P.validSession(s));
  }
});
test('Kirjaus, uusinta, tuettu suoritus ja kesken olevan tehtävän palautus',()=>{
  let state=P.emptyState();state.session=P.createSession(state,'learn','P1',null,null,42,1000);const s=state.session,q=s.queue[0],t=P.generate(q.family,q.seed);s.current.hints=1;s.current.answers=['oma vastaus'];
  P.record(state,s,t,'assisted',s.current.answers,1100);assert.equal(state.stats[t.family].independent,0);assert.equal(state.stats[t.family].assisted,1);assert(s.queue.length>8);assert.equal(s.queue[4].family,t.family);assert.notEqual(s.queue[4].seed,t.seed);
  state=P.sanitize(JSON.parse(JSON.stringify(state)));assert(state.session);assert(state.session.current.done);assert.equal(state.session.current.hints,1);assert.deepEqual(state.session.current.answers,['oma vastaus']);
  P.advance(state,1200);assert.equal(state.session.index,1);assert.equal(state.session.current.done,false);assert.equal(state.session.current.hints,0);
});
test('Osaaminen ei vahvistu yhdestä variantista tai vain yhdestä kierroksesta',()=>{
  const s={attempts:3,independent:3,assisted:0,wrong:0,successes:[{seed:1,session:'a'},{seed:2,session:'a'},{seed:3,session:'a'}]};assert.equal(P.mastery(s),2);s.successes[2].session='b';assert.equal(P.mastery(s),3);s.successes[2].seed=2;assert.equal(P.mastery(s),2);assert.equal(P.mastery(null),0);
});
test('Sama käsitekysymys eri siemenellä ei ole uusi osaamisvariantti',()=>{
  const state=P.emptyState(),base=P.generate('N01',1),same={...base,seed:99999};
  state.session=P.createSession(state,'topic','P1','Voimat','N01',1,1000);P.record(state,state.session,base,'independent',[],1100);
  state.session=P.createSession(state,'topic','P1','Voimat','N01',2,2000);P.record(state,state.session,same,'independent',[],2100);
  assert.equal(state.stats.N01.independent,2);assert.equal(new Set(state.stats.N01.successes.map(s=>s.variant)).size,1);assert.equal(P.mastery(state.stats.N01),2);
});
test('Koekierros ei lisää uusintatehtäviä ja tallentaa tulokset katsottaviksi',()=>{
  const state=P.emptyState();state.session=P.createSession(state,'exam','P1',null,null,88,1000);let summary;
  while(!state.session.review){const s=state.session,q=s.queue[s.index],task=P.generate(q.family,q.seed);assert.equal(s.queue.length,12);P.record(state,s,task,'wrong',[],2000);assert.equal(P.advance(state,3000),null);}
  assert.deepEqual(state.stats,{});assert.equal(state.xp,0);assert(P.validSession(state.session));assert(P.validSession(P.sanitize(JSON.parse(JSON.stringify(state))).session));
  summary=P.finishExam(state,4000);assert.equal(state.session,null);assert(summary.results.every(r=>r.outcome==='skipped'));assert.equal(summary.skipped,12);assert(Object.values(state.stats).every(x=>x.wrong>0&&x.assisted===0));
  assert.equal(summary.total,12);assert.equal(summary.results.length,12);const restored=P.sanitize(JSON.parse(JSON.stringify(state)));assert.equal(restored.history[0].results.length,12);assert.equal(restored.history[0].independent,0);
});
test('Vioittunut ja vanha tallennus sekä estetty localStorage',()=>{
  assert.deepEqual(P.sanitize({version:900}),P.emptyState());const corrupt=P.emptyState();corrupt.session={mode:'exam',queue:[]};assert.equal(P.sanitize(corrupt).session,null);
  const broken={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};assert.equal(P.load(broken).persistent,false);assert.equal(P.save(P.emptyState(),broken),false);
  const malformed={getItem(){return '{oops';}};assert.equal(P.load(malformed).persistent,true);assert.equal(P.load(malformed).state.session,null);
  let json='';const memory={getItem:()=>json||null,setItem:(k,v)=>json=v};const state=P.emptyState();state.session=P.createSession(state,'learn','P1',null,null,17);state.session.current.answers=['1,2'];assert(P.save(state,memory));assert.equal(P.load(memory).state.session.current.answers[0],'1,2');
});
test('Kuvaaja mukautuu kapeaan tilaan muuttamatta fysikaalisia arvoja',()=>{
  const task=P.generate('L04',13),before=JSON.stringify(task.diagram.points);
  for(const width of [280,320,360,720]){const svg=P.plotSVG({...task.diagram,width});assert(svg.includes('viewBox="0 0 '+width+' '));assert(!/NaN|Infinity|undefined/.test(svg));}
  assert.equal(JSON.stringify(task.diagram.points),before);
});
