import { createHmac, timingSafeEqual } from 'node:crypto';
export function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function validSignature(body:string,signature:string,secret:string){return equal(createHmac('sha256',secret).update(body).digest('base64'),signature);}
export function token(secret:string,expires=Date.now()+8*60*60*1000){return `${expires}.${createHmac('sha256',secret).update(String(expires)).digest('hex')}`;}
export function validToken(value:string,secret:string){const [expiry]=value.split('.');return Number(expiry)>Date.now()&&equal(value,token(secret,Number(expiry)));}
