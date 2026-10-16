import { NextResponse } from 'next/server';
import { authorized,db,line } from '@/lib/server';
export async function POST(request:Request){
 if(!await authorized())return NextResponse.json({error:'Unauthorized'},{status:401});
 if(request.headers.get('origin')!==(process.env.WEB_ORIGIN||new URL(request.url).origin))return NextResponse.json({error:'Invalid origin'},{status:403});
 const data=await request.json().catch(()=>({}));
 if(typeof data.to!=='string'||typeof data.text!=='string'||!data.text.trim()||data.text.length>5000||typeof data.id!=='string'||!/^[0-9a-f-]{36}$/i.test(data.id))return NextResponse.json({error:'ข้อมูลข้อความไม่ถูกต้อง (สูงสุด 5,000 ตัวอักษร)'},{status:400});
 try{const sql=db();const contacts=await sql`SELECT id FROM contacts WHERE id=${data.to}`;if(!contacts.length)return NextResponse.json({error:'ไม่พบผู้ใช้'},{status:404});
 const existing=await sql`SELECT id FROM messages WHERE id=${data.id}`;if(existing.length)return NextResponse.json({ok:true});
 const response=await line('message/push',{method:'POST',headers:{'X-Line-Retry-Key':data.id},body:JSON.stringify({to:data.to,messages:[{type:'text',text:data.text.trim()}]})}).catch(error=>{throw error;});
 if(!response.ok)throw new Error('LINE rejected message');
 await sql.transaction([sql`INSERT INTO messages(id,contact_id,direction,body) VALUES(${data.id},${data.to},'out',${data.text.trim()}) ON CONFLICT DO NOTHING`,sql`UPDATE contacts SET updated_at=now() WHERE id=${data.to}`]);return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'ส่งไม่สำเร็จ กรุณาตรวจสอบ LINE token / โควตา แล้วลองอีกครั้ง'},{status:502});}
}
