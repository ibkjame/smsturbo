import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // ดึงรหัสผ่านที่ผู้ใช้กรอกจาก request
    const { password } = await req.json();

    // ดึงรหัสผ่านที่ถูกต้องจาก Environment Variable
    const correctPassword = process.env.LOGIN_PASSWORD;

    // ตรวจสอบว่ามีการตั้งค่ารหัสผ่านบนเซิร์ฟเวอร์หรือไม่
    if (!correctPassword) {
      throw new Error('ยังไม่ได้ตั้งค่ารหัสผ่านในระบบ');
    }

    // เปรียบเทียบรหัสผ่าน
    if (password === correctPassword) {
      // หากถูกต้อง ให้ส่ง "success: true" กลับไป
      return NextResponse.json({ success: true });
    } else {
      // หากไม่ถูกต้อง ให้ส่งข้อความแจ้งเตือนกลับไป
      return NextResponse.json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ success: false, message: error.message || 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' }, { status: 500 });
  }
}