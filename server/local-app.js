import { readFile } from 'node:fs/promises';
import { resolve, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import configFunction from '../api/config.js';
import recruitmentFunction from '../api/recruitment.js';

const publicDirectory=resolve(dirname(fileURLToPath(import.meta.url)),'../public');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
export async function localApp(request){
  const url=new URL(request.url);
  if(url.pathname==='/api/config')return configFunction.fetch(request);
  if(url.pathname==='/api/recruitment')return recruitmentFunction.fetch(request);
  if(url.pathname.startsWith('/api/'))return Response.json({error:'Página não encontrada.'},{status:404});
  if(!['GET','HEAD'].includes(request.method))return new Response('Método não permitido.',{status:405,headers:{Allow:'GET, HEAD'}});
  let pathname;
  try{pathname=decodeURIComponent(url.pathname);}catch{return new Response('Endereço inválido.',{status:400});}
  const file=resolve(publicDirectory,pathname==='/'?'index.html':`.${pathname}`);
  const path=relative(publicDirectory,file);
  if(path.startsWith('..')||path==='')return new Response('Página não encontrada.',{status:404});
  try{
    const bytes=await readFile(file),type=mime[extname(file)]||'application/octet-stream';
    return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':type,'Cache-Control':type.startsWith('image/')?'public, max-age=3600':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
  }catch(error){
    if(['ENOENT','EISDIR','ENOTDIR'].includes(error.code))return new Response('Página não encontrada.',{status:404});
    throw error;
  }
}
