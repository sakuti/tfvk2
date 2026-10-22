(function(){
  'use strict';
  const $=id=>document.getElementById(id),button=$('install-app'),description=$('install-description'),instructions=$('install-instructions'),status=$('offline-status');
  let promptEvent=null,registration=null,ready=false,reloading=false,installed=false,failed=false,postponed=false,deferred=false;
  const dialog=$('update-dialog'),toast=$('update-toast'),studying=()=>!!document?.body?.classList.contains('is-studying');
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const supported=location.protocol==='https:'||location.protocol==='http:'&&local;
  const standalone=()=>window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;
  function render(){
    if(installed||standalone()){
      button.hidden=true;description.textContent='Fysiikan viikkokoe 2 on avattu sovelluksena. Oma oppimispolkusi kulkee mukana.';
    }else{
      button.hidden=false;button.textContent=promptEvent?'Asenna sovellus':'Lisää aloitusnäytölle';
    }
    status.classList.toggle('is-ready',ready);
    status.textContent=ready?(navigator.onLine===false?'Olet offline · opiskelu toimii silti.':'Valmis myös ilman nettiä.'):!supported?'PWA-asennus avautuu julkaistusta HTTPS-osoitteesta.':!('serviceWorker' in navigator)?'Tämä selain ei tue offline-asennusta. Voit pelata normaalisti.':failed?'Offline-tallennus ei onnistunut. Peli toimii verkkoyhteydellä; voit yrittää avaamalla sivun uudelleen.':'Offline-käyttö valmistellaan ensimmäisellä avauksella.';
  }
  function activate(){if(registration?.waiting){reloading=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});}}
  // Uudesta versiosta kerrotaan heti: harjoituksen aikana pienellä ilmoituksella, muuten ikkunalla.
  // Harjoitusta ei keskeytetä, vaan ikkuna avautuu, kun harjoituksesta poistutaan.
  function notify(){
    if(!registration?.waiting||postponed||dialog.open)return;
    if(studying()){deferred=true;toast.hidden=false;return;}
    deferred=false;toast.hidden=true;dialog.returnValue='later';
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  }
  dialog.addEventListener('close',()=>{if(dialog.returnValue==='update'&&!studying())activate();else postponed=true;});
  $('update-toast-close').addEventListener('click',()=>{toast.hidden=true;});
  new MutationObserver(()=>{if(!studying()&&deferred)notify();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  function showUpdate(){
    notify();
    if(!registration?.waiting||$('update-app'))return;
    const wrap=document.createElement('div');wrap.className='app-update';
    const note=document.createElement('p');note.textContent='Uusi versio on valmis. Edistymisesi säilyy.';
    const update=document.createElement('button');update.id='update-app';update.type='button';update.className='button secondary';update.textContent='Ota päivitys käyttöön';
    update.addEventListener('click',()=>{
      if(document.body.classList.contains('is-studying')){note.textContent='Poistu ensin harjoituksesta Tallenna ja poistu -painikkeella. Se tallentuu, ja voit jatkaa päivityksen jälkeen.';return;}
      activate();
    });wrap.append(note,update);status.after(wrap);
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;render();});
  window.addEventListener('appinstalled',()=>{promptEvent=null;installed=true;render();description.textContent='Sovellus lisättiin aloitusnäytölle. Löydät sen sovelluskuvakkeesta.';});
  button.addEventListener('click',async()=>{
    if(promptEvent){
      const pending=promptEvent;promptEvent=null;
      try{await pending.prompt();await pending.userChoice;}catch{}
      render();return;
    }
    instructions.hidden=false;
    const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
    instructions.textContent=!supported?'Avaa peli ensin GitHub Pagesin HTTPS-osoitteesta. Paikallinen tiedosto toimii tavallisena pelinä.':ios?'Avaa sivu Safarissa. Valitse Jaa → Lisää Koti-valikkoon → Lisää.':'Valitse selaimen valikosta Asenna sovellus tai Lisää aloitusnäytölle. Jos valintaa ei näy, jatka pelaamista selaimessa.';
  });
  render();
  window.addEventListener('online',render);window.addEventListener('offline',render);
  if(!supported||!('serviceWorker' in navigator)){
    if(supported)status.textContent='Tämä selain ei tue offline-asennusta. Voit pelata normaalisti.';
    return;
  }
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)location.reload();});
  navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
    registration=reg;showUpdate();
    reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate();});});
    // Pitkään auki olevassa sovelluksessa uutta versiota etsitään myös palatessa ja puolen tunnin välein.
    const check=()=>{if(navigator.onLine!==false)reg.update?.().catch(()=>{});};
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});setInterval(check,30*60*1000);
    return navigator.serviceWorker.ready;
  }).then(()=>{ready=true;render();}).catch(()=>{failed=true;render();});
})();
