import { NextResponse } from 'next/server';
import { authorized,db } from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){if(!await authorized())return NextResponse.json({error:'Unauthorized'},{status:401});try{const sql=db();const contacts=await sql`SELECT c.*, (SELECT body FROM messages WHERE contact_id=c.id ORDER BY created_at DESC,id DESC LIMIT 1) AS preview FROM contacts c ORDER BY updated_at DESC`;const messages=await sql`SELECT * FROM messages ORDER BY created_at,id`;return NextResponse.json({contacts,messages},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'โหลดข้อมูลไม่ได้ ตรวจสอบฐานข้อมูลและ schema.sql'},{status:503});}}
