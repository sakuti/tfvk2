(function(P){
  'use strict';
  const $=id=>document.getElementById(id);
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const icon=name=>{const t=document.createElement('template');t.innerHTML='<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"/></svg>';return t.content.firstChild;};
  // Painikkeen teksti ja yhtenäinen SVG-kuvake ennen tai jälkeen tekstin.
  // Kaavan alle listataan sen merkinnät sanoin, esim. G = painovoima.
  const legend=(text,prose=false)=>{const keys=P.symbolsIn(text,{prose});if(!keys.length)return '';const list=el('dl','symbol-legend');list.setAttribute('aria-label','Merkintöjen selitykset');for(const key of keys){const row=el('div');row.append(el('dt','',key),el('dd','',P.symbols[key]));list.append(row);}return list;};
  const label=(node,text,after=null,before=null)=>{const parts=[];if(before)parts.push(icon(before));parts.push(el('span','',text));if(after)parts.push(icon(after));node.replaceChildren(...parts);};
  const loaded=P.load();let state=loaded.state,lastSummary=state.history.at(-1)||null,currentTask=null;
  let persistent=loaded.persistent,currentView='home',knownRev=state.rev,historyLimit=10,pendingStart=null,speech='idle',syncTimer=0;
  let lessonCleanup=null,voiceCleanup=null,narrationText='';
  P.mediaSettings=state.settings;
  const views=['home','play','results','skills','formulas','settings'];
  const modeNames={learn:'Oppimiskierros',weak:'Heikkojen kohtien kertaus',exam:'Koekierros',baseline:'Lähtötaso',topic:'Aiheharjoittelu'};
  const outcomes={independent:'Itsenäisesti oikein',assisted:'Oikein tuella',reviewed:'Ratkaisu katsottu',skipped:'Ohitettu',wrong:'Jäi harjoiteltavaksi'};
  const examOutcomes={independent:'Oikein',wrong:'Väärin',skipped:'Vastaamatta'};
  const doneTitles={independent:'Ratkaistu itsenäisesti.',assisted:'Ratkaistu tuella.',reviewed:'Ratkaisu katsottu.',skipped:'Tehtävä ohitettu.',wrong:'Vastaus tallennettu.'};
  const lessonSteps=['Katso','Ymmärrä','Esimerkki','Tarkista','Kokeile itse'];
  const formulas=[
    {title:'Newton ja painovoima',expression:'ΣF = ma\nG = mg',note:'Kirjoita voimien summa suuntineen. G on yksi voima, ΣF kaikkien voimien vektorisumma. Kun a = 0, ΣF = 0.'},
    {title:'Voiman komponentit',expression:'Fx = F cos θ\nFy = F sin θ',note:'Nämä suuruuskaavat pätevät, kun θ mitataan vaakatasosta. Pystysuorasta mitatulla kulmalla sini ja kosini vaihtuvat. Suunta määrää etumerkin.'},
    {title:'Lepo- ja liikekitka',expression:'f_s ≤ μsN\nf_k = μkN',note:'Levossa kitka mukautuu liukumista yrittävään voimaan enimmäisarvoon asti. Liikekitkaa käytetään liukuvalle kappaleelle. N ei aina ole mg.'},
    {title:'Vino veto tai työntö',expression:'N = mg − F sin θ (veto ylös)\nN = mg + F sin θ (työntö alas)',note:'Vaakalattia ja pystysuuntainen kiihtyvyys nolla. Kulma vaakatasosta. Vaakasuunnassa F cos θ − f = ma. Varmista N > 0.'},
    {title:'Kalteva taso',expression:'G∥ = mg sin θ\nG⊥ = mg cos θ',note:'Valitse akselit tason suuntaan ja kohtisuoraan sitä vastaan. Ilman muita kohtisuoria voimia N = G⊥. Levossa f_s = G∥, jos mikään muu voima ei vaikuta tason suunnassa.'},
    {title:'Tasainen kiihtyvyys',expression:'v = v₀ + at\nΔx = v₀t + ½at²\nv² = v₀² + 2aΔx',note:'Vain kun a on vakio. Myös v̄ = (v₀+v)/2 ja Δx = v̄t. Muunna km/h jakamalla 3,6:lla. Älä pyöristä välivaiheita.'},
    {title:'Kuvaajat ja keskisuureet',expression:'v̄ = Δx / Δt\nā = Δv / Δt',note:'x(t):n kulmakerroin → nopeus. v(t):n kulmakerroin → kiihtyvyys. v(t):n etumerkillinen ala → siirtymä; alojen itseisarvot → matka. a(t):n ala → nopeuden muutos.'},
    {title:'Pystyheitto ja hissi',expression:'Ylös +: a = −g\nv = v₀ − gt\nHissi: N − mg = ma',note:'g = 9,81 m/s². Heiton lakipisteessä v = 0, mutta a = −g. Hissin kiihtyvyys ei yksin kerro sen nopeuden suuntaa.'},
    {title:'Hihnat pystykulmilla',expression:'T₁ sin α₁ = T₂ sin α₂\nT₁ cos α₁ + T₂ cos α₂ = mg',note:'Levossa, kun muita voimia ei ole. T₁ = mg sin α₂ / sin(α₁+α₂) ja T₂ = mg sin α₁ / sin(α₁+α₂). Symmetrisessä ripustuksessa vaakatason kulmalla θ: 2T sin θ = mg.'}
  ];
  // Toisen välilehden uudempaa tallennusta ei ylikirjoiteta: tällöin otetaan sen tila käyttöön.
  function persist(){
    const stored=P.peek();
    if(stored.rev!==null&&stored.rev!==knownRev&&stored.raw){adoptExternal(stored.raw);return false;}
    state.rev=knownRev+1;
    if(P.save(state))knownRev=state.rev;else persistent=false;
    $('storage-warning').hidden=persistent;return true;
  }
  function adoptExternal(raw){
    stopLessonMedia();state=P.sanitize(raw);knownRev=state.rev;P.mediaSettings=state.settings;
    if(lastSummary&&!state.history.some(h=>h.id===lastSummary.id))lastSummary=state.history.at(-1)||null;
    const notice=$('sync-notice');notice.textContent='Edistyminen päivitettiin toisessa välilehdessä tehdyillä muutoksilla. Näet nyt uusimman tallennetun tilanteen.';notice.hidden=false;
    clearTimeout(syncTimer);syncTimer=setTimeout(()=>{notice.hidden=true;},12000);
    applyTheme();route();
  }
  function setText(id,text){$(id).textContent=text;}
  function stopLessonMedia(){lessonCleanup?.();lessonCleanup=null;voiceCleanup?.();voiceCleanup=null;P.Media.stopSpeech();speech='idle';}
  function audioUI(){
    const on=state.settings.sound,volume=Math.round(state.settings.volume*100),voice=P.Media.voice();
    for(const [toggle,status,range,output] of [['sound-toggle','sound-toggle-state','sound-volume','sound-volume-value'],['settings-sound-toggle','settings-sound-state','settings-volume','settings-volume-value']]){
      $(toggle).setAttribute('aria-pressed',String(on));setText(status,on?'Päällä':'Pois');
      if(document.activeElement!==$(range))$(range).value=volume;$(range).style.setProperty('--fill',volume+'%');setText(output,volume+' %');
    }
    const teaching=!!state.session?.current.teaching&&currentView==='play',speaking=speech==='speaking';
    $('lesson-audio').hidden=!teaching;
    label($('narrate-lesson'),speech==='ended'?'Kuuntele uudelleen':'Kuuntele selitys',null,speech==='ended'?'reset':'play');
    $('narrate-lesson').hidden=speaking;$('narrate-lesson').disabled=!voice||volume===0;$('stop-narration').hidden=!speaking;
    $('narration-chip').hidden=!speaking;setText('narration-chip','Puhuu');
    setText('narration-status',!voice?'Selostus vaatii laitteeseen asennetun suomenkielisen puheäänen.':volume===0?'Nosta voimakkuutta kuunnellaksesi selostusta.':speaking?'Selostus käynnissä. Voimakkuuden muutos koskee nykyistä lausetta ja jatkuu siitä.':speech==='ended'?'Selostus päättyi.':'Valmis toistettavaksi.');
    const voices=P.Media.voices(),select=$('settings-voice');$('settings-voice-row').hidden=!voices.length;
    if(select.dataset.list!==voices.map(v=>v.voiceURI).join('|')){select.dataset.list=voices.map(v=>v.voiceURI).join('|');select.replaceChildren(...voices.map((v,i)=>{const option=el('option','',v.name+(i===0?' (suositus)':''));option.value=v.voiceURI;return option;}));}
    if(voice)select.value=voice.voiceURI;$('settings-voice-test').disabled=!voice||volume===0;
    setText('settings-voice-note',voice?'Suomenkielinen puheääni löytyi: selostus on käytettävissä opetussivuilla.':'Selostus vaatii laitteeseen asennetun suomenkielisen puheäänen. Palauteäänet toimivat ilman sitä.');
  }
  function applyTheme(){
    const dark=state.settings.theme!=='light';document.documentElement.dataset.theme=dark?'dark':'light';
    label($('theme-toggle'),dark?'Vaalea teema':'Tumma teema',null,dark?'sun':'moon');
    $('theme-toggle').setAttribute('aria-label',dark?'Vaihda vaaleaan teemaan':'Vaihda tummaan teemaan');
    document.querySelector('meta[name="theme-color"]').content=dark?'#202023':'#f5f3f8';
  }
  function setRoute(name){if(location.hash==='#'+name)route(true);else location.hash=name;}
  function focusHeading(view){const h=$('view-'+view).querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}window.scrollTo(0,0);}
  function focusContent(){const h=$('view-'+currentView).querySelector('h1');if(h){h.tabIndex=-1;h.focus();}}
  function sessionLabel(s){return modeNames[s.mode]+(s.review?' · vastaukset odottavat palautusta':' · tehtävä '+(s.index+1)+' / '+s.queue.length);}
  function topbar(){
    setText('xp-label',state.xp+' pistettä');$('xp-label').setAttribute('aria-label',state.xp+' oppimispistettä');$('storage-warning').hidden=persistent;
    const banner=!!state.session&&['skills','formulas','settings'].includes(currentView);$('resume-banner').hidden=!banner;
    if(banner)setText('resume-banner-text','Kesken: '+sessionLabel(state.session));
  }
  function scopeFamilies(){return Object.values(P.registry).filter(f=>state.settings.scope==='all'||f.priority==='P1');}
  function renderHome(){
    const families=scopeFamilies(),total=families.length,all=state.settings.scope==='all',stat=id=>state.stats[id];
    const mastered=families.filter(f=>P.mastery(stat(f.id))===3).length,percent=Math.round(mastered/total*100);
    setText('stat-independent',families.reduce((n,f)=>n+(stat(f.id)?.independent||0),0));setText('stat-practiced',families.filter(f=>stat(f.id)?.attempts).length+' / '+total);setText('stat-mastered',mastered);setText('stat-rounds',state.completedRounds);
    setText('practiced-tag',all?'kaikki':'ydin');setText('practiced-label',all?'taitoa harjoiteltu':'ydintaitoa harjoiteltu');setText('mastered-label',all?'vahvistettua taitoa':'vahvistettua ydintaitoa');setText('gauge-caption',all?'kaikista taidoista vahvistettu':'ydintaidoista vahvistettu');
    setText('scope-note','Luvut koskevat valittua sisältöä: '+(all?'kaikki materiaalit, 33 taitoa':'viikkotehtävien ydin, 17 taitoa')+'. Itsenäinen onnistuminen on oikea ratkaisu ensimmäisellä tarkistuksella ilman tukea. Vahvistettu taito vaatii kolme erilaista itsenäistä onnistumista vähintään kahdella kierroksella.');
    $('scope').value=state.settings.scope;$('timed-exam').checked=state.settings.timed;
    setText('lesson-progress',families.filter(f=>state.lessons[f.id]?.completed).length+' / '+total+' opetusta käyty · osaaminen vahvistuu omissa tehtävissä');
    $('mastery-percent').replaceChildren(document.createTextNode(String(percent)),el('span','','%'));setText('mastery-fraction',mastered+' / '+total);$('mastery-arc').setAttribute('stroke-dasharray',percent+' '+(100-percent));$('mastery-arc').style.opacity=percent?1:0;
    $('mastery-gauge').setAttribute('aria-valuenow',String(percent));$('mastery-gauge').setAttribute('aria-valuetext',mastered+' / '+total+(all?' taitoa':' ydintaitoa')+' vahvistettu.');
    const s=state.session,next=s?(s.review?null:P.registry[s.queue[s.index].family]):P.registry[P.Lessons.order.find(id=>families.some(f=>f.id===id)&&!state.lessons[id]?.completed)];
    setText('next-lesson-title',s?(s.review?'Jatketaan: kokeen tarkistus':'Jatketaan: '+next.title):next?.title||'Vahvista osaamistasi');
    const independent=Object.values(state.stats).some(x=>x.independent);
    setText('home-encouragement',mastered?'Osaaminen vahvistuu. Jatka samaan tapaan.':independent?'Hyvä alku. Jokainen oivallus auttaa.':'Ymmärrä ensin. Osaat pian.');
    setText('home-encouragement-note',mastered?mastered+(all?' taitoa':' ydintaitoa')+' vahvistettu eri tehtävillä.':'Katso ilmiö, oivalla idea ja kokeile itse.');
    $('start-learn').classList.toggle('secondary',!!s);$('start-learn').classList.toggle('primary',!s);label($('start-learn'),s?'Aloita uusi kierros':'Opettele alusta','arrow-right');
    $('resume-card').hidden=!s;if(s)setText('resume-description',sessionLabel(s)+'. Uuden kierroksen aloitus kysyy ensin vahvistuksen.');
    document.querySelectorAll('[data-progress]').forEach(node=>{const category=node.dataset.progress,list=families.filter(f=>f.category===category),practiced=list.filter(f=>stat(f.id)?.attempts).length;node.style.width=(list.length?100*practiced/list.length:0)+'%';document.querySelector('[data-topic-meta="'+category+'"]').textContent=practiced+' / '+list.length+(all?' taitoa':' ydintaitoa')+' harjoiteltu';});
  }
  // Keskeneräinen kierros korvataan vasta vahvistuksen jälkeen kaikissa aloituskohdissa.
  function start(mode,topic=null,family=null){
    const begin=()=>{const scope=family&&P.registry[family].priority!=='P1'?'all':state.settings.scope;state.session=P.createSession(state,mode,scope,topic,family);persist();setRoute('play');};
    const s=state.session;if(!s){begin();return;}
    setText('replace-description','Kesken on '+modeNames[s.mode].toLowerCase()+(s.review?', jonka vastaukset odottavat palautusta':', tehtävä '+(s.index+1)+' / '+s.queue.length)+'. Uusi '+modeNames[mode].toLowerCase()+' korvaa sen, eikä keskeneräistä kierrosta voi enää jatkaa.'+(s.mode==='exam'?' Keskeneräistä koetta ei pisteytetä.':' Jo ratkaistut tehtävät säilyvät edistymisessä.'));
    pendingStart=begin;const dialog=$('replace-dialog');dialog.returnValue='cancel';dialog.showModal();
  }
  function renderTable(table){const wrap=el('div','table-wrap'),t=el('table','data-table'),head=el('thead'),hr=el('tr');for(const v of table.headers){const th=el('th','',v);th.scope='col';hr.append(th);}head.append(hr);t.append(head);const body=el('tbody');for(const row of table.rows){const tr=el('tr');row.forEach(v=>tr.append(el('td','',v)));body.append(tr);}t.append(body);wrap.append(t);return wrap;}
  function taskTables(task){
    const nodes=[];if(task.table)nodes.push(renderTable(task.table));
    if(task.diagram?.type==='plot'&&!task.diagram.noTable){const detail=el('details','table-details');detail.append(el('summary','','Näytä kuvaajan arvot tekstitaulukkona'));detail.append(renderTable({headers:['t (s)',task.diagram.yLabel],rows:task.diagram.points.map(p=>p.map(v=>P.format(v,6)))}));nodes.push(detail);}
    return nodes;
  }
  function drawTaskDiagram(){
    const node=$('diagram-container');node.replaceChildren();const d=currentTask.diagram;if(!d)return;
    const forceIndex=currentTask.fields.findIndex(f=>f.type==='forces'),forces=forceIndex<0?{}:state.session.current.answers[forceIndex]||{};
    const frame=el('div');node.append(frame);frame.innerHTML=P.diagramSVG(d.type==='plot'?{...d,width:frame.clientWidth||720}:d,forces);
    if(d.caption)node.append(el('p','diagram-caption',d.caption));
  }
  function examEditing(s=state.session){return !!s?.review&&Number.isInteger(s.editing);}
  function changeAnswer(index,value){
    const s=state.session,cur=s?.current;if(!cur||cur.done)return;
    if(cur.checked[index]&&s.mode!=='exam')return;
    cur.checked[index]=false;
    if(cur.step===index){$('check-answer').hidden=false;$('next-task').hidden=true;}
    cur.answers[index]=value;if(Array.isArray(cur.feedback))cur.feedback[index]=null;
    // Kokeen tarkistusvaiheessa muokkaus tallentuu suoraan palautettaviin vastauksiin.
    if(examEditing(s))s.results[s.editing].answers[index]=value;
    const field=$('field-'+index);field.classList.remove('is-correct','is-wrong');$('field-feedback-'+index).textContent='';$('feedback').hidden=true;persist();
  }
  function renderFields(){
    const container=$('task-fields'),cur=state.session.current;container.replaceChildren();
    currentTask.fields.forEach((field,index)=>{
      if(cur.done||cur.step!==index)return;
      const group=el('fieldset','field');group.id='field-'+index;
      const heading=el('legend','sr-only',field.label);group.append(heading);
      if(field.type==='number'){
        const wrap=el('div','number-input-wrap'),input=el('input');input.type='text';input.inputMode='decimal';input.autocomplete='off';input.spellcheck=false;input.id='answer-'+index;input.setAttribute('aria-label',field.label+(field.unit?', yksikkö '+field.unit:''));input.setAttribute('aria-describedby','precision-'+index+' field-feedback-'+index);input.placeholder='Vastauksesi';input.value=typeof cur.answers[index]==='string'?cur.answers[index]:'';
        input.addEventListener('input',()=>changeAnswer(index,input.value));wrap.append(input,el('span','unit',field.unit||'—'));group.append(wrap);
        const precision=el('p','precision',field.digits===0?'Pyöristä kokonaislukuun tai anna tarkempi vastaus.':`Anna ${field.digits} desimaalia tai tarkempi vastaus.`);precision.id='precision-'+index;
        const tools=el('div','number-entry-tools'),sign=el('button','sign-toggle','±');sign.type='button';sign.setAttribute('aria-label','Vaihda vastauksen etumerkki');sign.addEventListener('click',()=>{if(input.disabled)return;input.value=/^[−-]/.test(input.value)?input.value.slice(1):'−'+input.value;changeAnswer(index,input.value);input.focus({preventScroll:true});});tools.append(sign,precision);group.append(tools);
      }else if(field.type==='choice'){
        const options=el('div','choice-options');for(const option of field.options){const label=el('label','choice-option'),input=el('input');input.type='radio';input.name='answer-'+index;input.value=option.value;input.checked=cur.answers[index]===option.value;input.addEventListener('change',()=>changeAnswer(index,input.value));label.append(input,el('span','',option.label));options.append(label);}group.append(options);
      }else if(field.type==='forces'){
        const grid=el('div','force-grid');for(const name of field.names){const row=el('div','force-row'),label=el('label','',P.forceLabels[name]),select=el('select');select.id='force-'+name;label.htmlFor=select.id;for(const [value,text] of P.directions){const opt=el('option','',text);opt.value=value;select.append(opt);}select.value=cur.answers[index]?.[name]||'none';select.addEventListener('change',()=>{const answers={...(cur.answers[index]||{}),[name]:select.value};changeAnswer(index,answers);drawTaskDiagram();});row.append(label,select);grid.append(row);}group.append(grid,el('p','precision','Valitse ”Ei vaikuta”, jos voimalla ei ole aiheuttajaa tässä tilanteessa. Valitse oikeat suunnat; nuolten pituutta ei arvioida.'));
      }
      const feedback=el('p','field-feedback');feedback.id='field-feedback-'+index;group.append(feedback);container.append(group);
    });
    applyFeedback();
  }
  function applyFeedback(){
    const s=state.session,cur=s.current;
    if(s.mode!=='exam'&&Array.isArray(cur.feedback))cur.feedback.forEach((result,i)=>{if(!result)return;const field=$('field-'+i);if(!field)return;field.classList.toggle('is-correct',result.ok);field.classList.toggle('is-wrong',!result.ok);$('field-feedback-'+i).textContent=result.ok?'✓ Oikein.':result.message;const input=field.querySelector('input[type=text]');if(input)input.setAttribute('aria-invalid',String(!result.ok));});
    if(cur.done||(cur.checked[cur.step]&&s.mode!=='exam'))document.querySelectorAll('#task-fields input,#task-fields select,#task-fields button').forEach(n=>n.disabled=true);
  }
  function feedback(title,message,error=false){const target=$('feedback');target.replaceChildren(el('strong','',title),el('span','',message));target.classList.toggle('error',error);target.hidden=false;}
  function renderSupport(){
    const s=state.session,cur=s.current,exam=s.mode==='exam',list=$('hint-list');list.replaceChildren();
    const active=cur.step>=0&&!cur.done;
    $('step-tools').hidden=cur.step<0&&!cur.done||cur.solution||examEditing(s);
    $('hint-button').hidden=exam||!active;$('solution-button').hidden=exam;$('formula-button').hidden=exam||!active;
    label($('solution-button'),cur.done?'Katso malliratkaisu':'Katso ratkaisu');
    $('support-note').hidden=cur.done;$('skip-task').hidden=!active;
    setText('support-note',exam?'Koekierroksella vihjeet, ratkaisut ja kaavatuki avautuvat palautuksen jälkeen. Ohitetun tehtävän voi täydentää tarkistusvaiheessa ennen palautusta.':cur.hints||cur.formula||cur.solution||cur.tries?'Tämä tehtävä kirjataan tuetuksi harjoitteluksi. Yritä seuraava variantti myöhemmin itsenäisesti.':'Itsenäinen onnistuminen: kaikki oikein ensimmäisellä tarkistuksella ilman vihjeitä, ratkaisua tai kaavatukea. Kaavatuki ja vihjeet kirjaavat tehtävän tuetuksi. Ohita tehtävä vie suoraan seuraavaan.');
    for(let i=0;i<cur.hints&&!cur.done;i++){const card=el('details','hint-item');card.open=i===cur.hints-1;card.append(el('summary','',['1 · Havainto','2 · Yhtälö','3 · Sijoitus'][i]),el('p','',currentTask.hints[i]),legend(currentTask.hints[i],true));list.append(card);}
    setText('hint-button',cur.hints>=3?'Kaikki kolme vihjettä avattu':`Avaa vihje ${cur.hints+1} / 3`);$('hint-button').disabled=cur.hints>=3||cur.done;
    setText('formula-button',cur.formula?'Kaavatuki avattu':'Avaa kaavatuki');$('formula-button').disabled=cur.done||cur.formula;
    $('solution-button').disabled=false;
    $('inline-formulas').hidden=!cur.formula||exam||cur.done;
    if(cur.formula&&!exam)renderMiniFormulas();
  }
  function forceText(answer){return Object.entries(answer||{}).filter(x=>x[1]!=='none').map(([n,d])=>n+': '+P.directionLabel(d)).join('; ')||'Ei valittuja voimia';}
  function answerText(field,raw,correct=false){
    if(field.type==='forces')return forceText(correct?field.answer:raw);
    if(field.type==='choice')return field.options.find(o=>o.value===(correct?field.answer:raw))?.label||'Ei vastausta';
    if(correct)return P.format(field.answer,field.digits)+' '+field.unit;
    const value=P.parse(raw);return Number.isFinite(value)?String(raw)+' '+field.unit:'Ei lukuarvoa';
  }
  function forceComparison(task,answers){
    const index=task.fields.findIndex(f=>f.type==='forces'),wrap=el('div','force-compare');
    for(const [title,forces] of [['Oma voimakuva',answers?.[index]||{}],['Mallin voimakuva',task.fields[index].answer]]){const figure=el('figure'),frame=el('div');frame.innerHTML=P.diagramSVG(task.diagram,forces);figure.append(el('figcaption','force-compare-title',title),frame,el('p','force-compare-text',forceText(forces)));wrap.append(figure);}
    return wrap;
  }
  function solutionBody(task,answers=null){
    const body=el('div'),steps=el('ol','solution-steps');task.steps.forEach(step=>steps.append(el('li','',step)));body.append(steps);
    task.fields.forEach((field,i)=>{const row=el('div','solution-answer');row.append(el('strong','',field.label),el('span','','Oikea vastaus: '+answerText(field,null,true)));if(answers)row.append(el('span','your-answer','Oma vastauksesi: '+answerText(field,answers[i])));body.append(row);});
    body.append(el('p','conclusion',task.conclusion));return body;
  }
  function renderSolution(){
    const panel=$('solution-panel'),cur=state.session.current;panel.hidden=!cur.solution;panel.replaceChildren();
    if(cur.solution){const i=Math.min(cur.solutionStep||0,currentTask.steps.length-1);const force=currentTask.fields.find(f=>f.type==='forces');if(i===0&&force){const figure=el('figure','solution-figure'),diagram=el('div');diagram.innerHTML=P.diagramSVG(currentTask.diagram,force.answer);figure.append(el('figcaption','force-compare-title','Mallin voimakuva'),diagram);panel.append(figure);}panel.append(el('p','solution-step-text',currentTask.steps[i]),legend(currentTask.steps[i],true));if(i===currentTask.steps.length-1)panel.append(el('p','conclusion',currentTask.conclusion));}
  }
  function renderPath(active){
    const path=$('lesson-path');path.hidden=active===null;path.replaceChildren();if(active===null)return;
    const list=el('ol');lessonSteps.forEach((text,i)=>{const item=el('li',i<active?'done':i===active?'active':'',text);if(i===active)item.setAttribute('aria-current','step');list.append(item);});
    path.append(el('span','sr-only','Opetuksen vaiheet'),list);
  }
  function setProgress(fraction,text){
    const s=state.session,percent=s.review&&!examEditing(s)?100:(s.index+fraction)/s.queue.length*100;
    $('session-progress').firstElementChild.style.width=percent+'%';$('session-progress').setAttribute('aria-valuenow',String(Math.round(percent)));$('session-progress').setAttribute('aria-valuetext',text);
  }
  function hideTaskParts(){
    for(const id of ['task-intro','task-fields','step-tools','solution-panel','feedback','task-constants','lesson-button','exam-review','lesson-panel'])$(id).hidden=true;
    $('task-source').closest('details').hidden=true;$('play-layout').classList.remove('has-context');
  }
  function renderTeaching(){
    const s=state.session,cur=s.current,module=P.Lessons.module(currentTask.family),pages=P.Lessons.pages(currentTask),example=P.Lessons.example(currentTask);
    if(!Number.isInteger(cur.lessonPage)||cur.lessonPage<0||cur.lessonPage>=pages.length)cur.lessonPage=0;
    const page=pages[cur.lessonPage],panel=$('lesson-panel');hideTaskParts();panel.hidden=false;panel.replaceChildren();$('task-fields').replaceChildren();
    setText('session-mode',modeNames[s.mode]+' · opettele ja kokeile');setText('session-count','Aihe '+(s.index+1)+' / '+s.queue.length);
    setText('wizard-step-label',`Opetus ${cur.lessonPage+1} / ${pages.length}`);setText('task-tag',currentTask.category+' · '+currentTask.title);setText('task-title',page.title);setText('task-time','Oma tahti');
    setProgress(.5*cur.lessonPage/pages.length,'Aihe '+(s.index+1)+' / '+s.queue.length+', opetussivu '+(cur.lessonPage+1)+' / '+pages.length);
    renderPath(page.type==='observe'?0:page.type==='principle'?1:page.type==='prediction'?3:2);
    narrationText='';
    if(page.type==='observe'||page.type==='principle'){
      const copy=page.type==='observe'?module.observe:module.principle;
      panel.append(el('p','lesson-copy',copy));const demo=el('div','lesson-demo');panel.append(demo);
      const parameter=Number.isFinite(cur.lessonParameter)&&cur.lessonParameter>=module.parameter.min&&cur.lessonParameter<=module.parameter.max?cur.lessonParameter:module.parameter.value;
      lessonCleanup=P.mountLessonDemo(demo,module,{parameter,onParameter:value=>{cur.lessonParameter=value;persist();}});
      if(page.type==='principle')panel.append(el('div','lesson-formula',module.formula),legend(module.formula));
      narrationText=copy+(page.type==='principle'?' '+module.formula:'');
    }else if(page.type==='example'||page.type==='worked'){
      panel.append(el('p','lesson-example-label','OPETUSESIMERKKI · omassa tehtävässä on eri luvut'));
      if(page.type==='example'){
        panel.append(el('p','lesson-example-context',example.context));
        if(example.diagram){const frame=el('div','lesson-example-diagram');const force=example.fields.find(f=>f.type==='forces');const diagram=example.diagram.type==='plot'?{...example.diagram,width:panel.clientWidth||Math.min(window.innerWidth-44,466)}:example.diagram;frame.innerHTML=P.diagramSVG(diagram,force?.answer||{});panel.append(frame);}
        if(example.table)panel.append(renderTable(example.table));
        panel.append(el('p','lesson-copy','Seuraavaksi näet ratkaisun yhden vaiheen kerrallaan. Mieti jokaisessa kohdassa, miksi juuri tämä yhtälö sopii tilanteeseen.'));
        narrationText=example.context+' Seuraavaksi käymme ratkaisun vaiheittain.';
      }else{
        const recap=el('div','context-details');recap.append(el('p','lesson-example-context',example.context));panel.append(recap);
        panel.append(el('div','lesson-worked-step',page.text),legend(page.text,true));
        if(page.index===example.steps.length-1)panel.append(el('p','conclusion',example.conclusion));
        narrationText=page.text;
      }
    }else{
      panel.append(el('p','lesson-copy',module.question));const choices=el('div','lesson-choices');
      const order=P.random((currentTask.seed^0xf075)>>>0).shuffle(module.options.map((_,i)=>i));
      order.forEach(index=>{const button=el('button','lesson-choice',module.options[index]);button.type='button';button.dataset.lessonAnswer=index;button.setAttribute('aria-pressed',String(cur.lessonAnswer===index));if(cur.lessonAnswer===index)button.classList.add(index===module.correct?'correct':'incorrect');button.addEventListener('click',()=>{cur.lessonAnswer=index;persist();P.Media.tone(index===module.correct?'success':'think');renderTask();document.querySelector('[data-lesson-answer="'+index+'"]').focus({preventScroll:true});});choices.append(button);});panel.append(choices);
      if(cur.lessonAnswer!==null&&cur.lessonAnswer!==undefined){const response=el('div','lesson-check '+(cur.lessonAnswer===module.correct?'correct':'incorrect'));response.setAttribute('role','status');response.append(el('strong','',cur.lessonAnswer===module.correct?'Juuri näin.':'Tutkitaan ajatusta vielä.'),el('p','',module.explain));panel.append(response);}
      panel.append(el('p','quiet','Tämä on ymmärryksen tarkistus. Se ei kirjaa harjoitussuoritusta.'));narrationText=module.question+(cur.lessonAnswer!==null?' '+module.explain:'');
    }
    $('previous-step').hidden=cur.lessonPage===0;label($('previous-step'),'Takaisin',null,'arrow-left');$('check-answer').hidden=true;$('next-task').hidden=false;$('next-task').disabled=page.type==='prediction'&&cur.lessonAnswer!==module.correct;
    label($('next-task'),page.type==='prediction'?'Kokeile itse uusilla luvuilla':page.type==='observe'?'Miksi näin?':page.type==='principle'?'Katso laskuesimerkki':page.type==='example'?'Avaa ensimmäinen ratkaisuvaihe':'Seuraava vaihe','arrow-right');
    audioUI();voiceCleanup=P.Media.voicesChanged(audioUI);
  }
  function renderExamReview(){
    const s=state.session,panel=$('exam-review');hideTaskParts();renderPath(null);$('lesson-audio').hidden=true;panel.hidden=false;panel.replaceChildren();
    setText('session-mode',modeNames.exam);setText('session-count','Tarkistus ennen palautusta');setProgress(1,'Kaikki tehtävät käyty, tarkistus ennen palautusta');
    setText('wizard-step-label','Tarkista ja palauta');setText('task-tag','');setText('task-title','Tarkista vastauksesi.');updateClock();
    let missing=0;const list=el('ol','exam-review-list');
    s.results.forEach((record,i)=>{
      const task=P.generate(record.family,record.seed),item=el('li','exam-review-item'),answered=task.fields.filter((f,j)=>f.type==='forces'?Object.values(record.answers[j]||{}).some(v=>v!=='none'):record.answers[j]!==null&&record.answers[j]!==undefined&&record.answers[j]!=='').length;
      missing+=task.fields.length-answered;
      const head=el('div','exam-review-head');head.append(el('h2','',(i+1)+'. '+task.title),el('span','exam-review-status'+(answered<task.fields.length?' incomplete':''),answered+' / '+task.fields.length+' kohtaa vastattu'));
      const answers=el('dl','exam-review-answers');task.fields.forEach((field,j)=>answers.append(el('dt','',field.label),el('dd','',answerText(field,record.answers[j]))));
      const edit=el('button','step-tool');edit.type='button';label(edit,'Muokkaa vastausta','arrow-right');edit.setAttribute('aria-label','Muokkaa tehtävän '+(i+1)+' vastausta');edit.addEventListener('click',()=>editExamTask(i));
      item.append(head,answers,edit);list.append(item);
    });
    panel.append(el('p','lead',missing?'Vastaamatta on vielä '+missing+(missing===1?' kohta':' kohtaa')+'. Voit täydentää vastauksia ennen palautusta.':'Kaikkiin kohtiin on vastattu. Voit vielä muokata vastauksia ennen palautusta.'),el('p','muted','Oikeat vastaukset, pisteet ja ratkaisut näytetään vasta palautuksen jälkeen.'),list);
    $('previous-step').hidden=true;$('check-answer').hidden=true;$('next-task').hidden=false;$('next-task').disabled=false;label($('next-task'),'Palauta koe','arrow-right');
  }
  function editExamTask(i){const s=state.session;if(!s?.review)return;s.editing=i;s.current={...P.blankCurrent(),answers:JSON.parse(JSON.stringify(s.results[i].answers)),teaching:false,step:0};persist();renderTask();focusStep();}
  function exitExamEdit(){const s=state.session;if(!s?.review)return;s.editing=null;s.current=P.blankCurrent();persist();renderTask();focusStep();}
  function renderTask(){
    stopLessonMedia();
    const s=state.session;if(!s){setRoute('home');return;}
    if(s.review&&!examEditing(s)){renderExamReview();return;}
    const q=s.review?s.queue[s.editing]:s.queue[s.index];currentTask=P.generate(q.family,q.seed);const cur=s.current;
    let migrated=false;
    if(!Array.isArray(cur.feedback)){cur.feedback=[];migrated=true;}
    if(!Array.isArray(cur.checked)){cur.checked=cur.feedback.map(g=>!!g?.ok);migrated=true;}
    if(!Number.isInteger(cur.step)||cur.step< -1||cur.step>=currentTask.fields.length){cur.step=-1;migrated=true;}
    if(!Number.isInteger(cur.solutionStep)||cur.solutionStep<0||cur.solutionStep>=currentTask.steps.length){cur.solutionStep=0;migrated=true;}
    if(typeof cur.teaching!=='boolean'){cur.teaching=['learn','topic'].includes(s.mode)&&!state.lessons[q.family]?.completed&&cur.step<0&&!cur.done&&!cur.answers.some(v=>v!==null&&v!==undefined&&v!=='');cur.lessonPage=0;cur.lessonAnswer=null;migrated=true;}
    if(s.mode==='exam'||s.mode==='baseline'||s.mode==='weak')cur.teaching=false;
    if(migrated&&!persist())return;
    if(cur.teaching){renderTeaching();return;}
    $('exam-review').hidden=true;$('lesson-panel').hidden=true;$('lesson-panel').replaceChildren();$('next-task').disabled=false;audioUI();
    $('lesson-button').hidden=s.mode==='exam'||cur.done;label($('lesson-button'),cur.step>=0?'Kertaa opetus · kirjataan tuetuksi':'Kertaa opetus',null,'reset');
    const intro=cur.step<0&&!cur.done,reviewing=cur.done&&cur.solution,field=currentTask.fields[cur.step],editing=examEditing(s);
    setText('session-mode',modeNames[s.mode]);setText('session-count',editing?'Tarkistus · tehtävä '+(s.editing+1)+' / '+s.queue.length:'Tehtävä '+(s.index+1)+' / '+s.queue.length);
    const taskFraction=cur.done?1:intro?0:(cur.step+1)/(currentTask.fields.length+1),fraction=cur.fromLesson?.5+.5*taskFraction:taskFraction;
    setProgress(fraction,(editing?'Tarkistus, tehtävä ':'Tehtävä ')+((editing?s.editing:s.index)+1)+' / '+s.queue.length);
    renderPath(cur.fromLesson&&!cur.done?4:null);
    setText('task-tag',currentTask.category+' · '+currentTask.title);
    setText('wizard-step-label',reviewing?`Malliratkaisu ${cur.solutionStep+1} / ${currentTask.steps.length}`:cur.done?'Tehtävä valmis':intro?'Tutustu tilanteeseen':`Vaihe ${cur.step+1} / ${currentTask.fields.length} · ${field.type==='number'?'Laske':field.type==='forces'?'Rakenna voimakuva':'Päättele'}`);
    setText('task-title',reviewing?'Näin ratkaisu etenee.':cur.done?doneTitles[cur.record.outcome]:intro?currentTask.title:field.label);setText('task-context',currentTask.context);
    $('task-intro').hidden=cur.done;$('task-fields').hidden=intro||cur.done;$('play-layout').classList.toggle('has-context',!cur.done);
    $('task-givens').replaceChildren(...(currentTask.givens||[]).map(g=>el('span','given',g)),legend((currentTask.givens||[]).join(' ; '),true));
    $('visual-details').hidden=!currentTask.diagram&&!currentTask.table;
    const autoVisual=intro||!!currentTask.table||currentTask.diagram?.type==='plot'||currentTask.diagram?.type==='vector'||field?.type==='forces';
    $('visual-details').open=typeof cur.visualOpen==='boolean'?cur.visualOpen:autoVisual;
    $('task-constants').hidden=cur.done||!currentTask.fields.some(f=>f.type==='number'||f.type==='forces');
    $('task-source').closest('details').hidden=!intro;
    drawTaskDiagram();$('table-container').replaceChildren(...taskTables(currentTask));renderFields();renderSupport();renderSolution();
    setText('task-source','Lähdepohja: '+currentTask.source+' · variantti '+currentTask.family+' / '+currentTask.seed);
    $('feedback').hidden=true;
    if(cur.done&&!reviewing){const o=cur.record.outcome;feedback(o==='independent'?'Oikein — itsenäisesti!':o==='assisted'?'Ratkaistu tuella — taito kehittyy.':'Ratkaisu käyty läpi.',o==='assisted'?currentTask.conclusion+' Kokeile seuraavaa varianttia myöhemmin ilman tukea.':currentTask.conclusion);}
    else if(!intro&&!cur.done&&s.mode!=='exam'&&cur.feedback?.[cur.step]){
      if(cur.feedback[cur.step].ok)feedback('Oikein.','Jatka seuraavaan ratkaisuvaiheeseen.');
      else feedback('Kokeillaan tätä kohtaa uudelleen.',cur.feedback[cur.step].message,true);
    }
    const canContinue=intro||cur.done||!!cur.checked[cur.step];
    $('check-answer').hidden=canContinue;$('next-task').hidden=!canContinue;
    $('previous-step').hidden=editing?false:intro||cur.done&&!reviewing;
    label($('previous-step'),editing&&cur.step<=0?'Tarkistukseen':reviewing&&cur.solutionStep===0?'Yhteenvetoon':cur.step===0?'Tilanteeseen':'Takaisin',null,'arrow-left');
    label($('check-answer'),editing?(cur.step===currentTask.fields.length-1?'Tallenna ja palaa tarkistukseen':'Tallenna ja jatka'):s.mode==='exam'?'Tallenna ja jatka':'Tarkista','arrow-right');
    label($('next-task'),intro?'Aloita ratkaiseminen':reviewing&&cur.solutionStep<currentTask.steps.length-1?'Seuraava ratkaisuvaihe':!cur.done?'Jatka':s.index===s.queue.length-1?'Näytä kierroksen tulokset':'Seuraava tehtävä','arrow-right');updateClock();
  }
  function emptyAnswer(field,raw){return field.type==='number'?!Number.isFinite(P.parse(raw)):field.type==='choice'?!field.options.some(o=>o.value===raw):false;}
  function submit(){
    const s=state.session;if(!s||s.current.done||s.current.teaching)return;const cur=s.current,index=cur.step,field=currentTask.fields[index];if(!field)return;
    if(cur.checked[index]&&s.mode!=='exam')return;
    if(s.mode==='exam'){
      if(emptyAnswer(field,cur.answers[index])){feedback('Vastaus on vielä kesken.','Anna vastaus tähän vaiheeseen. Oikeellisuus näytetään palautuksen jälkeen.',true);return;}
      cur.checked[index]=true;
      if(index<currentTask.fields.length-1){cur.step++;persist();renderTask();focusStep();return;}
      if(examEditing(s)){exitExamEdit();return;}
      const ok=P.grade(currentTask,cur.answers).every(x=>x.ok);P.record(state,s,currentTask,ok?'independent':'wrong',cur.answers);advance();return;
    }
    // Tyhjää tai luvuksi kelpaamatonta vastausta ei lasketa ratkaisuyritykseksi.
    if(emptyAnswer(field,cur.answers[index])){
      const blank=cur.answers[index]===null||cur.answers[index]===undefined||String(cur.answers[index]).trim()==='';
      feedback('Vastausta ei tarkistettu.',field.type==='choice'?'Valitse vaihtoehto. Tyhjää vastausta ei lasketa yritykseksi.':blank?'Kirjoita vastaus ennen tarkistusta. Tyhjää vastausta ei lasketa yritykseksi.':'Kirjoita luku ilman yksikköä, esimerkiksi 12,5. Pilkku, piste ja e-merkintä käyvät. Tätä ei lasketa yritykseksi.',true);
      $('task-fields').querySelector('input')?.focus({preventScroll:true});return;
    }
    const result=P.checkField(field,cur.answers[index]);cur.feedback[index]=result;cur.checked[index]=result.ok;
    if(result.ok&&currentTask.fields.every((_,i)=>cur.checked[i])){const outcome=cur.hints||cur.formula||cur.tries?'assisted':'independent';P.record(state,s,currentTask,outcome,cur.answers);}
    else if(!result.ok)cur.tries++;
    P.Media.tone(result.ok?'success':'think');
    if(!persist())return;renderTask();topbar();
    if(result.ok){if(cur.done)focusStep();else $('next-task').focus({preventScroll:true});}
    else{const input=$('task-fields').querySelector('input,select');if(input)input.focus({preventScroll:true});}
  }
  // Siirrytään vaiheen otsikkoon vain, jos se ei jo ole näkyvissä.
  function focusStep(){
    const head=document.querySelector('.play-head'),top=head.getBoundingClientRect().top;
    if(top<0||top>window.innerHeight*.45)window.scrollTo(0,Math.max(0,window.scrollY+top-12));
    const h=$('task-title');h.tabIndex=-1;h.focus({preventScroll:true});
  }
  function moveForward(){
    const s=state.session,cur=s?.current;if(!cur)return;
    if(s.review&&!examEditing(s)){const summary=P.finishExam(state);if(!summary)return;lastSummary=summary;persist();setRoute('results');return;}
    if(cur.teaching){
      const pages=P.Lessons.pages(currentTask),module=P.Lessons.module(currentTask.family);
      if(cur.lessonPage===pages.length-1){if(cur.lessonAnswer!==module.correct)return;state.lessons[currentTask.family]={completed:true,at:Date.now()};cur.teaching=false;cur.fromLesson=true;cur.step=Number.isInteger(cur.lessonReturnStep)?cur.lessonReturnStep:-1;delete cur.lessonReturnStep;}
      else cur.lessonPage++;
      P.Media.tone();persist();renderTask();focusStep();return;
    }
    if(cur.done){if(cur.solution&&cur.solutionStep<currentTask.steps.length-1){cur.solutionStep++;persist();renderTask();focusStep();}else advance();return;}
    if(cur.step<0||cur.checked[cur.step]){cur.step++;persist();renderTask();focusStep();}
  }
  function moveBack(){
    const s=state.session,cur=s?.current;if(!cur)return;
    if(examEditing(s)&&cur.step<=0){exitExamEdit();return;}
    if(cur.teaching){if(cur.lessonPage>0){cur.lessonPage--;persist();renderTask();focusStep();}return;}
    if(cur.done){if(!cur.solution)return;if(cur.solutionStep>0)cur.solutionStep--;else cur.solution=false;}
    else if(cur.step>=0)cur.step--;
    persist();renderTask();focusStep();
  }
  function advance(){const summary=P.advance(state);persist();if(summary){lastSummary=summary;setRoute('results');}else{renderTask();topbar();focusStep();}}
  // Ohittaminen vie suoraan seuraavaan tehtävään; ratkaisun voi katsoa erikseen.
  function skip(){
    const s=state.session;if(!s||s.current.done||s.current.teaching)return;
    if(examEditing(s)){exitExamEdit();return;}
    P.record(state,s,currentTask,'skipped',s.current.answers);advance();topbar();
  }
  function renderResults(){
    const summary=lastSummary;if(!summary){setRoute('home');return;}
    const c=P.summarize(summary),exam=summary.mode==='exam',solved=c.independent+c.assisted;
    setText('results-eyebrow',exam?'KOKEEN TULOS':'HYVÄ HETKI HUOMATA EDISTYMINEN');
    setText('results-title',exam?'Koe palautettu.':solved===c.total?'Kierros ratkaistu.':solved===0?'Kierros käyty läpi.':'Kierros valmis.');
    setText('results-description',modeNames[summary.mode]+' · '+c.total+' tehtävää · noin '+summary.minutes+' min. '+(c.independent===c.total?'Kaikki tehtävät ratkesivat itsenäisesti. Kokeile myöhemmin uusia variantteja.':solved===0?'Tällä kierroksella ei ratkaistu tehtäviä. Avaa ratkaisut alta ja kokeile sitten uusilla luvuilla.':'Vihjeet, ohitukset ja virheet näyttävät, mitä kannattaa harjoitella seuraavaksi.'));
    const cards=exam?[[c.independent,'oikein'],[c.wrong,'väärin'],[c.skipped,'vastaamatta']]:[[c.independent,'itsenäisesti oikein'],[c.assisted,'oikein tuella'],[c.reviewed,'ratkaisu katsottu'],[c.skipped+c.wrong,'ohitettu']];
    const stats=$('result-stats');stats.replaceChildren();cards.forEach(([value,text],i)=>{if(i&&!value)return;const card=el('div','result-stat');card.append(el('strong','',value+' / '+c.total),el('span','',text));stats.append(card);});
    const review=$('result-review');review.replaceChildren();
    for(const [i,record] of (summary.results||[]).entries()){
      const task=P.generate(record.family,record.seed),details=el('details','review-card'),title=el('summary','',(i+1)+'. '+task.title);title.append(el('span','review-badge outcome-'+record.outcome,(exam&&examOutcomes[record.outcome])||outcomes[record.outcome]));details.append(title);
      let populated=false;details.addEventListener('toggle',()=>{
        if(!details.open||populated)return;populated=true;const body=el('div','review-body');body.append(el('p','review-context',task.context));details.append(body);
        if(task.fields.some(f=>f.type==='forces'))body.append(forceComparison(task,record.answers));
        else if(task.diagram){const chart=el('div');body.append(chart);chart.innerHTML=P.diagramSVG(task.diagram.type==='plot'?{...task.diagram,width:chart.clientWidth||720}:task.diagram);if(task.diagram.caption)body.append(el('p','diagram-caption',task.diagram.caption));}
        body.append(...taskTables(task),solutionBody(task,record.answers));
      });review.append(details);
    }
  }
  function renderSkills(){
    const category=$('skill-category').value,priority=$('skill-priority').value,list=$('skills-list');list.replaceChildren();
    for(const family of Object.values(P.registry).filter(f=>(category==='all'||f.category===category)&&(priority==='all'||f.priority==='P1'))){
      const stats=state.stats[family.id],level=P.mastery(stats),lesson=!!state.lessons[family.id]?.completed,row=el('article','skill-row level-'+level),copy=el('div','skill-copy');row.dataset.family=family.id;
      copy.append(el('h3','',family.title),el('p','skill-status level-'+level,stats?P.masteryLabel(stats):lesson?'Opetus käyty · oma tehtävä kokeilematta':'Ei vielä aloitettu'));
      const steps=el('ol','skill-steps');[['Opetus käyty',lesson],['Harjoittelu aloitettu',level>=1],['Itsenäinen onnistuminen',level>=2],['Vahvistettu taito',level>=3]].forEach(([text,done])=>{const item=el('li',done?'done':'');item.append(done?icon('check'):el('span','step-dot'),el('span','',text));steps.append(item);});
      const more=el('details','skill-more');more.append(el('summary','','Lisätiedot'),el('p','','Tunniste '+family.id+' · '+family.category+' · '+(stats?stats.independent+' itsenäisesti, '+stats.assisted+' tuella, '+stats.attempts+' harjoitusta':'ei vielä suorituksia')));
      const button=el('button','skill-button');button.type='button';label(button,'Harjoittele','arrow-right');button.setAttribute('aria-label','Harjoittele: '+family.title);button.addEventListener('click',()=>start('topic',family.category,family.id));
      copy.append(steps,more);row.append(copy,button);list.append(row);
    }
    if(!list.children.length)list.append(el('p','empty-state','Tässä aiheessa ei ole ydintehtäviä. Valitse ”Kaikki materiaalit”.'));
    const history=$('history-list'),rounds=state.history.slice().reverse();history.replaceChildren();
    for(const round of rounds.slice(0,historyLimit)){const row=el('div','history-item');row.append(el('span','',new Date(round.at).toLocaleString('fi-FI',{day:'numeric',month:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})+' · '+modeNames[round.mode]),el('span','',round.independent+' / '+round.total+' itsenäisesti'));if(round.results){const button=el('button','');button.type='button';label(button,'Näytä ratkaisut','arrow-right');button.addEventListener('click',()=>{lastSummary=round;setRoute('results');});row.append(button);}history.append(row);}
    if(!rounds.length)history.append(el('p','empty-state','Ensimmäinen valmis kierros ilmestyy tähän. Oppimishistoria alkaa omista suorituksistasi.'));
    setText('history-count',rounds.length?'Näytetään '+Math.min(historyLimit,rounds.length)+' / '+rounds.length:'');
    $('history-more').hidden=rounds.length<=historyLimit;setText('history-more','Näytä lisää ('+Math.max(0,rounds.length-historyLimit)+' jäljellä)');
  }
  function renderFormulas(){
    const target=$('formula-cards');target.replaceChildren();formulas.forEach(item=>{const card=el('article','formula-card');card.append(el('h2','',item.title),el('div','formula-expression',item.expression),legend(item.expression),el('p','',item.note));target.append(card);});
    const s=state.session,cur=s?.current,active=!!s&&s.mode!=='exam'&&!s.review&&!cur.done&&!cur.teaching;$('formula-session').hidden=!active;
    if(active){const task=P.generate(s.queue[s.index].family,s.queue[s.index].seed);$('formula-use').hidden=cur.formula;setText('formula-session-text',cur.formula?'Kaavatuki on jo käytössä kesken olevassa tehtävässä ”'+task.title+'”. Se kirjataan tuetuksi.':'Kesken: ”'+task.title+'”. Kaavojen selaaminen täällä ei vaikuta siihen. Jos haluat kaavat näkyviin tehtävän yhteyteen, valitse alta – tehtävä kirjataan silloin tuetuksi.');}
  }
  function renderMiniFormulas(){const node=$('inline-formulas');node.replaceChildren();const relevant=currentTask.category==='Kitka'?[0,2,3,4]:currentTask.category==='Liike'?[5,6,7]:[0,1,4,8];for(const i of relevant){const item=formulas[i],card=el('div','formula-mini');card.append(el('strong','',item.title),el('p','formula-mini-expression',item.expression),legend(item.expression),el('p','',item.note));node.append(card);}}
  function updateClock(){
    if(!state.session||currentView!=='play')return;const s=state.session;
    if(!s.timed){if(!s.current.teaching)setText('task-time',s.review?'':'Oma tahti');return;}
    const remaining=Math.max(0,1800-Math.floor((Date.now()-s.started)/1000));setText('task-time',remaining?'Tavoiteaikaa '+Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'):'Tavoiteaika täynnä · jatka rauhassa');
  }
  function route(moveFocus=false){
    stopLessonMedia();
    let name=location.hash.slice(1)||'home';
    if(name==='main'){history.replaceState(null,'','#'+currentView);focusContent();return;}
    if(!views.includes(name))name='home';
    if(name==='play'&&!state.session)name='home';if(name==='results'&&!lastSummary)name='home';
    if(name==='formulas'&&state.session?.mode==='exam'){name='play';history.replaceState(null,'','#play');}
    currentView=name;document.querySelectorAll('.view').forEach(view=>view.hidden=view.id!=='view-'+name);
    document.body.classList.toggle('is-studying',name==='play');
    document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(name==='play'||name==='results'?'home':name))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(name==='home')renderHome();else if(name==='play')renderTask();else if(name==='results')renderResults();else if(name==='skills')renderSkills();else if(name==='formulas')renderFormulas();else if(name==='settings')audioUI();
    document.title=(name==='play'&&currentTask?currentTask.title:name==='settings'?'Asetukset':name==='skills'?'Osaamiseni':name==='formulas'?'Kaavakortit':name==='results'?'Kierroksen tulokset':'Opi ratkaisemaan')+' — Fysiikan viikkokoe 2';topbar();if(moveFocus||name==='play')focusHeading(name);
  }
  function setVolume(value){state.settings.volume=Number(value)/100;persist();audioUI();}
  function commitVolume(){if(speech!=='speaking')return;if(state.settings.volume===0)P.Media.stopSpeech();else P.Media.resume();}
  function setVoice(value){state.settings.voice=value;persist();P.Media.say('Tältä kuulostaa selostus.');audioUI();}
  function toggleSound(){state.settings.sound=!state.settings.sound;persist();audioUI();if(state.settings.sound)P.Media.tone();}
  $('start-learn').addEventListener('click',()=>start('learn'));$('start-baseline').addEventListener('click',()=>start('baseline'));$('start-weak').addEventListener('click',()=>start('weak'));$('start-exam').addEventListener('click',()=>start('exam'));
  document.querySelectorAll('[data-topic]').forEach(button=>button.addEventListener('click',()=>start('topic',button.dataset.topic)));
  $('resume-home').addEventListener('click',()=>setRoute('play'));$('resume-top').addEventListener('click',()=>setRoute('play'));$('back-home').addEventListener('click',()=>{persist();setRoute('home');});
  $('replace-dialog').addEventListener('close',()=>{const value=$('replace-dialog').returnValue,go=pendingStart;pendingStart=null;if(value==='confirm')go?.();else if(value==='resume')setRoute('play');});
  $('scope').addEventListener('change',()=>{state.settings.scope=$('scope').value;persist();renderHome();});$('timed-exam').addEventListener('change',()=>{state.settings.timed=$('timed-exam').checked;persist();});
  $('answer-form').addEventListener('submit',event=>{event.preventDefault();submit();});$('next-task').addEventListener('click',moveForward);$('previous-step').addEventListener('click',moveBack);$('skip-task').addEventListener('click',skip);
  $('hint-button').addEventListener('click',()=>{const cur=state.session?.current;if(!cur||cur.done||state.session.mode==='exam'||cur.hints>=3)return;cur.hints++;persist();renderSupport();$('hint-list').lastElementChild?.scrollIntoView({behavior:'smooth',block:'nearest'});});
  $('solution-button').addEventListener('click',()=>{const cur=state.session?.current;if(!cur||state.session.mode==='exam')return;cur.solution=true;cur.solutionStep=0;if(!cur.done)P.record(state,state.session,currentTask,'reviewed',cur.answers);persist();renderTask();topbar();focusStep();});
  $('formula-button').addEventListener('click',()=>{const cur=state.session?.current;if(!cur||cur.done||state.session.mode==='exam')return;cur.formula=true;persist();renderSupport();$('inline-formulas').scrollIntoView?.({behavior:'smooth',block:'nearest'});});
  $('formula-use').addEventListener('click',()=>{const cur=state.session?.current;if(!cur||cur.done||cur.teaching||state.session.mode==='exam')return;cur.formula=true;persist();setRoute('play');});
  // Käyttäjän valitsema paneelien aukiolo säilyy tehtävän vaiheiden ja tarkistuksen yli.
  $('visual-details').querySelector('summary').addEventListener('click',()=>{const cur=state.session?.current;if(cur){cur.visualOpen=!$('visual-details').open;persist();}});
  $('results-weak').addEventListener('click',()=>{if(lastSummary?.results?.some(r=>P.registry[r.family].priority!=='P1'))state.settings.scope='all';start('weak');});
  $('skill-category').addEventListener('change',renderSkills);$('skill-priority').addEventListener('change',renderSkills);
  $('history-more').addEventListener('click',()=>{historyLimit+=10;renderSkills();});
  $('reset-progress').addEventListener('click',()=>{$('reset-dialog').returnValue='cancel';$('reset-dialog').showModal();});
  $('reset-dialog').addEventListener('close',()=>{if($('reset-dialog').returnValue!=='confirm')return;const prefs={...state.settings};state=P.emptyState();Object.assign(state.settings,{theme:prefs.theme,sound:prefs.sound,volume:prefs.volume,...(prefs.voice?{voice:prefs.voice}:{})});P.mediaSettings=state.settings;lastSummary=null;historyLimit=10;P.clear();persist();setRoute('home');});
  $('lesson-button').addEventListener('click',()=>{const cur=state.session?.current;if(!cur||cur.done||state.session.mode==='exam')return;if(cur.step>=0)cur.formula=true;cur.lessonReturnStep=cur.step;cur.teaching=true;cur.lessonPage=0;cur.lessonAnswer=null;cur.lessonParameter=null;persist();renderTask();focusStep();});
  $('sound-toggle').addEventListener('click',toggleSound);$('settings-sound-toggle').addEventListener('click',toggleSound);
  $('settings-voice').addEventListener('change',()=>setVoice($('settings-voice').value));$('settings-voice-test').addEventListener('click',()=>P.Media.say('Tältä kuulostaa selostus.'));P.Media.voicesChanged(()=>{if(currentView==='settings')audioUI();});
  for(const id of ['sound-volume','settings-volume']){$(id).addEventListener('input',()=>setVolume($(id).value));$(id).addEventListener('change',commitVolume);}
  $('narrate-lesson').addEventListener('click',()=>{if(!state.session?.current.teaching||!P.Media.voice()||state.settings.volume<=0)return;if(P.Media.say(narrationText,{onState:value=>{speech=value==='stopped'?'idle':value;audioUI();}})){speech='speaking';audioUI();$('stop-narration').focus({preventScroll:true});}});
  $('stop-narration').addEventListener('click',()=>{P.Media.stopSpeech();speech='idle';audioUI();$('narrate-lesson').focus({preventScroll:true});});
  $('theme-toggle').addEventListener('click',()=>{state.settings.theme=state.settings.theme==='light'?'dark':'light';applyTheme();persist();});
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();focusContent();});
  $('view-play').addEventListener('keydown',event=>{if(event.key==='Escape'&&event.target.tagName!=='SELECT'&&!event.defaultPrevented){event.preventDefault();persist();setRoute('home');}});
  $('answer-form').addEventListener('keydown',event=>{if(event.key==='Enter'&&!$('next-task').hidden&&!$('next-task').disabled&&!['SELECT','BUTTON','SUMMARY','A'].includes(event.target.tagName)){event.preventDefault();moveForward();}});
  function sizeViewport(){const viewport=window.visualViewport;if(!viewport)return;document.documentElement.style.setProperty('--viewport-height',viewport.height+'px');document.documentElement.style.setProperty('--viewport-top',viewport.offsetTop+'px');document.documentElement.classList.toggle('keyboard-open',viewport.height<window.innerHeight*.72);}
  window.visualViewport?.addEventListener('resize',sizeViewport);window.visualViewport?.addEventListener('scroll',sizeViewport);sizeViewport();
  window.addEventListener('storage',event=>{if(event.key!==P.STORAGE_KEY||!event.newValue)return;try{const raw=JSON.parse(event.newValue);if(Number.isInteger(raw?.rev)&&raw.rev>knownRev)adoptExternal(raw);}catch{}});
  window.addEventListener('hashchange',()=>route(true));window.addEventListener('pagehide',()=>{persist();stopLessonMedia();});window.addEventListener('pageshow',event=>{if(event.persisted&&currentView==='play')renderTask();});window.addEventListener('resize',()=>{if(currentView==='play'&&!state.session?.current.teaching&&currentTask?.diagram?.type==='plot')drawTaskDiagram();});setInterval(updateClock,1000);applyTheme();audioUI();route();
  // Latausnäkymä poistuu, kun fontti on valmis; lyhyt vähimmäisaika estää välähdyksen.
  const preloader=$('preloader'),loadStart=Date.now();
  if(preloader)Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(resolve=>setTimeout(resolve,2500))]).then(()=>setTimeout(()=>{preloader.classList.add('is-done');setTimeout(()=>preloader.remove(),400);},Math.max(0,450-(Date.now()-loadStart))));
})(window.Physics);
