import test from 'node:test';
import assert from 'node:assert/strict';
import { handleApi } from '../server/recruitment-handler.js';

const origin = 'https://skulls.example';
const fixture = () => ({ characterFirstName: 'Candidato', characterLastName: 'fictício', cityId: '123', discordId: '123456789012345678',
  discordUser: 'candidato', instagram: '@personagem', ageOff: '21', university: 'sim',
  previousFraternity: 'Nenhuma', discovery: 'Pela história', motivation: 'Pertencimento',
  offering: 'Lealdade', lore: 'A volta da Ceifadora.', oath: true, website: '' });
const env = { RECRUITMENT_WEBHOOK_URL: 'https://hooks.example/recruitment' };
const post = (data = fixture(), headers = {}) => new Request(`${origin}/api/recruitment`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, ...headers }, body: JSON.stringify(data)
});

test('config exposes only activation state, never external form, endpoint or secret', async () => {
  const blank = await (await handleApi(new Request(`${origin}/api/config`), {})).json();
  assert.equal(blank.recruitmentEnabled, false);
  assert.deepEqual(blank, { recruitmentEnabled: false });
  const configured = await (await handleApi(new Request(`${origin}/api/config`), { ...env, RECRUITMENT_WEBHOOK_SECRET: 'private' })).text();
  assert.equal(JSON.parse(configured).recruitmentEnabled, true);
  assert.ok(!configured.includes('hooks.example') && !configured.includes('private'));
});

test('non-API request passes through and unsupported methods are rejected', async () => {
  assert.equal(await handleApi(new Request(`${origin}/`), env), null);
  assert.equal((await handleApi(new Request(`${origin}/api/recruitment`), env)).status, 405);
  assert.equal((await handleApi(new Request(`${origin}/api/missing`), env)).status, 404);
});

test('blank and invalid destinations do not transmit or report success', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Should not transmit'); };
  try {
    for (const value of ['', 'not-url', 'http://hooks.example', 'https://user:pass@hooks.example']) {
      const response = await handleApi(post(), { RECRUITMENT_WEBHOOK_URL: value });
      assert.equal(response.status, 503);
      assert.equal((await response.json()).ok, undefined);
    }
  } finally { globalThis.fetch = original; }
});

test('rejects foreign origin, invalid JSON type and oversized actual body without fetch', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Should not transmit'); };
  try {
    assert.equal((await handleApi(post(fixture(), { Origin: 'https://evil.example' }), env)).status, 403);
    assert.equal((await handleApi(post(fixture(), { 'Content-Type': 'text/plain' }), env)).status, 415);
    assert.equal((await handleApi(new Request(`${origin}/api/recruitment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(256 * 1024 + 1) }), env)).status, 413);
    assert.equal((await handleApi(new Request(`${origin}/api/recruitment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }), env)).status, 400);
  } finally { globalThis.fetch = original; }
});

test('required source fields and both yes-no question types are validated', async () => {
  const mutations = [
    d => delete d.characterFirstName, d => d.characterLastName = '', d => d.discordId = '',
    d => d.ageOff = 21, d => d.university = 'talvez', d => delete d.oath,
    d => d.oath = 'true', d => d.website = 'spam', d => d.motivation = {},
    d => d.characterFirstName = '\u0000bad'
  ];
  for (const mutate of mutations) {
    const data = fixture(); mutate(data);
    assert.equal((await handleApi(post(data), env)).status, 400);
  }
});

test('generic webhook receives versioned normalized event and server-only authorization', async () => {
  const original = globalThis.fetch;
  let received;
  globalThis.fetch = async (url, init) => { received = { url, init }; return new Response(null, { status: 204 }); };
  try {
    const data = fixture(); data.characterFirstName = '  Candidato  '; data.destination = 'https://evil.example';
    const response = await handleApi(post(data), { ...env, RECRUITMENT_WEBHOOK_SECRET: 'example-secret' });
    assert.equal(response.status, 201);
    assert.equal(received.url, env.RECRUITMENT_WEBHOOK_URL);
    assert.equal(received.init.headers.Authorization, 'Bearer example-secret');
    assert.equal(received.init.redirect, 'error');
    const event = JSON.parse(received.init.body);
    assert.equal(event.version, 1); assert.equal(event.type, 'skulls.recruitment.created');
    assert.equal(event.data.characterName, 'Candidato fictício'); assert.equal(event.data.ageOff, '21');
    assert.equal(event.data.destination, undefined); assert.equal(event.data.website, undefined);
    assert.ok(event.id && event.createdAt);
  } finally { globalThis.fetch = original; }
});

