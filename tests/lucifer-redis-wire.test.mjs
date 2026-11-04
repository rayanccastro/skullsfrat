import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { parseRedisReply, redisWire } from '../server/lucifer-redis-wire.js';

test('RESP2 reconhece inteiros, strings, listas e respostas parciais', () => {
  const reply = Buffer.from('*4\r\n$4\r\nname\r\n:10\r\n$-1\r\n+OK\r\n');
  assert.deepEqual(parseRedisReply(reply)?.result,['name',10,null,'OK']);
  assert.equal(parseRedisReply(reply.subarray(0,9)), null);
  assert.throws(() => parseRedisReply(Buffer.from('-ERR password\r\n')), /Redis recusou/);
});

test('Redis integrado responde a comandos pipelined em TCP', async () => {
  const server=createServer(socket=>{
    let buffer=Buffer.alloc(0);
    socket.on('data', chunk=>{
      buffer=Buffer.concat([buffer,chunk]);
      let commands=0;
      for(let i=0;i<buffer.length-3;i++) if(buffer.subarray(i,i+4).equals(Buffer.from('*2\r\n')))commands++;
      // Test fixture emits both replies split across packets, like real streaming TCP.
      if(buffer.includes(Buffer.from('$3\r\nfoo\r\n'))&&buffer.includes(Buffer.from('$3\r\nbar\r\n'))){
        socket.write('*2\r\n$3\r\nfoo\r\n');
        socket.write('$2\r\n10\r\n:1\r\n');
        buffer=Buffer.alloc(0);
      }
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const port=server.address().port;
    const r=await redisWire(`redis://127.0.0.1:${port}`, [['GET','foo'],['SET','bar']]);
    assert.deepEqual(r,[['foo','10'],1]);
  } finally {await new Promise(resolve=>server.close(resolve));}
});
