(function(P,root){
  'use strict';
  let context=null,utterance=null,queue=null,serial=0;
  const settings=()=>P.mediaSettings||{sound:false,volume:.3};
  const volume=()=>Math.min(1,Math.max(0,settings().volume));
  // Selostus puhutaan lause kerrallaan, jotta voimakkuuden muutos voi jatkaa nykyisestä lauseesta.
  function speakPart(){
    const q=queue;if(!q)return;
    if(q.index>=q.parts.length){queue=null;utterance=null;q.onState?.('ended');return;}
    const voice=P.Media.voice();if(!voice){queue=null;q.onState?.('ended');return;}
    const u=new root.SpeechSynthesisUtterance(q.parts[q.index]),token=++serial;q.token=token;
    u.voice=voice;u.lang=voice.lang;u.rate=.92;u.volume=volume();
    u.onend=()=>{if(queue!==q||q.token!==token)return;q.index++;speakPart();};
    u.onerror=event=>{if(queue!==q||q.token!==token||event?.error==='interrupted'||event?.error==='canceled')return;queue=null;utterance=null;q.onState?.('ended');};
    utterance=u;root.speechSynthesis.speak(u);
  }
  P.Media={
    tone(kind='next'){
      const prefs=settings();if(!prefs.sound||prefs.volume<=0)return false;
      const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return false;
      try{
        context=context||new Audio();if(context.state==='suspended')context.resume().catch(()=>{});
        const tones=kind==='success'?[523.25,659.25,783.99]:kind==='think'?[329.63,293.66]:[440,554.37];
        tones.forEach((frequency,i)=>{const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+i*.075;oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(Math.min(1,Math.max(0,prefs.volume))*.09,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+.17);oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+.19);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};});return true;
      }catch{return false;}
    },
    voice(){try{return root.speechSynthesis?.getVoices().find(v=>v.localService&&/^fi(?:-|$)/i.test(v.lang))||null;}catch{return null;}},
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
