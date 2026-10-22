(function(P){
  'use strict';
  let serial=0;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${esc(s)}</text>`;
  const line=(x1,y1,x2,y2,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${extra}/>`;
  P.directions = [
    ['none','Ei vaikuta'],['up','Ylös'],['down','Alas'],['left','Vasemmalle'],['right','Oikealle'],
    ['pull','Oikealle yläviistoon (θ)'],['push','Oikealle alaviistoon (θ)'],['normal','Kohtisuoraan tasosta ulos'],['slopeUp','Ylämäkeen (oikealle)'],['slopeDown','Alamäkeen (vasemmalle)']
  ];
  P.forceLabels={G:'Painovoima G',N:'Pinnan tukivoima N',F:'Ulkoinen veto/työntö F',f:'Kitka f',T:'Narun jännitys T',P:'”Liikkeen voima” P'};
  P.directionLabel = d => (P.directions.find(x=>x[0]===d)||['',d])[1];
  P.plotSVG = function(d){
    const id='plot-'+(++serial),W=Math.max(280,Math.min(720,d.width||720)),H=W<450?300:320,L=W<450?48:66,R=W<450?25:35,T=35,B=52,points=d.points;
    const maxX=Math.max(...points.map(p=>p[0])),low=Math.min(0,...points.map(p=>p[1])),high=Math.max(0,...points.map(p=>p[1]));
    const raw=(high-low||2)/5,power=10**Math.floor(Math.log10(raw)),unit=raw/power,step=(unit<=1?1:unit<=2?2:unit<=5?5:10)*power;
    const ymin=Math.floor(low/step)*step-(low===0?0:step*.2),ymax=Math.ceil(high/step)*step+(high===0?step:step*.25);
    const X=x=>L+x/(maxX||1)*(W-L-R),Y=y=>T+(ymax-y)/(ymax-ymin)*(H-T-B);
    let body=`<rect width="${W}" height="${H}" rx="14" fill="var(--diagram-bg,#f8faf5)"/>`;
    for(let y=Math.ceil(ymin/step)*step;y<=ymax;y+=step){body+=line(L,Y(y),W-R,Y(y),'class="gridline"')+text(L-12,Y(y)+4,P.format(y,3),'text-anchor="end"');}
    const times=d.hideEndTime?[0,maxX]:[...new Set(points.length<=8?points.map(p=>p[0]):Array.from({length:6},(_,i)=>i*maxX/5))];
    for(const t of times){body+=line(X(t),T,X(t),H-B,'class="gridline"')+text(X(t),H-B+25,d.hideEndTime&&t>0?'t = ?':P.format(t,2),'text-anchor="middle"');}
    if(d.area){const path=`M${X(points[0][0])},${Y(0)} `+points.map(p=>`L${X(p[0])},${Y(p[1])}`).join(' ')+` L${X(points.at(-1)[0])},${Y(0)} Z`;body+=`<path d="${path}" fill="var(--diagram-area,#3b927a)" opacity=".12"/>`;}
    body+=line(L,Y(0),W-R+7,Y(0),'class="axisline"')+line(L,T-7,L,H-B,'class="axisline"');
    const path=points.map((p,i)=>`${i?'L':'M'}${X(p[0])},${Y(p[1])}`).join(' ');
    body+=`<path d="${path}" fill="none" stroke="var(--diagram-line,#237c68)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    if(points.length<=8)for(const p of points)body+=`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="4" fill="var(--diagram-line,#237c68)"/>`;
    for(const x of d.segments||[])body+=line(X(x),T,X(x),H-B,'stroke="var(--diagram-guide,#9ab6a5)" stroke-dasharray="4 5"');
    for(const [x,y,label] of d.labels||[])body+=text(X(x),Math.max(T+15,Y(y)-15),label,'class="segment-number" text-anchor="middle"');
    body+=text(L+4,20,d.yLabel,'class="axis-label"')+text(W-R,H-8,d.hideEndTime?'aika (s), kesto tuntematon':'t (s)','text-anchor="end" class="axis-label"');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}" class="physics-svg plot-svg"><title id="${id}">${esc(d.caption||d.yLabel+' ajan funktiona.')}</title>${body}</svg>`;
  };
  P.sceneSVG = function(d,forces={}){
    const id='scene-'+(++serial),angle=d.angle||25,rad=P.rad(angle),cos=Math.cos(rad),sin=Math.sin(rad),kind=d.kind||'box';
    let origin=[350,170],body='<rect width="720" height="300" rx="14" fill="var(--diagram-bg,#f8faf5)"/>';
    if(kind==='incline'){
      origin=[350+28*sin,185-28*cos];const groundY=185,x1=350-140*cos,x2=350+140*cos,y1=groundY+140*sin,y2=groundY-140*sin;
      body+=`<path d="M${x1} ${y1} L${x2} ${y2} L${x2} 285 L${x1} 285 Z" fill="var(--diagram-ground,#e5ebe0)"/>`;
      body+=line(x1,y1,x2,y2,'stroke="var(--diagram-edge,#91a48b)" stroke-width="3"');
      body+=`<g transform="translate(350 185) rotate(${-angle})"><rect x="-42" y="-56" width="84" height="56" rx="8" fill="var(--diagram-object,#d6e3cd)" stroke="var(--diagram-edge,#85a27c)"/></g>`;
      body+=text(545,268,'θ = '+angle+'°','text-anchor="middle"');
    }else if(kind==='elevator'){
      body+=`<rect x="245" y="36" width="210" height="216" rx="12" fill="none" stroke="var(--diagram-edge,#96ae99)" stroke-width="3"/>`+line(245,244,455,244,'stroke="var(--diagram-edge,#849b85)" stroke-width="5"');
      body+='<circle cx="350" cy="124" r="17" fill="var(--diagram-person,#5b8270)"/><path d="M350 143V194M321 165L350 146L379 165M350 194L330 231M350 194L370 231" stroke="var(--diagram-person,#5b8270)" stroke-width="10" stroke-linecap="round" fill="none"/>';
    }else if(kind==='flight'){
      origin=[350,150];body+='<circle cx="350" cy="150" r="26" fill="var(--diagram-object,#d5e4ca)" stroke="var(--diagram-edge,#6c957b)" stroke-width="2"/>';
      body+=line(170,255,540,255,'stroke="var(--diagram-edge,#a7b6a0)" stroke-dasharray="5 5"')+text(540,277,'y₀ = 0','text-anchor="end"');
    }else if(kind==='hanging'){
      body+=line(260,35,440,35,'stroke="var(--diagram-edge,#8ea287)" stroke-width="5"')+line(350,35,350,145,'stroke="var(--diagram-rope,#79917d)" stroke-width="3"');body+='<rect x="310" y="145" width="80" height="64" rx="9" fill="var(--diagram-object,#d5e3ca)"/>';
    }else if(kind==='wall'){
      body+='<path d="M440 60V225H170" stroke="var(--diagram-edge,#8a9e82)" stroke-width="8" fill="none"/><rect x="350" y="161" width="86" height="60" rx="8" fill="var(--diagram-object,#d5e3ca)"/>';origin=[390,190];
    }else{
      body+=line(150,225,570,225,'stroke="var(--diagram-edge,#91a48b)" stroke-width="4"')+'<rect x="307" y="145" width="86" height="76" rx="9" fill="var(--diagram-object,#d5e3ca)" stroke="var(--diagram-edge,#8ba780)"/>';
      if(d.applied){forces={...forces,F:d.push?'push':'pull'};}
    }
    const vectors={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0],pull:[cos,-sin],push:[cos,sin],normal:[-sin,-cos],slopeUp:[cos,-sin],slopeDown:[-cos,sin]};
    const marker='arrow-'+id;
    body+=`<defs><marker id="${marker}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="var(--diagram-force,#d18a42)"/></marker></defs>`;
    let i=0;for(const [name,direction] of Object.entries(forces)){
      if(direction==='none'||!vectors[direction])continue;const [dx,dy]=vectors[direction],length=75+(i++%2)*24;
      const x=origin[0]+dx*length,y=origin[1]+dy*length;
      body+=line(origin[0],origin[1],x,y,`stroke="var(--diagram-force,#b37634)" stroke-width="3" marker-end="url(#${marker})"`)+text(x+dx*15+5,y+dy*13+4,name,'class="force-label"');
    }
    body+=line(620,245,670,245,'stroke="var(--diagram-edge,#8da38e)" stroke-width="2"')+line(620,245,620,195,'stroke="var(--diagram-edge,#8da38e)" stroke-width="2"')+text(676,249,'+x')+text(613,188,'+y');
    return `<svg viewBox="0 0 720 300" role="img" aria-labelledby="${id}" class="physics-svg"><title id="${id}">${esc('Tilannekuva: '+kind+'. Nuolet: '+(Object.entries(forces).filter(x=>x[1]!=='none').map(([n,d])=>n+' '+P.directionLabel(d)).join(', ')||'ei vielä valittuja voimia'))}</title>${body}</svg>`;
  };
  P.diagramSVG = function(d,forces){
    if(!d)return '';
    if(d.type==='plot')return P.plotSVG(d);
    if(d.type==='scene')return P.sceneSVG(d,forces);
    if(d.type==='straps'){
      const x=350,y=195,len=150,a1=P.rad(d.a1),a2=P.rad(d.a2),x1=x-len*Math.sin(a1),y1=y-len*Math.cos(a1),x2=x+len*Math.sin(a2),y2=y-len*Math.cos(a2);
      return `<svg viewBox="0 0 720 300" role="img" aria-label="Kuorma kahden hihnan varassa. Molemmat kulmat mitataan katkoviivalla merkitystä pystysuorasta." class="physics-svg"><rect width="720" height="300" rx="14" fill="var(--diagram-bg,#f8faf5)"/>${line(x1,y1,x,y,'stroke="var(--diagram-rope,#3a7a66)" stroke-width="3"')}${line(x2,y2,x,y,'stroke="var(--diagram-rope,#3a7a66)" stroke-width="3"')}${line(x,y,x,y-165,'stroke="var(--diagram-guide,#a4b7a0)" stroke-dasharray="5 5"')}<rect x="303" y="195" width="94" height="64" rx="9" fill="var(--diagram-object,#d5e3ca)"/>${text(x1-15,y1+18,'T₁','text-anchor="end"')}${text(x2+15,y2+18,'T₂')}${text(288,130,'α₁ = '+d.a1+'°','text-anchor="end"')}${text(412,130,'α₂ = '+d.a2+'°')}${text(350,285,'Kulmat pystysuorasta','text-anchor="middle"')}</svg>`;
    }
    if(d.type==='vector'){
      const actual=d.vertical?90-d.angle:d.angle,rad=P.rad(actual),x=300+125*Math.cos(rad),y=155+(d.down?1:-1)*125*Math.sin(rad),id='vector-'+(++serial);
      return `<svg viewBox="0 0 720 300" role="img" aria-label="Voima oikealle ${d.down?'ala':'ylä'}viistoon, kulma ${d.angle} astetta ${d.vertical?'pystysuorasta':'vaakatasosta'}." class="physics-svg"><rect width="720" height="300" rx="14" fill="var(--diagram-bg,#f8faf5)"/><defs><marker id="${id}" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="var(--diagram-force,#b87937)"/></marker></defs>${line(170,155,550,155,'stroke="var(--diagram-edge,#91a48b)"')}${line(300,30,300,275,'stroke="var(--diagram-edge,#91a48b)"')}${line(300,155,x,y,`stroke="var(--diagram-force,#b87937)" stroke-width="4" marker-end="url(#${id})"`)}${text(x+15,y,'F = '+d.F+' N')}${text(320,290,'θ = '+d.angle+'° '+(d.vertical?'pystysuorasta':'vaakatasosta'))}${text(555,150,'+x')}${text(310,32,'+y')}</svg>`;
    }
    return '';
  };
})(typeof window!=='undefined'?window.Physics:globalThis.Physics);
