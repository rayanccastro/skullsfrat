const MAX_BODY_BYTES = 256 * 1024;
const STRING_FIELDS = ['characterFirstName','characterLastName','cityId','discordId','discordUser','instagram','ageOff','previousFraternity','discovery','motivation','offering','lore'];

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders }
  });
}

function destination(env) {
  const raw = env?.RECRUITMENT_WEBHOOK_URL;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.hash) return null;
    return url;
  } catch { return null; }
}

async function readBoundedJson(request) {
  const declared = request.headers.get('Content-Length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY_BYTES)) {
    throw { status: 413, message: 'A inscrição excede o tamanho permitido.' };
  }
  if (!request.body) throw { status: 400, message: 'Preencha os dados da inscrição.' };
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw { status: 413, message: 'A inscrição excede o tamanho permitido.' };
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw { status: 400, message: 'Os dados enviados não são válidos.' }; }
}

function validate(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (typeof raw.website !== 'undefined' && raw.website !== '') return null;
  const data = {};
  for (const key of STRING_FIELDS) {
    if (typeof raw[key] !== 'string') return null;
    const text = raw[key].trim();
    if (!text.length || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) return null;
    data[key] = text;
  }
  data.characterName = `${data.characterFirstName} ${data.characterLastName}`;
  if (raw.university !== 'sim' && raw.university !== 'nao') return null;
  data.university = raw.university;
  if (typeof raw.oath !== 'boolean') return null;
  data.oath = raw.oath;
  return data;
}

function isDiscord(url) {
  return (url.hostname === 'discord.com' || url.hostname === 'discordapp.com') &&
    /^\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+\/?$/.test(url.pathname);
}

function discordPayload(data, event) {
  const fields = [
    ['Personagem', data.characterName, 120], ['ID na cidade', data.cityId, 80],
    ['Discord ID', data.discordId, 20], ['Usuário do Discord', data.discordUser, 120],
    ['Instagram', data.instagram, 200], ['Idade OFF', data.ageOff, 120],
    ['Universidade', data.university === 'sim' ? 'Sim' : 'Não', 3],
    ['Fraternidade anterior', data.previousFraternity, 500], ['Como conheceu os Skulls', data.discovery, 600],
    ['Motivação', data.motivation, 1000], ['O que oferece à irmandade', data.offering, 1000],
    ['História do personagem', data.lore, 1000],
    ['Juramento', data.oath ? 'Sim' : 'Não', 100]
  ];
  const title = 'Skulls · Nova solicitação de recrutamento';
  const description = 'Uma nova inscrição chegou pelo site da fraternidade. A ficha completa está no arquivo recrutamento.txt em anexo.';
  const footer = `Inscrição ${event.id}`;
  let remaining = 5900 - title.length - description.length - footer.length;
  const discordFields = fields.map(([name, value, cap]) => {
    remaining -= name.length;
    const limit = Math.min(cap, 1024, remaining);
    const clipped = value.length > limit ? value.slice(0, Math.max(0, limit - 1)) + '…' : value;
    remaining -= clipped.length;
    return { name, value: clipped || '—', inline: false };
  });
  return {
    username: 'Skulls Fraternity', allowed_mentions: { parse: [] },
    embeds: [{ title, description, color: 0xd62626, timestamp: event.createdAt,
      fields: discordFields, footer: { text: footer } }]
  };
}

function fullApplication(data, event) {
  return [
    'SKULLS FRATERNITY · SOLICITAÇÃO DE RECRUTAMENTO',
    `Inscrição: ${event.id}`,
    `Recebida em: ${event.createdAt}`,
    '',
    ...[
      ['Personagem', data.characterName], ['ID na cidade', data.cityId],
      ['Discord ID', data.discordId], ['Usuário do Discord', data.discordUser],
      ['Instagram', data.instagram], ['Idade OFF', data.ageOff],
      ['Universidade', data.university === 'sim' ? 'Sim' : 'Não'],
      ['Fraternidade anterior', data.previousFraternity],
      ['Como conheceu os Skulls', data.discovery], ['Motivação', data.motivation],
      ['O que oferece à irmandade', data.offering], ['História do personagem', data.lore],
      ['Juramento', data.oath ? 'Sim' : 'Não']
    ].map(([name, value]) => `${name}\n${value}\n`)
  ].join('\n');
}

export async function handleApi(request, env = {}) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return null;
  if (url.pathname === '/api/config') {
    if (request.method !== 'GET') return json({ error: 'Método não permitido.' }, 405, { Allow: 'GET' });
    return json({ recruitmentEnabled: Boolean(destination(env)) });
  }
  if (url.pathname !== '/api/recruitment') return json({ error: 'Página não encontrada.' }, 404);
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405, { Allow: 'POST' });
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) return json({ error: 'A origem da inscrição não é permitida.' }, 403);
  if (!/^application\/json(?:\s*;|\s*$)/i.test(request.headers.get('Content-Type') || '')) {
    return json({ error: 'Envie a inscrição no formato correto.' }, 415);
  }
  let raw;
  try { raw = await readBoundedJson(request); }
  catch (error) { return json({ error: error.message || 'Não foi possível ler a inscrição.' }, error.status || 400); }
  const data = validate(raw);
  if (!data) return json({ error: 'Revise os campos obrigatórios e escolha uma resposta para as perguntas de Sim ou Não.' }, 400);
  const target = destination(env);
  if (!target) return json({ error: 'O envio das inscrições ainda não foi ativado. O recrutamento será liberado em breve.' }, 503);

  const event = { version: 1, type: 'skulls.recruitment.created', id: crypto.randomUUID(), createdAt: new Date().toISOString(), data };
  const discord = isDiscord(target);
  const headers = {};
  let body;
  if (discord) {
    body = new FormData();
    body.append('payload_json', JSON.stringify(discordPayload(data, event)));
    body.append('files[0]', new Blob([fullApplication(data, event)], { type: 'text/plain;charset=utf-8' }), 'recrutamento.txt');
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(event);
  }
  if (!discord && typeof env.RECRUITMENT_WEBHOOK_SECRET === 'string' && env.RECRUITMENT_WEBHOOK_SECRET) {
    headers.Authorization = `Bearer ${env.RECRUITMENT_WEBHOOK_SECRET}`;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const upstream = await fetch(target.href, {
      method: 'POST', headers, redirect: 'error', signal: controller.signal,
      body
    });
    if (!upstream.ok) {
      await upstream.body?.cancel();
      return json({ error: 'A inscrição não foi entregue. Suas respostas continuam nesta página. Tente novamente mais tarde.' }, 502);
    }
    await upstream.body?.cancel();
    return json({ ok: true, id: event.id, message: 'Sua solicitação foi entregue à fraternidade.' }, 201);
  } catch {
    return json({ error: 'Não foi possível entregar a inscrição. Suas respostas continuam nesta página. Tente novamente mais tarde.' }, 502);
  } finally { clearTimeout(timeout); }
}
