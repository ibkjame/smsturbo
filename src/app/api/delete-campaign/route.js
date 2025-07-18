import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// API นี้จะใช้ Service Role Key เพื่อลบข้อมูลโดยไม่ต้องตรวจสอบสิทธิ์ผู้ใช้
// ทำให้สามารถลบข้อมูลได้แม้จะไม่มีการ Login

export async function POST(req) {
    // สร้าง Supabase client พิเศษด้วย Service Role Key
    // ซึ่งสามารถข้ามกฎ RLS (Row Level Security) ทั้งหมดได้
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY, // คีย์ลับที่ต้องตั้งค่าใน Environment
        { auth: { persistSession: false } }
    );

    try {
        const { campaignId } = await req.json();

        if (!campaignId) {
            return NextResponse.json({ success: false, message: 'Campaign ID is required' }, { status: 400 });
        }

        // ใช้ admin client ในการลบข้อมูล
        const { error } = await supabaseAdmin
            .from('campaigns')
            .delete()
            .eq('id', campaignId);

        if (error) {
            // หากเกิด error จาก Supabase ให้ส่งต่อไป
            throw error;
        }

        // การลบแคมเปญจะทำให้ข้อความที่เกี่ยวข้องถูกลบไปด้วยโดยอัตโนมัติ
        // เนื่องจากเราได้ตั้งค่า ON DELETE CASCADE ไว้ในฐานข้อมูล

        return NextResponse.json({ success: true, message: 'แคมเปญถูกลบเรียบร้อยแล้ว' });

    } catch (error) {
        console.error("Delete Campaign Error:", error);
        return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการลบแคมเปญ: ' + error.message }, { status: 500 });
    }
}
