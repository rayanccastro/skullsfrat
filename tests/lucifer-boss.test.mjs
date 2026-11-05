import test from 'node:test';
import assert from 'node:assert/strict';
import { ANASTACIA } from '../web/lucifer-rules.js';
import { createAnastacia, summonAnastacia, advanceAnastacia, hitAnastacia, BOSS_BOUNDS, DODGE_AREA } from '../web/lucifer-boss.js';

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

test('bombas têm intervalo maior e a fase de desvio começa exatamente em 30%',()=>{
 const boss=createAnastacia();summonAnastacia(boss,800);
 advanceAnastacia(boss,ANASTACIA.firstBombDelay,()=>.5);
 boss.bombs=[];
 advanceAnastacia(boss,3.3,()=>.5);
 assert.equal(boss.bombs.length,0);
 advanceAnastacia(boss,ANASTACIA.bombInterval-3.3+.01,()=>.5);
 assert.equal(boss.bombs.length,2);
 for(let i=0;i<13;i++)hitAnastacia(boss,{x:480,y:230});
 assert.equal(boss.health,175);
 assert.equal(boss.dodging,false);
 hitAnastacia(boss,{x:480,y:230});
 assert.equal(boss.health,150);
 assert.equal(boss.dodging,true);
 // Bombs already in the map finish their fuses, but no new ones are thrown.
 advanceAnastacia(boss,ANASTACIA.bombFuse+.1,()=>.5);
 assert.equal(boss.bombsExploded,2);
 assert.equal(boss.bombs.length,0);
 for(let i=0;i<200;i++)advanceAnastacia(boss,.1,()=>.5);
 assert.equal(boss.bombs.length,0);
 assert.equal(boss.bombsExploded,2);
});

test('desvios aleatórios mantêm o boss no mapa e a colisão acompanha a posição',()=>{
 const makeBoss=()=>{
  const boss=createAnastacia();summonAnastacia(boss,800);
  for(let i=0;i<14;i++)hitAnastacia(boss,{x:480,y:230});
  return boss;
 };
 const left=makeBoss(),right=makeBoss();
 advanceAnastacia(left,.05,()=>0);
 advanceAnastacia(right,.05,()=>1);
 assert.ok(left.position.x<BOSS_BOUNDS.x);
 assert.ok(right.position.x>BOSS_BOUNDS.x);
 assert.notDeepEqual(left.dodgeTarget,right.dodgeTarget);
 assert.ok(Math.hypot(left.position.x-BOSS_BOUNDS.x,left.position.y-BOSS_BOUNDS.y)<=ANASTACIA.dodgeSpeed*.05+.001);
 for(let i=0;i<5;i++)advanceAnastacia(left,.1,()=>0);
 assert.ok(left.position.x+BOSS_BOUNDS.width<480);
 assert.equal(hitAnastacia(left,{x:480,y:230}),'miss');
 assert.equal(left.health,150);
 assert.equal(hitAnastacia(left,{x:left.position.x+BOSS_BOUNDS.width/2,y:left.position.y+100}),'boss');
 assert.equal(left.health,125);
 for(let i=0;i<1000;i++){
  advanceAnastacia(left,.05);
  assert.ok(left.position.x>=DODGE_AREA.minX&&left.position.x<=DODGE_AREA.maxX);
  assert.ok(left.position.y>=DODGE_AREA.minY&&left.position.y<=DODGE_AREA.maxY);
 }
 while(left.health>0)hitAnastacia(left,{x:left.position.x+50,y:left.position.y+100});
 const lastPosition={...left.position};
 advanceAnastacia(left,ANASTACIA.defeatDuration,()=>1);
 assert.equal(left.phase,'defeated');
 assert.deepEqual(left.position,lastPosition);
 const fresh=createAnastacia();
 assert.equal(fresh.dodging,false);
 assert.deepEqual(fresh.position,{x:BOSS_BOUNDS.x,y:BOSS_BOUNDS.y});
});