test('generic webhook accepts every text field at its valid Unicode maximum without truncation', async () => {
  const original = globalThis.fetch;
  let delivered;
  globalThis.fetch = async (_url, init) => {
    delivered = JSON.parse(init.body);
    return new Response(null, { status: 204 });
  };
  try {
    const limits = { characterFirstName: 120, characterLastName: 120, cityId: 80, discordUser: 120, instagram: 200,
      previousFraternity: 1000, discovery: 1500, motivation: 3000, offering: 3000, lore: 5000 };
    for (const character of ['á', '界', '𐍈']) {
      const data = fixture();
      for (const [key, max] of Object.entries(limits)) data[key] = character.repeat(max / character.length);
      data.discordId = '12345678901234567890';
      const bytes = new TextEncoder().encode(JSON.stringify(data)).byteLength;
      assert.ok(bytes > 20 * 1024 && bytes < 64 * 1024);
      const response = await handleApi(post(data), env);
      assert.equal(response.status, 201);
      for (const key of Object.keys(limits)) assert.equal(delivered.data[key], data[key]);
    }
  } finally { globalThis.fetch = original; }
});

test('Discord payload prevents mentions, bounds embed and attaches complete application', async () => {
  const original = globalThis.fetch;
  let payload, headers, attachment;
  globalThis.fetch = async (_url, init) => {
    assert.ok(init.body instanceof FormData);
    payload = JSON.parse(init.body.get('payload_json'));
    attachment = init.body.get('files[0]');
    headers = init.headers;
    return new Response(null, { status: 204 });
  };
  try {
    const data = fixture(); data.motivation = '@everyone '.repeat(300); data.offering = 'x'.repeat(3000); data.lore = 'y'.repeat(5000);
    const response = await handleApi(post(data), { RECRUITMENT_WEBHOOK_URL: 'https://discord.com/api/webhooks/123456789/token', RECRUITMENT_WEBHOOK_SECRET: 'never-to-discord' });
    assert.equal(response.status, 201); assert.deepEqual(payload.allowed_mentions, { parse: [] });
    assert.equal(headers.Authorization, undefined);
    assert.equal(headers['Content-Type'], undefined, 'fetch must create its own multipart boundary');
    const embed = payload.embeds[0];
    assert.ok(embed.fields.every(field => field.value.length <= 1024));
    const length = embed.title.length + embed.description.length + embed.footer.text.length + embed.fields.reduce((sum, field) => sum + field.name.length + field.value.length, 0);
    assert.ok(length <= 6000);
    assert.ok(embed.description.includes('recrutamento.txt'));
    assert.ok(embed.fields.some(field => field.name === 'História do personagem'));
    assert.equal(attachment.name, 'recrutamento.txt');
    assert.ok(attachment.type.startsWith('text/plain'));
    const complete = await attachment.text();
    for (const key of ['characterFirstName', 'characterLastName', 'cityId', 'discordId', 'discordUser', 'instagram',
      'previousFraternity', 'discovery', 'motivation', 'offering', 'lore']) {
      assert.ok(complete.includes(key==='characterName'?data[key]:data[key].trim()), `${key} must be attached in full after normalizing surrounding whitespace`);
    }
    assert.ok(complete.includes('Idade OFF\n21'));
    assert.ok(complete.includes('Universidade\nSim'));
    assert.ok(complete.includes('Juramento\nSim'));
    assert.ok(!complete.includes('Consentimento'));
    const delivered = await response.json();
    assert.ok(complete.includes(delivered.id));
    assert.match(complete, /Recebida em: \d{4}-\d{2}-\d{2}T/);
  } finally { globalThis.fetch = original; }
});

test('upstream rejection and transport failure never report delivered', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('Sensitive upstream detail', { status: 500 });
    const rejected = await handleApi(post(), env); assert.equal(rejected.status, 502);
    assert.ok(!(await rejected.text()).includes('Sensitive'));
    globalThis.fetch = async () => { throw new Error('endpoint-private-detail'); };
    const failed = await handleApi(post(), env); assert.equal(failed.status, 502);
    assert.ok(!(await failed.text()).includes('endpoint-private-detail'));
  } finally { globalThis.fetch = original; }
});

 test('source yes-no answers may be No and long stories are delivered intact',async()=>{
 const old=globalThis.fetch;let event;globalThis.fetch=async(_url,init)=>{event=JSON.parse(init.body);return new Response(null,{status:204});};
 try{const data=fixture();data.oath=false;data.university='nao';data.ageOff='21 anos';data.lore='Uma história sem cortes. '.repeat(1200);const response=await handleApi(post(data),env);assert.equal(response.status,201);assert.equal(event.data.oath,false);assert.equal(event.data.university,'nao');assert.equal(event.data.ageOff,'21 anos');assert.equal(event.data.lore,data.lore.trim());assert.equal(event.data.consent,undefined);}finally{globalThis.fetch=old;}
});
