import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const generateShortId = (length = 6) => {
    return Math.random().toString(36).substring(2, 2 + length);
};

async function callIsmsApi(data) {
    const url = 'https://portal.isms.asia/sms-api/message-sms/send';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.ISMS_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("iSMS API Error:", error);
        return { status: 'error', system_message: error.message };
    }
}

export async function POST(req) {
    try {
        const { messages } = await req.json();
        if (!messages || messages.length === 0) {
            return NextResponse.json({ success: false, message: 'ไม่มีข้อมูลสำหรับส่ง' }, { status: 400 });
        }

        let successCount = 0;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        for (const msg of messages) {
            const { recipient, message: originalMessage } = msg;

            let finalMessage = originalMessage;
            let trackingId = null;
            let originalUrl = null;

            const urlMatch = originalMessage.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
                originalUrl = urlMatch[0];
                trackingId = generateShortId();
                const trackingUrl = `${baseUrl}/api/tracker/${trackingId}`;
                finalMessage = originalMessage.replace(originalUrl, trackingUrl);
            }
            
            // 1. Insert initial record
            const { data: insertedData, error: insertError } = await supabase
                .from('sms_history')
                .insert([{ recipient, message: finalMessage, tracking_id: trackingId, original_url: originalUrl }])
                .select()
                .single();

            if (insertError) throw insertError;
            const dbId = insertedData.id;

            // 2. Call iSMS API
            const apiResult = await callIsmsApi({ recipient, sender_name: process.env.ISMS_SENDER_NAME, message: finalMessage });

            // 3. Update record with API response
            if (apiResult.status === 'success') {
                successCount++;
                const { error: updateError } = await supabase
                    .from('sms_history')
                    .update({ 
                        sms_uuid: apiResult.data.uuid, 
                        ref_no: apiResult.data.ref_no, 
                        status_code: apiResult.data.status, 
                        cost: apiResult.data.cost 
                    })
                    .eq('id', dbId);
                if (updateError) throw updateError;
            } else {
                const { error: updateError } = await supabase
                    .from('sms_history')
                    .update({ status_code: 2 }) // 2 = Failed
                    .eq('id', dbId);
                if (updateError) throw updateError;
            }
        }

        return NextResponse.json({ success: true, message: `ประมวลผลเสร็จสิ้น: ส่งสำเร็จ ${successCount} จาก ${messages.length} ข้อความ` });

    } catch (error) {
        console.error("Server-side error in /api/send-sms:", error);
        return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์: ' + error.message }, { status: 500 });
    }
}
