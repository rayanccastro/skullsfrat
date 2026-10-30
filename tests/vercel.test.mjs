import test from 'node:test';
import assert from 'node:assert/strict';
import configFunction from '../api/config.js';
import recruitmentFunction from '../api/recruitment.js';
import { localApp } from '../server/local-app.js';

const origin='https://skulls-test.vercel.app';
const fields=()=>({characterFirstName:'Nome',characterLastName:'Fictício',cityId:'123',discordId:'477781963214815233',discordUser:'@teste',instagram:'@personagem',ageOff:'21',university:'nao',previousFraternity:'Não',discovery:'Pela história.',motivation:'Pertencimento.',offering:'Lealdade.',lore:'Uma história fictícia para testar a entrega.',oath:false,website:''});
const request=(method='POST',data=fields(),requestOrigin=origin)=>new Request(`${origin}/api/recruitment`,{method,headers:{'Content-Type':'application/json',Origin:requestOrigin},...(!['GET','HEAD'].includes(method)?{body:JSON.stringify(data)}:{})});
async function withEnvironment(values,action){
  const saved={};for(const key of ['RECRUITMENT_WEBHOOK_URL','RECRUITMENT_WEBHOOK_SECRET']){saved[key]=process.env[key];process.env[key]=values[key]||'';}
  try{return await action();}finally{for(const [key,value] of Object.entries(saved))if(value===undefined)delete process.env[key];else process.env[key]=value;}
}
test('Vercel entrypoints return native Response objects and only a public activation flag',async()=>{
  assert.equal(typeof configFunction.fetch,'function');assert.equal(typeof recruitmentFunction.fetch,'function');
  await withEnvironment({},async()=>{const response=await configFunction.fetch(new Request(`${origin}/api/config`));assert.ok(response instanceof Response);assert.deepEqual(await response.json(),{recruitmentEnabled:false});assert.equal(response.headers.get('Cache-Control'),'no-store');});
  await withEnvironment({RECRUITMENT_WEBHOOK_URL:'https://hooks.example/test',RECRUITMENT_WEBHOOK_SECRET:'test-only-secret'},async()=>{const response=await configFunction.fetch(new Request(`${origin}/api/config`));assert.deepEqual(await response.json(),{recruitmentEnabled:true});});
});
test('Vercel recruitment rejects unavailable delivery and invalid origins through the real entrypoint',async()=>{
  await withEnvironment({},async()=>{const response=await recruitmentFunction.fetch(request());assert.equal(response.status,503);assert.equal((await response.json()).ok,undefined);});
  assert.equal((await recruitmentFunction.fetch(request('POST',fields(),'https://foreign.example'))).status,403);
  assert.equal((await recruitmentFunction.fetch(request('GET'))).status,405);
});
test('Vercel recruitment forwards the whole request using runtime-only environment variables',async()=>{
  const oldFetch=globalThis.fetch;let delivered;
  globalThis.fetch=async(url,init)=>{delivered={url,init};return new Response(null,{status:204});};
  try{
    await withEnvironment({RECRUITMENT_WEBHOOK_URL:'https://hooks.example/test',RECRUITMENT_WEBHOOK_SECRET:'test-only-secret'},async()=>{
      const data=fields();data.lore='História completa. '.repeat(1000);
      const response=await recruitmentFunction.fetch(request('POST',data));assert.equal(response.status,201);
      const event=JSON.parse(delivered.init.body);assert.equal(event.data.lore,data.lore.trim());assert.equal(event.data.oath,false);assert.equal(event.data.characterName,'Nome Fictício');
      assert.equal(delivered.url,'https://hooks.example/test');assert.equal(delivered.init.headers.Authorization,'Bearer test-only-secret');
      const result=await response.json();assert.ok(result.ok&&result.id);assert.ok(!JSON.stringify(result).includes('secret'));
    });
  }finally{globalThis.fetch=oldFetch;}
});
test('compiled static page and versioned code load together without the old hosting runtime',async()=>{
  const response=await localApp(new Request(`${origin}/`));assert.equal(response.status,200);
  const html=await response.text();assert.ok(html.includes('id="skulls-gate"'));assert.ok(!html.includes('chatgpt.site')&&!html.includes('forms.app'));
  const entry=html.match(/src="(\/app\.js\?v=([a-f0-9]{12}))"/);assert.ok(entry);
  const script=await localApp(new Request(`${origin}${entry[1]}`));assert.equal(script.status,200);assert.match(script.headers.get('Content-Type'),/^text\/javascript/);
  const source=await script.text();assert.ok(source.includes(`./entrance.js?v=${entry[2]}`));assert.ok(source.includes(`./recruitment.js?v=${entry[2]}`));
  const form=await import(`../public/recruitment.js?v=${entry[2]}`);assert.equal(form.FORM_QUESTIONS.length,12);
});
test('API routing remains separate from static assets, including 404 and HEAD responses',async()=>{
  await withEnvironment({},async()=>{const response=await localApp(new Request(`${origin}/api/config`));assert.deepEqual(await response.json(),{recruitmentEnabled:false});});
  assert.equal((await localApp(new Request(`${origin}/api/missing`))).status,404);
  assert.equal((await localApp(new Request(`${origin}/server/recruitment-handler.js`))).status,404);
  assert.equal((await localApp(new Request(`${origin}/%2e%2e%2fserver/recruitment-handler.js`))).status,404);
  const head=await localApp(new Request(`${origin}/assets/crest.png`,{method:'HEAD'}));assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);
});
