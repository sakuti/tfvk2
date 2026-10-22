'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../js/core.js');
for(const file of ['generators-forces','generators-friction','generators-motion','generators-measurement','session','lessons','media'])require('../js/'+file+'.js');
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} ≠ ${b}`);

test('Jokaisella 33 taidolla on opetus ja sisällöltään eri esimerkki kuin omassa tehtävässä',()=>{
  assert.equal(new Set(P.Lessons.order).size,33);
  for(const id of Object.keys(P.registry))for(let seed=0;seed<100;seed++){
    const task=P.generate(id,seed),module=P.Lessons.module(id),example=P.Lessons.example(task),pages=P.Lessons.pages(task);
    assert(module.observe&&module.principle&&module.formula&&module.explain,id);assert.equal(module.options.length,3);
    assert.notEqual(P.variant(task),P.variant(example),id+'/'+seed);assert.equal(example.family,id);
    assert.equal(pages[0].type,'observe');assert.equal(pages.at(-1).type,'prediction');
    assert.equal(pages.filter(p=>p.type==='worked').length,example.steps.length);
  }
});
test('Animaatiomallit: rajat, äärelliset arvot ja saavutettava SVG jokaisessa säätöasennossa',()=>{
  for(const module of Object.values(P.Lessons.catalog)){
    const param=module.parameter;
    for(let p=param.min;p<=param.max;p+=param.step)for(const u of [0,.25,.5,.75,1]){
      const model=P.lessonModel(module.kind,p,u),svg=P.lessonSVG(model);
      for(const value of Object.values(model))if(typeof value==='number')assert(Number.isFinite(value));
      assert(svg.includes('role="img"')&&svg.includes('aria-label='));assert(!/NaN|Infinity|undefined/.test(svg));
    }
  }
});
test('Opetusmallien fysikaaliset vertailukohdat',()=>{
  let q=P.lessonModel('friction',30,1);assert.equal(q.moving,false);near(q.friction,30);near(q.a,0);
  q=P.lessonModel('friction',50,1);assert.equal(q.moving,true);near(q.friction,24.525);near(q.a,2.5475);
  q=P.lessonModel('slope',10,1);assert.equal(q.moving,false);near(q.friction,196.2*Math.sin(Math.PI/18));
  q=P.lessonModel('slope',30,1);assert(q.moving);near(q.a,9.81*(.5-.25*Math.cos(Math.PI/6)));
  q=P.lessonModel('graphs',4,.5);near(q.v,0);near(q.x,8);near(q.distance,8);
  q=P.lessonModel('graphs',4,1);near(q.x,0);near(q.distance,16);near(q.v,-4);
  q=P.lessonModel('projectile',12,.5);near(q.v,0);near(q.a,-9.81);near(q.y,144/19.62);
  q=P.lessonModel('forces',20,1);near(q.a,0);near(q.v,4);near(q.x,8);
  q=P.lessonModel('pairs',30,1);near(q.a1,-3);near(q.a2,1.5);
  q=P.lessonModel('components',30);near(q.Fy,50);near(q.Fx,Math.sqrt(7500));
  near(P.lessonModel('elevator',-2).N,468.6);
  near(P.lessonModel('tension',60).T,196.2);
  near(P.lessonModel('oblique',30).N,136.2);
  near(P.lessonModel('measurement',3).F,8.829);
});
test('Oppimispolku aloittaa perusteista, etenee katsomattomiin ja säilyttää vanhan tallennuksen',()=>{
  const state=P.emptyState(),s=P.createSession(state,'learn','P1',null,null,17,100);
  assert.equal(s.queue[0].family,'N01');assert.equal(new Set(s.queue.map(q=>q.family)).size,8);
  for(const q of s.queue)state.lessons[q.family]={completed:true,at:100};
  const next=P.createSession(state,'learn','P1',null,null,18,101);
  assert(next.queue.every(q=>!state.lessons[q.family]));
  const old=P.emptyState();delete old.lessons;delete old.settings.sound;delete old.settings.volume;
  const loaded=P.sanitize(old);assert.deepEqual(loaded.lessons,{});assert.equal(loaded.settings.sound,false);assert.equal(loaded.settings.volume,.3);
  assert.equal(Object.keys(state.stats).length,0);assert.equal(state.xp,0);
});
test('Äänet ovat oletuksena pois ja puhe vaatii paikallisen suomenkielisen äänen',()=>{
  assert.equal(P.Media.tone(),false);assert.equal(P.Media.say('Testi'),false);
  let created=0,spoken=0,cancelled=0;const gains=[];
  global.AudioContext=class{constructor(){created++;this.currentTime=0;this.destination={};}createOscillator(){return {frequency:{setValueAtTime(){}},connect(){},disconnect(){},start(){},stop(){}};}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime:v=>gains.push(v),exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}};
  global.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  let voices=[{lang:'fi-FI',localService:false}];global.speechSynthesis={getVoices:()=>voices,speak(){spoken++;},cancel(){cancelled++;}};
  try{
    P.mediaSettings={sound:false,volume:.3};assert.equal(P.Media.tone(),false);assert.equal(created,0);
    P.mediaSettings.sound=true;assert(P.Media.tone('success'));assert.equal(created,1);assert(gains.every(v=>v<=.3*.35+1e-9));
    assert.equal(P.Media.say('Testi'),false);assert.equal(spoken,0);
    voices=[{lang:'en-US',localService:true},{lang:'fi-FI',localService:true}];assert(P.Media.say('Testi'));assert.equal(spoken,1);P.Media.stopSpeech();assert.equal(cancelled,1);
    P.mediaSettings.volume=0;assert.equal(P.Media.tone(),false);assert.equal(P.Media.say('Testi'),false);
  }finally{delete global.AudioContext;delete global.speechSynthesis;delete global.SpeechSynthesisUtterance;delete P.mediaSettings;}
});
