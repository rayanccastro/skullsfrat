import { BASE_TIME, MAX_RUN_SECONDS, MAX_BONUS, SCORE_PER_CAR, MISS_PENALTY, ESCAPE_PENALTY, CAR_LIMIT, FIRST_SPAWN, MIN_SPAWN_GAP } from '../web/lucifer-rules.js';
import { redisWire } from './lucifer-redis-wire.js';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const LEADERBOARD = 'skulls:lucifer:v1:ranking';
const SESSION_PREFIX = 'skulls:lucifer:v1:session:';
const MAX_RUN_MS = MAX_RUN_SECONDS * 1000;
const SESSION_TTL = 17 * 60;
const json = (obj, status=200)=>Response.json(obj,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

export function nickname(name) {
 if(typeof name!=='string')return '';
 const value=name.normalize('NFKC').replace(/[\u0000-\u001f\u007f<>]/g,'').replace(/\s+/g,' ').trim();
 return value.length>=2&&value.length<=24?value:'';
}
export function validRun(data){
 const {score,hits,shots,bonusSec,elapsedMs}=data;
 const misses=data.misses??0, escaped=data.escaped??0; // Aceita clientes anteriores.
 if(![score,hits,shots,misses,escaped,bonusSec,elapsedMs].every(x=>Number.isSafeInteger(x)&&x>=0))return false;
 if(score!==hits*SCORE_PER_CAR||hits>shots||shots>1800||misses>shots-hits)return false;
 if(bonusSec<hits||bonusSec>hits*MAX_BONUS)return false;
 if(elapsedMs<(misses?1000:20000)||elapsedMs>MAX_RUN_MS+12000)return false;
 // O intervalo mínimo entre novos carros limita o número de acertos e fugas possíveis.
 const maxCars=Math.max(0,Math.floor((elapsedMs-FIRST_SPAWN*1000)/(MIN_SPAWN_GAP*1000))+1);
 if(escaped>0&&hits+escaped>maxCars)return false;
 const remainingMs=(BASE_TIME+bonusSec-misses*MISS_PENALTY-escaped*ESCAPE_PENALTY)*1000-elapsedMs;
 // O último evento pode descontar uma Molotov ou a saída de vários carros no mesmo quadro.
 const lastPenalty=misses||data.escaped===undefined?MISS_PENALTY:Math.min(escaped,CAR_LIMIT)*ESCAPE_PENALTY;
 if(elapsedMs<MAX_RUN_MS-2500&&(remainingMs>4500||remainingMs<-(lastPenalty*1000+4500)))return false;
 return true;
}
function b64(buffer){return Buffer.from(buffer).toString('base64url');}
function signingKey(env){return env.LUCIFER_SCORE_SECRET||env.UPSTASH_REDIS_REST_TOKEN||env.REDIS_URL||'';}
function sign(body,key){return b64(createHmac('sha256',key).update(body).digest());}
function tokenFor(run,key){const body=b64(JSON.stringify(run));return body+'.'+sign(body,key);}
function decodeToken(token,key){
 if(typeof token!=='string'||token.length>1200)return null;
 const pieces=token.split('.');if(pieces.length!==2)return null;
 const expected=Buffer.from(sign(pieces[0],key)),received=Buffer.from(pieces[1]);
 if(expected.length!==received.length||!timingSafeEqual(expected,received))return null;
 try{return JSON.parse(Buffer.from(pieces[0],'base64url').toString('utf8'));}catch{return null;}
}
async function redis(env,commands){
 if(env.REDIS_URL)return redisWire(env.REDIS_URL,commands);
 const endpoint=env.UPSTASH_REDIS_REST_URL?.replace(/\/$/,'');
 if(!endpoint||!/^https:\/\//.test(endpoint))throw new Error('Redis URL inválida');
 const response=await fetch(endpoint+'/pipeline',{
  method:'POST',headers:{Authorization:'Bearer '+env.UPSTASH_REDIS_REST_TOKEN,'Content-Type':'application/json'},
  body:JSON.stringify(commands),signal:AbortSignal.timeout(6000)
 });
 if(!response.ok)throw new Error('Falha no serviço do ranking');
 const results=await response.json();
 if(!Array.isArray(results)||results.length!==commands.length)throw new Error('Resposta inesperada do ranking');
 for(const item of results)if(item.error)throw new Error('Falha ao executar comando no ranking');
 return results.map(x=>x.result);
}
const available=env=>Boolean(env.REDIS_URL||(env.UPSTASH_REDIS_REST_URL&&env.UPSTASH_REDIS_REST_TOKEN));
function parseScores(list){
 if(!Array.isArray(list))return [];
 const rows=[];for(let i=0;i+1<list.length;i+=2){const name=nickname(list[i]),score=Number(list[i+1]);if(name&&Number.isSafeInteger(score)&&score>=0)rows.push({name,score});}
 return rows;
}
function isSameOrigin(request){
 const origin=request.headers.get('origin');
 if(!origin)return true;
 try{return new URL(origin).host===new URL(request.url).host;}catch{return false;}
}
export async function luciferLeaderboard(request,env=process.env){
 if(!['GET','POST'].includes(request.method))return json({error:'Método não permitido'},405);
 if(request.method==='GET'){
  if(!available(env))return json({enabled:false,entries:[]});
  try{const [entries]=await redis(env,[['ZREVRANGE',LEADERBOARD,0,9,'WITHSCORES']]);return json({enabled:true,entries:parseScores(entries)});}
  catch{return json({enabled:false,entries:[],error:'Ranking temporariamente indisponível'},503);}
 }
 if(!isSameOrigin(request))return json({error:'Origem inválida'},403);
 if(!available(env))return json({enabled:false,error:'Ranking global não configurado'},503);
 const size=Number(request.headers.get('content-length')||0);if(size>4096)return json({error:'Dados muito grandes'},413);
 let data;try{data=await request.json();}catch{return json({error:'JSON inválido'},400);}
 if(!data||typeof data!=='object'||Array.isArray(data))return json({error:'Dados inválidos'},400);
 const key=signingKey(env);
 if(data.action==='start'){
  const name=nickname(data.name);if(!name)return json({error:'Nome inválido'},400);
  const run={id:b64(randomBytes(18)),name,created:Date.now()};
  try{
   const [result]=await redis(env,[['SET',SESSION_PREFIX+run.id,JSON.stringify({name,created:run.created}),'EX',SESSION_TTL,'NX']]);
   if(result!=='OK')return json({error:'Não foi possível iniciar o registro'},503);
   return json({ok:true,token:tokenFor(run,key),expiresIn:SESSION_TTL});
  }catch{return json({error:'Ranking indisponível'},503);}
 }
 if(data.action==='finish'){
  const run=decodeToken(data.token,key);
  const name=nickname(data.name);
  if(!run||!name||run.name!==name||typeof run.created!=='number'||typeof run.id!=='string')return json({error:'Partida inválida'},400);
  const wallTime=Date.now()-run.created;
  if(wallTime<1000||wallTime>MAX_RUN_MS+30000)return json({error:'Tempo inválido'},400);
  if(!validRun(data)||Math.abs(wallTime-data.elapsedMs)>30000)return json({error:'Pontuação inválida'},400);
  try{
   const [record]=await redis(env,[['GETDEL',SESSION_PREFIX+run.id]]);
   if(!record)return json({error:'Partida já registrada ou expirada'},409);
   let saved;try{saved=JSON.parse(record);}catch{return json({error:'Partida inválida'},400);}
   if(saved.name!==name||saved.created!==run.created)return json({error:'Partida inválida'},400);
   await redis(env,[['ZADD',LEADERBOARD,'GT',data.score,name]]);
   return json({ok:true,score:data.score});
  }catch{return json({error:'Falha ao registrar pontuação'},503);}
 }
 return json({error:'Ação desconhecida'},400);
}
