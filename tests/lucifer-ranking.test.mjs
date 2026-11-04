import test from 'node:test';
import assert from 'node:assert/strict';
import { nickname, validRun, luciferLeaderboard } from '../server/lucifer-ranking.js';

test('nickname sanitiza controle e impede entradas inválidas',()=>{
 assert.equal(nickname(' <Lúcifer>  '),'Lúcifer');
 assert.equal(nickname('x'),'');
 assert.equal(nickname('A'.repeat(25)),'');
});
test('validação limita pontos e bônus',()=>{
 assert.equal(validRun({score:100,hits:10,shots:13,bonusSec:24,elapsedMs:144000}),true);
 assert.equal(validRun({score:100,hits:10,shots:9,bonusSec:24,elapsedMs:144000}),false);
 assert.equal(validRun({score:101,hits:10,shots:13,bonusSec:24,elapsedMs:144000}),false);
 assert.equal(validRun({score:100,hits:10,shots:13,bonusSec:61,elapsedMs:181000}),false);
});
test('sem banco, GET mostra placar local e POST não inventa persistência',async()=>{
 const url='https://skulls.local/api/lucifer-leaderboard';
 const get=await luciferLeaderboard(new Request(url),{});
 assert.equal((await get.json()).enabled,false);
 const post=await luciferLeaderboard(new Request(url,{method:'POST',body:JSON.stringify({action:'start',name:'Lucifer'}),headers:{'Content-Type':'application/json'}}),{});
 assert.equal(post.status,503);
});

test('sessão com Redis simulado grava e recupera ranking sem permitir reenvio',async()=>{
 const oldFetch=globalThis.fetch, oldNow=Date.now;
 let time=1750000000000;
 const values=new Map(),scores=new Map();
 const env={UPSTASH_REDIS_REST_URL:'https://redis.example.test',UPSTASH_REDIS_REST_TOKEN:'test-token'};
 Date.now=()=>time;
 globalThis.fetch=async(url,options)=>{
  assert.equal(url,'https://redis.example.test/pipeline');
  const cmds=JSON.parse(options.body),result=[];
  for(const [action,...args] of cmds){
   let value=null;
   if(action==='SET'){if(!values.has(args[0])){values.set(args[0],args[1]);value='OK';}}
   else if(action==='GETDEL'){value=values.get(args[0])||null;values.delete(args[0]);}
   else if(action==='ZADD'){scores.set(args[3],Math.max(Number(args[2]),scores.get(args[3])||0));value=1;}
   else if(action==='ZREVRANGE'){value=[...scores.entries()].sort((a,b)=>b[1]-a[1]).flatMap(([name,score])=>[name,String(score)]);}
   result.push({result:value});
  }
  return Response.json(result);
 };
 try{
  const origin='https://skulls.example/api/lucifer-leaderboard';
  const post=(data)=>new Request(origin,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://skulls.example'},body:JSON.stringify(data)});
  const start=await luciferLeaderboard(post({action:'start',name:'Lucifer'}),env);
  const run=await start.json();assert.equal(run.ok,true);assert.ok(run.token);
  time+=120000;
  const data={action:'finish',token:run.token,name:'Lucifer',score:0,hits:0,shots:0,bonusSec:0,elapsedMs:120000};
  const finish=await luciferLeaderboard(post(data),env);assert.equal((await finish.json()).ok,true);
  const repeat=await luciferLeaderboard(post(data),env);assert.equal(repeat.status,409);
  const list=await luciferLeaderboard(new Request(origin),env);assert.deepEqual((await list.json()).entries,[{name:'Lucifer',score:0}]);
 }finally{globalThis.fetch=oldFetch;Date.now=oldNow;}
});
