/** Lightweight Redis RESP2 transport for the Vercel Redis REDIS_URL integration.
 * No npm dependencies and no credentials exposed in client bundles. */
import { createConnection } from 'node:net';
import { connect as tlsConnect } from 'node:tls';

const MAX_REPLY_BYTES = 4 * 1024 * 1024;
const TIMEOUT_MS = 7000;

function commandBytes(args) {
  const parts = [Buffer.from(`*${args.length}\r\n`)];
  for (const item of args) {
    const value = Buffer.from(String(item), 'utf8');
    parts.push(Buffer.from(`$${value.byteLength}\r\n`), value, Buffer.from('\r\n'));
  }
  return Buffer.concat(parts);
}

export function parseRedisReply(buffer, position = 0) {
  if (position >= buffer.length) return null;
  const type = String.fromCharCode(buffer[position]);
  const marker = buffer.indexOf('\r\n', position + 1);
  if (marker < 0) return null;
  const value = buffer.toString('utf8', position + 1, marker);
  let cursor = marker + 2;
  if (type === '-') throw new Error('Redis recusou a operação');
  if (type === '+') return { result: value, end: cursor };
  if (type === ':') {
    const int = Number(value);
    if (!Number.isSafeInteger(int)) throw new Error('Resposta Redis inválida');
    return { result: int, end: cursor };
  }
  if (type === '$') {
    const length = Number(value);
    if (!Number.isInteger(length) || length < -1 || length > MAX_REPLY_BYTES) throw new Error('Resposta Redis inválida');
    if (length === -1) return { result: null, end: cursor };
    if (buffer.length < cursor + length + 2) return null;
    if (buffer[cursor + length] !== 13 || buffer[cursor + length + 1] !== 10) throw new Error('Resposta Redis inválida');
    return { result: buffer.toString('utf8', cursor, cursor + length), end: cursor + length + 2 };
  }
  if (type === '*') {
    const count = Number(value);
    if (!Number.isInteger(count) || count < -1 || count > 50000) throw new Error('Resposta Redis inválida');
    if (count === -1) return { result: null, end: cursor };
    const rows = [];
    for (let i = 0; i < count; i++) {
      const parsed = parseRedisReply(buffer, cursor);
      if (!parsed) return null;
      rows.push(parsed.result);
      cursor = parsed.end;
    }
    return { result: rows, end: cursor };
  }
  throw new Error('Protocolo Redis desconhecido');
}

function readReplies(socket, expected, send) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0);
    let settled = false;
    let replies = [];
    const cleanup = () => {
      socket.removeListener('data', onData);
      socket.removeListener('error', onError);
      socket.removeListener('close', onClose);
    };
    const fail = () => { if (!settled) { settled = true; cleanup(); reject(new Error('Redis temporariamente indisponível')); } };
    const onError = () => fail();
    const onClose = () => fail();
    const onData = chunk => {
      if (settled) return;
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length > MAX_REPLY_BYTES) return fail();
      try {
        let offset = 0;
        while (replies.length < expected) {
          const parsed = parseRedisReply(buffer, offset);
          if (!parsed) break;
          replies.push(parsed.result);
          offset = parsed.end;
        }
        if (offset) buffer = buffer.subarray(offset);
        if (replies.length === expected) { settled = true; cleanup(); resolve(replies); }
      } catch { fail(); }
    };
    socket.on('data', onData);
    socket.on('error', onError);
    socket.on('close', onClose);
    try { socket.write(Buffer.concat(send.map(commandBytes))); } catch { fail(); }
  });
}

export async function redisWire(urlString, commands) {
  if (!urlString || !Array.isArray(commands) || !commands.length) throw new Error('Parâmetros Redis inválidos');
  let url;
  try { url = new URL(urlString); } catch { throw new Error('REDIS_URL inválida'); }
  if (!['redis:', 'rediss:'].includes(url.protocol) || !url.hostname || url.search || url.hash) throw new Error('REDIS_URL inválida');
  const port = Number(url.port || (url.protocol === 'rediss:' ? 6380 : 6379));
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error('REDIS_URL inválida');
  const socket = url.protocol === 'rediss:'
    ? tlsConnect({ host: url.hostname, port, servername: url.hostname, rejectUnauthorized: true })
    : createConnection({ host: url.hostname, port });
  socket.setTimeout(TIMEOUT_MS, () => socket.destroy());
  try {
    await new Promise((resolve, reject) => {
      const success = () => { socket.removeListener('error', failure); resolve(); };
      const failure = () => { socket.removeListener(url.protocol === 'rediss:' ? 'secureConnect' : 'connect', success); reject(new Error('Redis indisponível')); };
      socket.once(url.protocol === 'rediss:' ? 'secureConnect' : 'connect', success);
      socket.once('error', failure);
    });
    const initial = [];
    const user = decodeURIComponent(url.username);
    const pass = decodeURIComponent(url.password);
    if (pass) initial.push(user ? ['AUTH', user, pass] : ['AUTH', pass]);
    const database = url.pathname.replace(/^\//, '');
    if (database && database !== '0') {
      if (!/^\d{1,3}$/.test(database)) throw new Error('Banco Redis inválido');
      initial.push(['SELECT', database]);
    }
    const responses = await readReplies(socket, initial.length + commands.length, [...initial, ...commands]);
    if (initial.some((_, i) => responses[i] !== 'OK')) throw new Error('Falha de autenticação Redis');
    return responses.slice(initial.length);
  } finally {
    socket.end();
    socket.destroy();
  }
}
