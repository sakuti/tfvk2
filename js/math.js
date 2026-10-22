(function(P,root){
  'use strict';
  // Kaavateksti puretaan osiin: ensin symbolinen kaava, jonka jokaisesta merkistä viiva osoittaa selitykseen,
  // sitten sijoitus lukuarvoilla ja tulos omilla riveillään. Muu teksti näytetään sellaisenaan.
  const RELATION=/\s(=|≤|≥|≠)\s/,FUNCTIONS=new Set(['sin','cos','tan']),OPERATOR=/^[+−\-·/*()²³√½|∙×]+$/;
  const UNITS=new Set(['N','kN','kg','t','m','s','h','min','km','km/h','m/s','m/s²','°','J','W']);
  const keys=()=>Object.keys(P.symbols).sort((a,b)=>b.length-a.length);
  function decompose(part){const list=keys(),out=[];let rest=part;while(rest){const key=list.find(k=>rest.startsWith(k));if(!key)return null;out.push(key);rest=rest.slice(key.length);}return out;}
  // Sana jaetaan merkkeihin, operaattoreihin, funktioihin ja lukuihin. null = sana ei ole kaavaa.
  function tokenize(word){
    const out=[];
    for(const run of word.split(/([+−\-·/*()²³√½|∙×]+)/).filter(Boolean)){
      if(OPERATOR.test(run)){out.push({type:'op',text:run});continue;}
      const m=run.match(/^(\d+(?:,\d+)?°?)?(.*)$/);if(m[1])out.push({type:'num',text:m[1]});
      let rest=m[2];if(!rest)continue;
      const fn=rest.match(/^(sin|cos|tan)(.*)$/);if(fn){out.push({type:'fn',text:fn[1]});rest=fn[2];if(!rest)continue;}
      const parts=decompose(rest);if(!parts)return null;for(const key of parts)out.push({type:'sym',key});
    }
    return out;
  }
  const isNumber=w=>/^[−-]?[\d½⅔]/.test(w)||/^\(?[−-]?\d/.test(w);
  // Kaavan sanat: merkit, operaattorit, luvut ja lukujen perässä olevat yksiköt.
  function formulaWords(words,from,dir){
    const taken=[];
    for(let i=from;i>=0&&i<words.length;i+=dir){
      const w=words[i].replace(/[.;:]$/,''),prev=words[i-1];
      const ok=w&&(OPERATOR.test(w)||isNumber(w)||UNITS.has(w)&&prev&&/\d\)?$/.test(prev)||tokenize(w));
      if(!ok)break;taken.push(i);
    }
    return taken;
  }
  // Symbolinen osa: ei lukuarvoja (kertoimet kuten 2T tai (2g) sallitaan) ja jokainen sana on kaavaa.
  const symbolic=seg=>{const tokens=seg.split(/\s+/).map(w=>OPERATOR.test(w)?[{type:'op'}]:tokenize(w));return tokens.every(Boolean)&&tokens.flat().some(t=>t.type==='sym')&&tokens.flat().every(t=>t.type!=='num'||/^[1-4]$/.test(t.text));};
  const substitution=seg=>/\/\s*\(?[−-]\d|\d(?:sin|cos|tan|[A-Za-zμ√])|\d\s*[·×*+(\[]|[)·×*+]\s*[\d(−-]|\d\s*\/|\/\s*\(?\d|√|\s−\s/.test(seg);
  // Lauseke jaetaan: [otsikko:] kaava (= osa)* [loppuselitys].
  function parseClause(text){
    const clause=text.trim().replace(/\.$/,'');if(!RELATION.test(clause))return null;
    let label='',body=clause;const lm=clause.match(/^([^=:]{1,24}):\s+(.*)$/);if(lm&&!/[=]/.test(lm[1])){label=lm[1];body=lm[2];}
    // Kaavaa edeltävä lyhyt sana (esim. Levossa) näytetään otsikkona, jos loppu on kokonainen kaava.
    if(!label){const words=body.split(/\s+/),eq=words.findIndex(w=>RELATION.test(' '+w+' ')),lead=formulaWords(words.slice(0,eq),eq-1,-1).length,prefix=eq-lead;
      if(prefix>0&&prefix<=3&&lead>0){const rest=parseClause(words.slice(prefix).join(' '));if(rest&&rest.run>=2)return {...rest,label:words.slice(0,prefix).join(' ')};}}
    const pieces=body.split(RELATION),segments=[],relations=[];
    for(let i=0;i<pieces.length;i++)if(i%2)relations.push(pieces[i]);else segments.push(pieces[i].trim());
    // Ensimmäisen osan alussa ei saa olla muuta tekstiä; viimeisen osan lopussa saa olla selitys.
    const first=segments[0].split(/\s+/);if(formulaWords(first,first.length-1,-1).length!==first.length)return null;
    const last=segments[segments.length-1].split(/\s+/),keep=formulaWords(last,0,1).length;if(!keep)return null;
    const tail=last.slice(keep).join(' ');segments[segments.length-1]=last.slice(0,keep).join(' ');
    for(const seg of segments.slice(1,-1)){const w=seg.split(/\s+/);if(formulaWords(w,0,1).length!==w.length)return null;}
    let run=0;while(run<segments.length&&symbolic(segments[run]))run++;
    return {label,segments,relations,run,tail};
  }
  // Teksti jaetaan lauseisiin ja pilkulla tai nuolella erotettuihin osiin.
  function clauses(text){
    const out=[];
    for(const sentence of String(text).split(/\n+|(?<=[.!?])\s+(?=[A-ZÄÖÅΣΔμθαa-zäö(√|])/)){
      const parts=sentence.split(/(,\s+|;\s+|\s→\s|\sja\s)/);
      for(let i=0;i<parts.length;i+=2)out.push({text:parts[i],sep:(parts[i+1]||'').trim()});
    }
    return out;
  }
  const el=(tag,cls,text)=>{const n=root.document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const shortName=key=>String(P.symbols[key]||'').split(/\s*[(;]|\seli\s/)[0];
  const unitOf=key=>(String(P.symbols[key]||'').match(/\(([^)]*)\)/)||[])[1]||'';
  // Kaavan merkit väritetään; sama merkki saa saman värin koko lohkossa.
  function expression(text,ctx,annotate){
    const wrap=el('div','ann-expr');
    text.split(/\s+/).filter(Boolean).forEach((word,i,words)=>{
      if(i)wrap.append(root.document.createTextNode(' '));
      if(RELATION.test(' '+word+' ')){wrap.append(el('span','ann-rel',word));return;}
      // Luvun perässä oleva N, m tai s on yksikkö, ei merkki.
      if(i&&/[\d)²]$/.test(words[i-1])&&UNITS.has(word)){wrap.append(el('span','ann-unit',word));return;}
      const tokens=tokenize(word);if(!tokens){wrap.append(el('span','',word));return;}
      for(const token of tokens){
        if(token.type!=='sym'){const span=el('span','ann-'+token.type,token.text);if(/^[²³]$/.test(token.text))span.className='ann-sup';wrap.append(span);continue;}
        if(!ctx.colors.has(token.key))ctx.colors.set(token.key,ctx.colors.size%5);
        const span=el('span','ann-sym c'+ctx.colors.get(token.key),token.key);span.dataset.key=token.key;
        if(annotate&&!ctx.seen.has(token.key)&&![...wrap.querySelectorAll('.ann-anchor')].some(n=>n.dataset.key===token.key))span.classList.add('ann-anchor');
        wrap.append(span);
      }
    });
    return wrap;
  }
  function annotated(text,ctx){
    const box=el('div','ann-formula'),expr=expression(text,ctx,true),badges=el('div','ann-badges');
    for(const anchor of expr.querySelectorAll('.ann-anchor')){
      const key=anchor.dataset.key;ctx.seen.add(key);
      const badge=el('span','ann-badge c'+ctx.colors.get(key));badge.dataset.key=key;
      const unit=unitOf(key);badge.append(el('b','',key),el('span','',shortName(key)+(unit?', '+unit:'')));badges.append(badge);
    }
    box.append(expr);if(badges.childElementCount){box.append(badges);box.classList.add('has-badges');}
    return box;
  }
  // Pelkkä tulosrivi: jos merkkiä ei ole vielä selitetty, sen nimi näytetään rivin perässä.
  function calcRow(label,lhs,rest,ctx){
    const row=el('div','calc-row');if(label)row.append(el('span','calc-label',label));
    const line=el('div','calc-line');line.append(expression(lhs+' = '+rest,ctx,false));
    const fresh=(P.symbolsIn(lhs)||[]).filter(k=>!ctx.seen.has(k));
    if(fresh.length&&tokenize(lhs.replace(/\s+/g,''))?.every(t=>t.type==='sym')){for(const key of fresh){ctx.seen.add(key);if(!ctx.colors.has(key))ctx.colors.set(key,ctx.colors.size%5);line.append(el('span','ann-inline c'+ctx.colors.get(key),shortName(key)));}}
    row.append(line);return row;
  }
  P.mathBlock=(text,{formula=false}={})=>{
    const block=el('div','math-block'),ctx={seen:new Set(),colors:new Map()},proseText=[];let prose=null,pending='';
    // Erotin (pilkku, ja, nuoli) lisätään vasta seuraavan tekstin eteen, jottei kaavan edelle jää irrallista sanaa.
    const addProse=(t,sep)=>{proseText.push(t);if(!prose){prose=el('p','math-prose');block.append(prose);pending='';}prose.append(root.document.createTextNode((prose.textContent?(pending===','||pending===';'?pending:pending?' '+pending:'')+' ':'')+t));pending=sep;};
    for(const {text:part,sep} of clauses(text)){
      const parsed=parseClause(part);
      if(!parsed){addProse(part.trim().replace(/\.$/,'')+(/\.$/.test(part.trim())?'.':''),sep);continue;}
      prose=null;const group=el('div','math-group');if(parsed.label)group.append(el('span','math-label',parsed.label));
      const {segments,relations,run}=parsed;
      if(run>=2||formula&&run===segments.length){
        group.append(annotated(segments.slice(0,run).map((s,i)=>(i?relations[i-1]+' ':'')+s).join(' '),ctx));
      }
      const values=segments.slice(Math.max(run,1));
      if(values.length){
        const lhs=segments[0],subs=values.filter(substitution),results=values.filter(v=>!substitution(v));
        const hasSub=subs.length>0;
        if(hasSub)group.append(calcRow('Sijoitus',lhs,subs.join(' = '),ctx));
        if(results.length)group.append(calcRow(hasSub?'Tulos':run>=2?'Tulos':'',lhs,results.join(' = ')+(parsed.tail?' '+parsed.tail:''),ctx));
      }else if(parsed.tail)group.append(el('p','math-tail',parsed.tail));
      block.append(group);if(sep==='→')block.append(el('div','math-arrow','↓'));
    }
    // Tekstiin jääneet merkit selitetään lyhyesti lohkon lopussa.
    const rest=[...new Set(proseText.flatMap(t=>P.symbolsIn(t,{prose:true})))].filter(k=>!ctx.seen.has(k));
    if(rest.length){const list=el('div','ann-legend');for(const key of rest){if(!ctx.colors.has(key))ctx.colors.set(key,ctx.colors.size%5);const chip=el('span','ann-inline c'+ctx.colors.get(key));chip.append(el('b','',key),root.document.createTextNode(' '+shortName(key)));list.append(chip);}block.append(list);}
    return block;
  };
  // Badget sijoitetaan riveihin niin, että jokaisesta merkistä lähtee pystysuora viiva omaan badgeensa
  // eikä viiva kulje toisen badgen läpi. Badge alkaa merkin kohdalta ja jatkuu oikealle, joten merkit
  // käsitellään oikealta vasemmalle: oikeanpuoleiset ylimpiin riveihin, vasemmanpuoleisten viivat niiden ohi.
  function layout(box){
    const expr=box.querySelector('.ann-expr'),area=box.querySelector('.ann-badges');if(!expr||!area)return;
    const width=Math.max(box.clientWidth-4,expr.offsetWidth);if(!box.clientWidth||box.dataset.laid===String(width))return;
    area.querySelectorAll('.ann-line').forEach(n=>n.remove());box.dataset.laid=String(width);area.style.width=width+'px';box.classList.add('is-laid');
    const base=area.getBoundingClientRect(),anchors=[...expr.querySelectorAll('.ann-anchor')];
    const items=anchors.map(a=>{const r=a.getBoundingClientRect(),badge=[...area.querySelectorAll('.ann-badge')].find(b=>b.dataset.key===a.dataset.key);badge.style.maxWidth=Math.min(width,260)+'px';return {x:r.left+r.width/2-base.left,top:r.bottom-base.top,badge,w:badge.offsetWidth,h:badge.offsetHeight,key:a.dataset.key};}).sort((a,b)=>b.x-a.x);
    const rows=[],overlaps=(it,r)=>(rows[r]||[]).some(o=>it.left<o.left+o.w+8&&o.left<it.left+it.w+8),blocks=(it,r)=>rows.slice(0,r).some(q=>q.some(o=>it.x>o.left-4&&it.x<o.left+o.w+4));
    for(const it of items){
      it.left=Math.max(0,Math.min(width-it.w,it.x-12));
      // Ensisijaisesti rivi, johon viiva pääsee esteettä; muuten ensimmäinen vapaa rivi.
      let r=0;while(r<=rows.length&&(overlaps(it,r)||blocks(it,r)))r++;
      if(r>rows.length){r=0;while(overlaps(it,r))r++;}
      (rows[r]||(rows[r]=[])).push(it);it.row=r;
    }
    let y=16;const tops=rows.map(row=>{const top=y;y+=Math.max(...row.map(o=>o.h),0)+8;return top;});
    for(const it of items){
      const top=tops[it.row];it.badge.style.left=it.left+'px';it.badge.style.top=top+'px';
      const line=root.document.createElement('span');line.className='ann-line c'+(it.badge.className.match(/c(\d)/)||[])[1];
      const from=Math.min(0,it.top);line.style.left=(it.x-1)+'px';line.style.top=from+'px';line.style.height=(top-from+2)+'px';area.prepend(line);
    }
    area.style.height=y+'px';
  }
  const observer=root.ResizeObserver?new root.ResizeObserver(entries=>{for(const e of entries)layout(e.target.closest('.ann-formula'));}):null;
  P.layoutMath=node=>{
    for(const box of node.querySelectorAll('.ann-formula.has-badges')){layout(box);observer?.observe(box);}
    root.document?.fonts?.ready?.then(()=>{if(node.isConnected)for(const box of node.querySelectorAll('.ann-formula.has-badges'))layout(box);});
  };
  P.mathInternals={parseClause,clauses,tokenize};
})(typeof window!=='undefined'?window.Physics:globalThis.Physics,typeof window!=='undefined'?window:globalThis);
