(function(){
  'use strict';
  const $=id=>document.getElementById(id),button=$('install-app'),description=$('install-description'),instructions=$('install-instructions'),status=$('offline-status');
  let promptEvent=null,registration=null,ready=false,reloading=false,installed=false,failed=false;
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const supported=location.protocol==='https:'||location.protocol==='http:'&&local;
  const standalone=()=>window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;
  function render(){
    if(installed||standalone()){
      button.hidden=true;description.textContent='Sprintti on avattu sovelluksena. Oma oppimispolkusi kulkee mukana.';
    }else{
      button.hidden=false;button.textContent=promptEvent?'Asenna Sprintti':'Lisää aloitusnäytölle';
    }
    status.classList.toggle('is-ready',ready);
    status.textContent=ready?(navigator.onLine===false?'Olet offline · opiskelu toimii silti.':'Valmis myös ilman nettiä.'):!supported?'PWA-asennus avautuu julkaistusta HTTPS-osoitteesta.':!('serviceWorker' in navigator)?'Tämä selain ei tue offline-asennusta. Voit pelata normaalisti.':failed?'Offline-tallennus ei onnistunut. Peli toimii verkkoyhteydellä; voit yrittää avaamalla sivun uudelleen.':'Offline-käyttö valmistellaan ensimmäisellä avauksella.';
  }
  function showUpdate(){
    if(!registration?.waiting||$('update-app'))return;
    const wrap=document.createElement('div');wrap.className='app-update';
    const note=document.createElement('p');note.textContent='Uusi versio on valmis. Edistymisesi säilyy.';
    const update=document.createElement('button');update.id='update-app';update.type='button';update.className='button secondary';update.textContent='Ota päivitys käyttöön';
    update.addEventListener('click',()=>{
      if(document.body.classList.contains('is-studying')){note.textContent='Poistu ensin harjoituksesta Tallenna ja poistu -painikkeella. Se tallentuu, ja voit jatkaa päivityksen jälkeen.';return;}
      if(registration.waiting){reloading=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});}
    });wrap.append(note,update);status.after(wrap);
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;render();});
  window.addEventListener('appinstalled',()=>{promptEvent=null;installed=true;render();description.textContent='Sprintti lisättiin aloitusnäytölle. Löydät sen sovelluskuvakkeesta.';});
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
    reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')showUpdate();});});
    return navigator.serviceWorker.ready;
  }).then(()=>{ready=true;render();}).catch(()=>{failed=true;render();});
})();
