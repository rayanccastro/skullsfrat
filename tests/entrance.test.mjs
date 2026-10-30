import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SEAL_SHARDS} from '../web/entrance.js';
const points=clip=>[...clip.matchAll(/([\d.]+)%?\s+([\d.]+)%?/g)].map(m=>[Number(m[1]),Number(m[2])]);
function contains(polygon,x,y){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [xi,yi]=polygon[i],[xj,yj]=polygon[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
test('the eight seal fragments cover the original logo without holes or overlapping areas',()=>{
  const polygons=SEAL_SHARDS.map(s=>points(s.clip));assert.equal(polygons.length,8);
  for(let y=.37;y<100;y+=2)for(let x=.63;x<100;x+=2)assert.equal(polygons.filter(p=>contains(p,x,y)).length,1,`coverage ${x},${y}`);
  assert.ok(new Set(SEAL_SHARDS.map(s=>Math.sign(s.x))).size===2);
});
test('the entrance is a native keyboard-operable dialog and does not require a second music click',async()=>{
  const html=await readFile(new URL('../web/index.html',import.meta.url),'utf8');
  assert.match(html,/<dialog[^>]+id="skulls-gate"[^>]+open/);
  assert.ok(html.includes('aria-label="Quebrar o selo e entrar nos Skulls"'));
  const script=await readFile(new URL('../web/entrance.js',import.meta.url),'utf8');
  assert.ok(script.indexOf('audio?.play?.()')<script.indexOf('seal.disabled=true'));
  assert.ok(script.includes('setTimeout(finish,1000)')&&script.includes('reduced.matches'));
});
