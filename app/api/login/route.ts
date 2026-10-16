import { NextResponse } from 'next/server';
import { equal,token } from '@/lib/security';
export async function POST(request:Request){
 const password=process.env.ADMIN_PASSWORD,secret=process.env.SESSION_SECRET;
 if(!password||!secret)return NextResponse.json({error:'กรุณาตั้งค่า ADMIN_PASSWORD และ SESSION_SECRET บนเซิร์ฟเวอร์'},{status:503});
 const data=await request.json().catch(()=>({}));
 if(typeof data.password!=='string'||!equal(data.password,password))return NextResponse.json({error:'รหัสผ่านไม่ถูกต้อง'},{status:401});
 const response=NextResponse.json({ok:true});response.cookies.set('session',token(secret),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:28800});return response;
}
export async function DELETE(){const response=NextResponse.json({ok:true});response.cookies.set('session','',{path:'/',maxAge:0});return response;}
