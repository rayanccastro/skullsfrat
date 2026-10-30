import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve, relative, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=resolve(root,'web');
const output=resolve(root,'public');
const assets=new Map();
async function collect(directory,prefix=''){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const name=prefix+entry.name;
    if(entry.isDirectory())await collect(resolve(directory,entry.name),`${name}/`);
    else assets.set(name,await readFile(resolve(directory,entry.name)));
  }
}
await collect(source);
if(!assets.has('index.html'))throw new Error('A página inicial não foi encontrada em web/.');
const hash=createHash('sha256');
for(const [name,bytes] of [...assets].sort(([a],[b])=>a.localeCompare(b)))hash.update(name).update(bytes);
const revision=hash.digest('hex').slice(0,12);
// Only this project's generated public/ directory may be replaced.
if(dirname(output)!==root||basename(output)!=='public'||relative(root,output)!=='public')throw new Error('Diretório de saída inválido.');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const [name,bytes] of assets){
  let content=bytes;
  if(name.endsWith('.html'))content=Buffer.from(bytes.toString('utf8').replace(/((?:src|href)=["'])(\/[^"'?]+\.(?:js|css))(["'])/g,`$1$2?v=${revision}$3`));
  if(name.endsWith('.js'))content=Buffer.from(bytes.toString('utf8').replace(/(from\s+["'])(\.\.?\/[^"'?]+\.js)(["'])/g,`$1$2?v=${revision}$3`));
  const destination=resolve(output,name);
  if(relative(output,destination).startsWith('..'))throw new Error('Caminho de arquivo inválido.');
  await mkdir(dirname(destination),{recursive:true});
  await writeFile(destination,content);
}
console.log(`Vercel: ${assets.size} arquivos compilados em public/ · versão ${revision}`);
