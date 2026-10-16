import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { validToken } from './security';
export function db(){if(!process.env.DATABASE_URL)throw new Error('Database is not configured');return neon(process.env.DATABASE_URL);}
export async function authorized(){const secret=process.env.SESSION_SECRET;return !!secret&&validToken((await cookies()).get('session')?.value||'',secret);}
export async function line(path:string,options:RequestInit={}){const response=await fetch(`https://api.line.me/v2/bot/${path}`,{...options,headers:{Authorization:`Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,'Content-Type':'application/json',...options.headers},cache:'no-store'});if(!response.ok)throw new Error(`LINE request failed (${response.status})`);return response;}
