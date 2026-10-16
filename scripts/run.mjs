import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const next=require.resolve('next/dist/bin/next');
const production=process.argv.includes('--production');
const children=[];
function launch(role,port,extra={}){
 const child=spawn(process.execPath,[next,production?'start':'dev','--port',String(port)],{stdio:'inherit',env:{...process.env,APP_ROLE:role,WEB_ORIGIN:'http://localhost:3099',...extra}});
 children.push(child);
 child.on('exit',code=>{if(!stopping){stop();process.exitCode=code||0;}});
}
let stopping=false;
function stop(){stopping=true;for(const child of children)child.kill();}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
launch('api',4099);
launch('web',3099,{API_PROXY_URL:'http://localhost:4099'});
