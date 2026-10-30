import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import configFunction from '../api/config.js';
import recruitmentFunction from '../api/recruitment.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const settings=JSON.parse(await readFile(resolve(root,'vercel.json'),'utf8'));
const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
assert.equal(settings.outputDirectory,'public');assert.equal(settings.framework,null);assert.equal(pkg.engines.node,'24.x');
assert.equal(typeof configFunction.fetch,'function');assert.equal(typeof recruitmentFunction.fetch,'function');
const html=await readFile(resolve(root,'public/index.html'),'utf8');
assert.ok(html.includes('id="skulls-gate"'));assert.ok(!html.includes('forms.app'));
const entry=html.match(/src="(\/app\.js\?v=([a-f0-9]{12}))"/);assert.ok(entry);
const client=await readFile(resolve(root,'public/app.js'),'utf8');
assert.ok(client.includes(`./entrance.js?v=${entry[2]}`));assert.ok(client.includes(`./recruitment.js?v=${entry[2]}`));
assert.ok(client.includes(`./background-video.js?v=${entry[2]}`));
const game=await readFile(resolve(root,'public/game.js'),'utf8');assert.ok(game.includes(`./snake-engine.js?v=${entry[2]}`));
assert.ok(html.includes('id="site-video"'));
for(const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)(?:\?[^"#]*)?"/g))assert.ok((await stat(resolve(root,`public${match[1]}`))).isFile(),`Arquivo ausente: ${match[1]}`);
for(const filename of ['app.js','recruitment.js','audio.js','entrance.js','atmosphere.js','background-video.js','snake-engine.js']){
  const source=await readFile(resolve(root,'public',filename),'utf8');
  assert.ok(!source.includes('appgprj_')&&!source.includes('cloudflare:'));
}
console.log('Pacote Vercel validado: página, arquivos versionados, selo, áudio e funções Node.js.');
