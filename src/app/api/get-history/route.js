import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    try {
        // ใช้ Supabase client เพื่อดึงข้อมูล
        const { data: history, error } = await supabase
            .from('sms_history')
            .select('*')
            .order('sent_at', { ascending: false })
            .limit(100);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, history });

    } catch (error) {
        console.error("Get History Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
