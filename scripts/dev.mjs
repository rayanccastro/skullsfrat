import { createServer } from 'node:http';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';
import { localApp } from '../server/local-app.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
try{loadEnvFile(resolve(root,'.env.local'));}catch(error){if(error.code!=='ENOENT')throw error;}
const port=Number(process.env.PORT||3000);
const server=createServer(async(req,res)=>{
  try{
    const request=new Request(`http://localhost:${port}${req.url}`,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});
    const response=await localApp(request);
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end('Não foi possível abrir esta página.');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Skulls · Vercel local: http://localhost:${port}`));
