import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// API นี้จะใช้ Service Role Key เพื่ออัปเดตข้อมูลโดยตรง
// เนื่องจาก Request จะมาจากเซิร์ฟเวอร์ของ iSMS ไม่ใช่ผู้ใช้ที่ Login

export async function POST(req) {
    // สร้าง Supabase client พิเศษด้วย Service Role Key
    // ซึ่งสามารถข้ามกฎ RLS (Row Level Security) ทั้งหมดได้
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
    );

    try {
        // 1. รับข้อมูล (Payload) ที่ iSMS ส่งมา
        const payload = await req.json();

        // Log a copy of the payload to help with debugging
        console.log("Received Webhook Payload:", JSON.stringify(payload, null, 2));

        // 2. ดึงข้อมูลที่จำเป็นออกจาก Payload อย่างยืดหยุ่น
        const smsUuid = payload.uuid || payload.sms_uuid || payload.message_uuid;
        const newStatusCode = payload.status;

        // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
        if (!smsUuid || newStatusCode === undefined) {
            // บันทึก Log ข้อผิดพลาดในฝั่งเซิร์ฟเวอร์ของเรา
            console.error("Webhook Error: Missing required fields. Could not find a valid UUID or status in the payload.", {
                receivedPayload: payload
            });
            
            // *** ส่วนที่แก้ไขสำคัญ ***
            // ตอบกลับ 200 OK เสมอ เพื่อไม่ให้ iSMS มองว่า Webhook ของเรามีปัญหา
            // ปัญหาอยู่ที่การประมวลผลของเรา ไม่ใช่การส่งของเขา
            return NextResponse.json({ success: true, message: 'Webhook received, but payload structure was not as expected. Logged for review.' });
        }

        // 3. ค้นหาข้อความในฐานข้อมูลและอัปเดตสถานะ
        const { error } = await supabaseAdmin
            .from('sms_messages')
            .update({ status_code: newStatusCode })
            .eq('sms_uuid', smsUuid); // ค้นหาจาก sms_uuid ที่ตรงกัน

        if (error) {
            // หากเกิด error ตอนอัปเดตฐานข้อมูล ให้บันทึกไว้ใน Log ของเซิร์ฟเวอร์
            console.error("Webhook DB Update Error:", error);
            // แต่ยังคงตอบกลับ 200 OK เพื่อไม่ให้ iSMS ส่งข้อมูลมาซ้ำ
        }

        // 4. ตอบกลับไปยัง iSMS เพื่อยืนยันว่าได้รับข้อมูลแล้ว
        return NextResponse.json({ success: true, message: 'Webhook received and processed successfully.' });

    } catch (error) {
        // กรณีที่ Payload ที่ส่งมาไม่ใช่ JSON หรือเกิดข้อผิดพลาดร้ายแรง
        console.error("Webhook Processing Error:", error.message);
        // ตอบกลับ 200 OK แม้จะเกิดข้อผิดพลาดร้ายแรง เพื่อรักษาความเสถียรของ Webhook
        return NextResponse.json({ success: true, message: 'Webhook received but failed to process. Logged for review.' });
    }
}
