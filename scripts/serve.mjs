import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
const port=Number(process.env.PORT||4173);
const root=resolve(process.cwd());
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://local');
    let requested=decodeURIComponent(url.pathname);
    if(requested==='/') requested='/index.html';
    const file=resolve(root, `.${requested}`);
    if(file!==root && !file.startsWith(root+sep)) throw new Error('outside root');
    const info=await stat(file);
    if(!info.isFile()) throw new Error('not file');
    const body=await readFile(file);
    res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-store','x-content-type-options':'nosniff'});
    res.end(body);
  }catch{res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Forex Lab PH → http://127.0.0.1:${port}`));
