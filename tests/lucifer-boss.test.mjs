import test from 'node:test';
import assert from 'node:assert/strict';
import { ANASTACIA } from '../web/lucifer-rules.js';
import { createAnastacia, summonAnastacia, advanceAnastacia, hitAnastacia } from '../web/lucifer-boss.js';

test('Anastacia aparece aos 800 pontos e requer exatamente 20 acertos',()=>{
 const boss=createAnastacia();
 assert.equal(summonAnastacia(boss,790),false);
 assert.equal(summonAnastacia(boss,800),true);
 assert.equal(boss.health,500);
 for(let i=1;i<=20;i++){
  assert.equal(hitAnastacia(boss,{x:480,y:230}),i===20?'defeated':'boss');
  assert.equal(boss.health,500-i*25);
 }
 assert.equal(boss.hits,20);
 assert.equal(boss.defeated,true);
 assert.equal(hitAnastacia(boss,{x:480,y:230}),'none');
 advanceAnastacia(boss,ANASTACIA.defeatDuration);
 assert.equal(boss.phase,'defeated');
 assert.equal(summonAnastacia(boss,1600),false);
 assert.equal(createAnastacia().phase,'waiting');
});

test('uma Molotov queima uma bomba e não dá dano adicional ao boss',()=>{
 const boss=createAnastacia();summonAnastacia(boss,800);
 advanceAnastacia(boss,ANASTACIA.firstBombDelay,()=>.5);
 assert.equal(boss.bombs.length,2);
 const target={...boss.bombs[0]};
 assert.equal(hitAnastacia(boss,target),'bomb');
 assert.equal(boss.bombsBurned,1);
 assert.equal(boss.bombs.length,1);
 assert.equal(boss.health,500);
 assert.equal(boss.hits,0);
 const exploded=advanceAnastacia(boss,ANASTACIA.bombFuse,()=>.5);
 assert.equal(exploded.length,1);
 assert.equal(boss.bombsExploded,1);
 assert.ok(!exploded.some(bomb=>bomb.x===target.x&&bomb.y===target.y));
});

test('bombas só explodem uma vez, respeitam o limite e somem na derrota',()=>{
 const boss=createAnastacia();summonAnastacia(boss,800);
 advanceAnastacia(boss,ANASTACIA.firstBombDelay,()=>.5);
 assert.equal(advanceAnastacia(boss,ANASTACIA.bombFuse-.01,()=>.5).length,0);
 assert.equal(advanceAnastacia(boss,.02,()=>.5).length,2);
 const count=boss.bombsExploded;
 assert.equal(advanceAnastacia(boss,.01,()=>.5).length,0);
 assert.equal(boss.bombsExploded,count);
 for(let i=0;i<1000;i++)advanceAnastacia(boss,.1,()=>.5);
 assert.ok(boss.bombs.length<=ANASTACIA.bombLimit);
 assert.equal(hitAnastacia(boss,{x:20,y:200}),'miss');
 for(let i=0;i<20;i++)hitAnastacia(boss,{x:480,y:230});
 assert.equal(boss.bombs.length,0);
 const explosions=boss.bombsExploded;
 advanceAnastacia(boss,100,()=>.5);
 assert.equal(boss.bombsExploded,explosions);
});
