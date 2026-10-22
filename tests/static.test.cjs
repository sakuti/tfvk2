'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('Julkaisukansion resurssit toimivat repositorion alihakemistossa ja paikallisesti',()=>{
  assert(fs.existsSync(path.join(root,'.nojekyll')));
  for(const file of ['index.html','suunnitelma.html']){
    const source=fs.readFileSync(path.join(root,file),'utf8');assert(source.includes('lang="fi"'));
    const ids=[...source.matchAll(/\bid="([^"<>]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);
    for(const [,attr,ref] of source.matchAll(/\b(href|src)="([^"<>]+)"/g)){
      if(ref.startsWith('#')||/^(https?:|data:)/.test(ref))continue;
      assert(ref.startsWith('./'),file+' '+ref);const target=path.resolve(root,ref);assert(target.startsWith(root+path.sep));assert(fs.existsSync(target),file+' '+ref);
      const url=new URL(ref,'https://example.invalid/course/'+file);assert(url.pathname.startsWith('/course/'));
    }
  }
});
test('Pelimoottori ei tarvitse API:a, ulkoisia kirjastoja tai verkosta ladattavaa dataa',()=>{
  for(const file of fs.readdirSync(path.join(root,'js'))){
    const source=fs.readFileSync(path.join(root,'js',file),'utf8');assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|https?:\/\//.test(source),file);assert(!/\beval\s*\(|new Function\b/.test(source),file);assert(!source.includes('\ufffd'),file);
  }
  const css=fs.readFileSync(path.join(root,'css/game.css'),'utf8');assert(!/@import|https?:\/\//.test(css));assert(css.includes('max-width:620px'));assert(css.includes('prefers-reduced-motion'));assert(css.includes(':focus-visible'));
});
