/* Aseta tallennettu teema ennen tyylien lataamista. Ei muuta oppimistietoja. */
(function(){
  'use strict';
  let theme='dark';
  try{const saved=JSON.parse(localStorage.getItem('fysiikka-sprintti-v1'));if(saved?.version===1&&saved?.settings?.theme==='light')theme='light';}catch{}
  document.documentElement.dataset.theme=theme;
})();
