(function(P,root){
  'use strict';
  let context=null,utterance=null,queue=null,serial=0;
  const settings=()=>P.mediaSettings||{sound:false,volume:.3};
  const volume=()=>Math.min(1,Math.max(0,settings().volume));
  // iOS:n Eloquence- ja hupiäänet kuulostavat robottimaisilta, joten ne valitaan vain pyydettäessä.
  const poorVoice=/eloquence|speech\.synthesis\.voice|\b(?:eddy|flo|grandma|grandpa|isoäiti|isoisä|reed|rocko|sandy|shelley|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|fred|kathy|ralph)\b/i;
  const voiceScore=v=>{const id=(v.name||'')+' '+(v.voiceURI||'');return (poorVoice.test(id)?-10:0)+(/premium/i.test(id)?4:/enhanced|parannettu|natural|neural/i.test(id)?3:0)+(/compact/i.test(id)?-1:0)+(/satu|noora|harri|selma|onni/i.test(id)?2:0)+(v.default?1:0);};
  // Selostus puhutaan lause kerrallaan, jotta voimakkuuden muutos voi jatkaa nykyisestä lauseesta.
  function speakPart(){
    const q=queue;if(!q)return;
    if(q.index>=q.parts.length){queue=null;utterance=null;q.onState?.('ended');return;}
    const voice=P.Media.voice();if(!voice){queue=null;q.onState?.('ended');return;}
    const u=new root.SpeechSynthesisUtterance(q.parts[q.index]),token=++serial;q.token=token;
    u.voice=voice;u.lang=voice.lang;u.rate=1;u.pitch=1;u.volume=volume();
    u.onend=()=>{if(queue!==q||q.token!==token)return;q.index++;speakPart();};
    u.onerror=event=>{if(queue!==q||q.token!==token||event?.error==='interrupted'||event?.error==='canceled')return;queue=null;utterance=null;q.onState?.('ended');};
    utterance=u;root.speechSynthesis.speak(u);
  }
  // iOS-PWA vaatii, että äänikonteksti luodaan ja käynnistetään käyttäjän kosketuksessa.
  // Audio Session -tyyppi 'playback' soittaa äänet myös äänettömällä kytkimellä, kuten puhe.
  function audioContext(){
    const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return null;
    try{if(root.navigator?.audioSession&&root.navigator.audioSession.type!=='playback')root.navigator.audioSession.type='playback';}catch{}
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
    },
    voices(){try{return (root.speechSynthesis?.getVoices()||[]).filter(v=>v.localService&&/^fi(?:-|_|$)/i.test(v.lang)).sort((a,b)=>voiceScore(b)-voiceScore(a));}catch{return [];}},
    voice(){const list=P.Media.voices(),chosen=settings().voice;return (chosen&&list.find(v=>v.voiceURI===chosen||v.name===chosen))||list[0]||null;},
    say(text,{onState}={}){
      const voice=P.Media.voice();if(!voice||!root.SpeechSynthesisUtterance||volume()<=0)return false;
      P.Media.stopSpeech();
      const parts=String(text).split(/(?<=[.!?…])\s+/).map(s=>s.trim()).filter(Boolean);if(!parts.length)return false;
      queue={parts,index:0,onState,token:0};
      try{speakPart();return true;}catch{queue=null;utterance=null;return false;}
    },
    speaking(){return !!queue;},
    // Uusi voimakkuus otetaan käyttöön toistamalla nykyinen lause alusta ja jatkamalla siitä.
    resume(){
      const q=queue;if(!q)return false;if(volume()<=0){P.Media.stopSpeech();return false;}
      q.token=-1;try{root.speechSynthesis.cancel();}catch{}
      try{speakPart();return true;}catch{queue=null;utterance=null;q.onState?.('ended');return false;}
    },
    stopSpeech(){
      const q=queue;queue=null;
      if(utterance||q){try{root.speechSynthesis.cancel();}catch{}utterance=null;}
      q?.onState?.('stopped');
    },
    voicesChanged(callback){if(!root.speechSynthesis?.addEventListener)return ()=>{};root.speechSynthesis.addEventListener('voiceschanged',callback);return ()=>root.speechSynthesis.removeEventListener('voiceschanged',callback);}
  };
})(typeof window!=='undefined'?window.Physics:globalThis.Physics,typeof window!=='undefined'?window:globalThis);
