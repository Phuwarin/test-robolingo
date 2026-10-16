import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const next=createRequire(import.meta.url).resolve('next/dist/bin/next');
for(const role of ['api','web']){
 const result=spawnSync(process.execPath,[next,'build'],{stdio:'inherit',env:{...process.env,APP_ROLE:role,...(role==='web'?{API_PROXY_URL:'http://localhost:4099'}:{})}});
 if(result.status!==0)process.exit(result.status||1);
}
