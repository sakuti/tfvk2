/* Aseta tallennettu teema ennen tyylien lataamista. Ei muuta oppimistietoja. */
(function(){
  'use strict';
  let theme='dark';
  try{const saved=JSON.parse(localStorage.getItem('fysiikka-sprintti-v1'));if(saved?.version===1&&saved?.settings?.theme==='light')theme='light';}catch{}
  document.documentElement.dataset.theme=theme;
  // Sivun zoomaus pois: iOS-nipistys sekä Ctrl + rulla / Ctrl + plus, miinus ja nolla.
  document.addEventListener('gesturestart',event=>event.preventDefault());
  document.addEventListener('touchmove',event=>{if(event.touches&&event.touches.length>1)event.preventDefault();},{passive:false});
  window.addEventListener('wheel',event=>{if(event.ctrlKey)event.preventDefault();},{passive:false});
  window.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&['+','-','=','0'].includes(event.key))event.preventDefault();});
})();
