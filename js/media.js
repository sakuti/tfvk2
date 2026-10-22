(function(P,root){
  'use strict';
  let context=null;
  const settings=()=>P.mediaSettings||{sound:false,volume:.3};
  // iOS-PWA vaatii, että äänikonteksti luodaan ja käynnistetään käyttäjän kosketuksessa.
  // Audio Session -tyyppi 'ambient' tarkoittaa lyhyitä tehosteääniä: muu musiikki jatkuu eikä iOS näytä
  // soitinpaneelia (Dynamic Island). 'playback' näyttäisi paneelin. Äänetön kytkin mykistää tehosteet.
  function audioContext(){
    const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return null;
    try{if(root.navigator?.audioSession&&root.navigator.audioSession.type!=='ambient')root.navigator.audioSession.type='ambient';}catch{}
    if(!context||context.state==='closed')context=new Audio();
    return context;
  }
  function unlock(){
    const prefs=settings();if(!prefs.sound)return;
    try{
      const ctx=audioContext();if(!ctx)return;
      if(ctx.state!=='running')ctx.resume?.().catch(()=>{});
      const buffer=ctx.createBuffer(1,1,22050),source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);source.start(0);
    }catch{}
  }
  if(root.addEventListener)for(const type of ['pointerdown','touchend','keydown'])root.addEventListener(type,unlock,{capture:true,passive:true});
  if(root.document?.addEventListener)root.document.addEventListener('visibilitychange',()=>{if(root.document.visibilityState==='visible'&&context&&context.state!=='running')context.resume?.().catch(()=>{});});
  function play(ctx,kind,level){
    // Puhelimen kaiutin toistaa matalia ääniä heikosti, joten sävelet ovat ylemmässä rekisterissä.
    const tones=kind==='success'?[783.99,987.77,1174.66]:kind==='think'?[587.33,493.88]:[659.25,880];
    tones.forEach((frequency,i)=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+.01+i*.085;oscillator.type='triangle';oscillator.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(level*.35,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+.2);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(start);oscillator.stop(start+.22);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};});
  }
  P.Media={
    tone(kind='next'){
      const prefs=settings();if(!prefs.sound||prefs.volume<=0)return false;
      try{
        const ctx=audioContext();if(!ctx)return false;const level=Math.min(1,Math.max(0,prefs.volume));
        if(ctx.state&&ctx.state!=='running'&&ctx.resume){ctx.resume().then(()=>play(ctx,kind,level)).catch(()=>{});return true;}
        play(ctx,kind,level);return true;
      }catch{return false;}
    }
  };
})(typeof window!=='undefined'?window.Physics:globalThis.Physics,typeof window!=='undefined'?window:globalThis);
