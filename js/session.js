(function(P){
  'use strict';
  const VERSION=1,KEY='fysiikka-sprintti-v1',OUTCOMES=['independent','assisted','reviewed','skipped','wrong'];
  P.STORAGE_KEY=KEY;
  P.emptyState=()=>({version:VERSION,rev:0,stats:{},lessons:{},history:[],session:null,settings:{scope:'P1',timed:false,theme:'dark',sound:false,volume:.3},xp:0,completedRounds:0});
  const safeObject=o=>o&&typeof o==='object'&&!Array.isArray(o);
  const validRecord=x=>safeObject(x)&&P.registry[x.family]&&Number.isInteger(x.seed)&&Array.isArray(x.answers)&&OUTCOMES.includes(x.outcome);
  P.validSession=s=>{
    if(!safeObject(s)||typeof s.id!=='string'||!['learn','weak','exam','baseline','topic'].includes(s.mode)||!Array.isArray(s.queue)||s.queue.length<1||s.queue.length>60||!Number.isInteger(s.index)||s.index<0||s.index>s.queue.length||!Array.isArray(s.results)||s.results.length!==s.index||!Number.isFinite(s.started)||!Number.isInteger(s.baseLength)||s.baseLength<1||!safeObject(s.current))return false;
    if(!s.queue.every(q=>safeObject(q)&&P.registry[q.family]&&Number.isInteger(q.seed)&&q.seed>=0&&q.seed<=0xffffffff))return false;
    // Koekierroksen lopussa vastaukset tarkistetaan ennen palautusta: index on silloin jonon pituus.
    const review=s.mode==='exam'&&s.review===true,editing=review&&s.editing!==null&&s.editing!==undefined;
    if(review){if(s.index!==s.queue.length||editing&&!(Number.isInteger(s.editing)&&s.editing>=0&&s.editing<s.queue.length))return false;}
    else if(s.index===s.queue.length)return false;
    if(!Array.isArray(s.current.answers)||!Number.isInteger(s.current.hints)||s.current.hints<0||s.current.hints>3||!Number.isInteger(s.current.tries)||s.current.tries<0)return false;
    const target=review?(editing?s.queue[s.editing]:null):s.queue[s.index];
    if(target&&s.current.done&&(!validRecord(s.current.record)||s.current.record.family!==target.family||s.current.record.seed!==target.seed))return false;
    return s.results.every(validRecord);
  };
  P.sanitize = raw => {
    const fresh=P.emptyState();if(!safeObject(raw)||raw.version!==VERSION)return fresh;
    fresh.rev=Number.isInteger(raw.rev)&&raw.rev>=0?raw.rev:0;
    if(safeObject(raw.stats))for(const id of Object.keys(P.registry)){
      const s=raw.stats[id];if(!safeObject(s))continue;
      const validCount=x=>Number.isInteger(x)&&x>=0&&x<1e8;
      if(!['attempts','independent','assisted','wrong'].every(k=>validCount(s[k])))continue;
      if(!Array.isArray(s.successes))continue;
      fresh.stats[id]={attempts:s.attempts,independent:s.independent,assisted:s.assisted,wrong:s.wrong,last:Number.isFinite(s.last)?s.last:0,successes:s.successes.filter(v=>safeObject(v)&&Number.isInteger(v.seed)&&typeof v.session==='string').slice(-20)};
    }
    fresh.history=Array.isArray(raw.history)?raw.history.filter(x=>safeObject(x)&&typeof x.id==='string'&&Number.isFinite(x.at)&&Number.isInteger(x.total)&&Number.isInteger(x.independent)&&Array.isArray(x.results)&&x.results.every(validRecord)).slice(-30):[];
    if(safeObject(raw.settings)){fresh.settings.scope=['P1','all'].includes(raw.settings.scope)?raw.settings.scope:'P1';fresh.settings.timed=raw.settings.timed===true;fresh.settings.theme=raw.settings.theme==='light'?'light':'dark';}
    if(safeObject(raw.lessons))for(const id of Object.keys(P.registry)){const lesson=raw.lessons[id];if(safeObject(lesson)&&lesson.completed===true)fresh.lessons[id]={completed:true,at:Number.isFinite(lesson.at)?lesson.at:0};}
    if(safeObject(raw.settings)){fresh.settings.sound=raw.settings.sound===true;fresh.settings.volume=Number.isFinite(raw.settings.volume)?Math.min(1,Math.max(0,raw.settings.volume)):.3;}
    fresh.xp=Number.isFinite(raw.xp)&&raw.xp>=0?Math.floor(raw.xp):0;
    fresh.completedRounds=Number.isInteger(raw.completedRounds)&&raw.completedRounds>=fresh.history.length?raw.completedRounds:fresh.history.length;
    if(P.validSession(raw.session))fresh.session=raw.session;
    return fresh;
  };
  P.load = storage => {let raw;try{raw=(storage||localStorage).getItem(KEY);}catch{return {state:P.emptyState(),persistent:false};}try{return {state:P.sanitize(JSON.parse(raw)),persistent:true};}catch{return {state:P.emptyState(),persistent:true};}};
  // Palauttaa tallennetun revision ja tilan, jotta toisen välilehden uudempaa tallennusta ei ylikirjoiteta.
  P.peek = storage => {try{const raw=(storage||localStorage).getItem(KEY);if(raw===null)return {rev:null,raw:null};const parsed=JSON.parse(raw);return {rev:Number.isInteger(parsed?.rev)?parsed.rev:0,raw:parsed};}catch{return {rev:null,raw:null};}};
  P.save = (state,storage) => {try{(storage||localStorage).setItem(KEY,JSON.stringify(state));return true;}catch{return false;}};
  P.clear = storage => {try{(storage||localStorage).removeItem(KEY);return true;}catch{return false;}};
  P.mastery = stats => {
    if(!stats||!stats.attempts)return 0;
    const seeds=new Set(stats.successes.map(x=>x.variant||String(x.seed))),sessions=new Set(stats.successes.map(x=>x.session));
    return seeds.size>=3&&sessions.size>=2?3:stats.independent>0?2:1;
  };
  P.masteryLabels=['Ei vielä harjoiteltu','Harjoittelu aloitettu','Itsenäinen onnistuminen','Vahvistettu taito'];
  // Tilateksti vastaa näkyviä lukuja: tuella harjoiteltu vain, jos tuettuja ratkaisuja on.
  P.masteryLabel = stats => {const level=P.mastery(stats);return level===1&&stats.assisted>0?'Harjoiteltu tuella':P.masteryLabels[level];};
  P.blankCurrent = ()=>({answers:[],hints:0,tries:0,solution:false,formula:false,done:false,feedback:[],record:null,step:-1,checked:[],solutionStep:0,teaching:null,lessonPage:0,lessonAnswer:null,lessonParameter:null});
  P.createSession = (state,mode,scope='P1',topic=null,family=null,seed=P.seed(),now=Date.now()) => {
    const r=P.random(seed),all=Object.values(P.registry),eligible=all.filter(f=>(scope==='all'||f.priority==='P1')&&(!topic||f.category===topic)&&(!family||f.id===family));
    if(!eligible.length)throw Error('Valitussa aiheessa ei ole tehtäviä.');
    const target=mode==='exam'?12:mode==='baseline'?9:8,queue=[];
    const score=id=>{const s=state.stats[id];if(!s)return mode==='weak'?4:8;if(P.mastery(s)===3)return 1;return mode==='weak'?8+Math.min(8,s.wrong*2)+(!s.independent?8:0):3+Math.min(5,s.wrong)+(!s.independent?3:0);};
    function choose(pool){const sum=pool.reduce((n,f)=>n+score(f.id),0);let x=r.next()*sum;for(const f of pool){x-=score(f.id);if(x<=0)return f;}return pool.at(-1);}
    const categories=r.shuffle([...new Set(eligible.map(f=>f.category))]);
    const untaught=P.Lessons&&['learn','topic'].includes(mode)?P.Lessons.order.filter(id=>eligible.some(f=>f.id===id)&&!state.lessons?.[id]?.completed):[];
    for(let i=0;i<target;i++){
      let pool=eligible;
      if(!family&&!topic){const category=categories[i%categories.length];pool=eligible.filter(f=>f.category===category);}
      const recent=queue.slice(-2).map(x=>x.family),unused=pool.filter(f=>!queue.some(q=>q.family===f.id));
      if(unused.length)pool=unused;else{const notRecent=pool.filter(f=>!recent.includes(f.id));if(notRecent.length)pool=notRecent;}
      const nextLesson=untaught.find(id=>!queue.some(q=>q.family===id));
      const chosen=nextLesson?P.registry[nextLesson]:mode==='weak'||mode==='learn'||mode==='topic'?choose(pool):r.pick(pool);
      queue.push({family:chosen.id,seed:r.int(0,0xffffffff)});
    }
    return {id:now+'-'+(seed>>>0),mode,scope,topic,family,queue,index:0,baseLength:target,results:[],started:now,seed,current:P.blankCurrent(),extra:0,timed:mode==='exam'&&state.settings.timed};
  };
  P.applyStats = (state,sessionId,task,outcome,now=Date.now())=>{
    const s=state.stats[task.family]||(state.stats[task.family]={attempts:0,independent:0,assisted:0,wrong:0,last:0,successes:[]});
    s.attempts++;s.last=now;
    if(outcome==='independent'){s.independent++;const variant=P.variant(task);if(!s.successes.some(v=>v.seed===task.seed&&v.session===sessionId))s.successes.push({seed:task.seed,variant,session:sessionId});state.xp+=20;}
    else if(outcome==='assisted'){s.assisted++;state.xp+=8;}else{s.wrong++;state.xp+=outcome==='reviewed'?3:0;}
    s.successes=s.successes.slice(-20);
  };
  P.record = (state,session,task,outcome,answers,now=Date.now())=>{
    const record={family:task.family,seed:task.seed,outcome,answers:JSON.parse(JSON.stringify(answers||[])),at:now,hints:session.current.hints,tries:session.current.tries};
    // Koekierroksen tuloksia ei näytetä eikä kirjata osaamiseen ennen palautusta.
    if(session.mode!=='exam')P.applyStats(state,session.id,task,outcome,now);
    session.current.done=true;session.current.record=record;
    if(outcome!=='independent'&&session.mode!=='exam'&&session.mode!=='baseline'&&session.extra<2&&!session.queue.slice(session.index+1,session.index+4).some(q=>q.family===task.family)){
      session.queue.splice(Math.min(session.queue.length,session.index+4),0,{family:task.family,seed:(task.seed+0x9e3779b9)>>>0});session.extra++;
    }
    return record;
  };
  P.summarize = s => {const count=o=>s.results.filter(x=>x.outcome===o).length;return {total:s.results.length,independent:count('independent'),assisted:count('assisted'),reviewed:count('reviewed'),skipped:count('skipped'),wrong:count('wrong')};};
  function finish(state,s,now){
    const summary={id:s.id,at:now,mode:s.mode,...P.summarize(s),minutes:Math.max(1,Math.round((now-s.started)/60000)),results:s.results};
    state.history.push(summary);state.history=state.history.slice(-30);state.completedRounds++;state.session=null;return summary;
  }
  P.advance = (state,now=Date.now()) => {
    const s=state.session;if(!s||!s.current.done)return null;
    if(s.review){if(Number.isInteger(s.editing))s.results[s.editing]=s.current.record;s.editing=null;s.current=P.blankCurrent();return null;}
    s.results.push(s.current.record);s.index++;
    if(s.index>=s.queue.length){
      if(s.mode==='exam'){s.review=true;s.editing=null;s.current=P.blankCurrent();return null;}
      return finish(state,s,now);
    }
    s.current=P.blankCurrent();return null;
  };
  const empty=v=>v===null||v===undefined||v===''||safeObject(v)&&Object.values(v).every(x=>x==='none');
  // Koe pisteytetään vasta palautuksessa, jolloin osaaminen ja pisteet päivittyvät kerralla.
  P.finishExam = (state,now=Date.now()) => {
    const s=state.session;if(!s||!s.review)return null;
    for(const record of s.results){
      const task=P.generate(record.family,record.seed),ok=P.grade(task,record.answers).every(x=>x.ok);
      record.outcome=ok?'independent':task.fields.every((_,i)=>empty(record.answers[i]))?'skipped':'wrong';
      P.applyStats(state,s.id,task,record.outcome,now);
    }
    return finish(state,s,now);
  };
})(typeof window!=='undefined'?window.Physics:globalThis.Physics);
