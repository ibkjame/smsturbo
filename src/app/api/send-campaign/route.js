import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { spamWords } from '@/lib/spam-words';

// ฟังก์ชัน callIsmsApi ยังคงเดิม ไม่มีการเปลี่ยนแปลง
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
        return await response.json();
    } catch (error) {
        return { status: 'error', system_message: error.message };
    }
}

export async function POST(req) {
    try {
        const { name, recipients, messageText, senderName, pin, url } = await req.json();

        // ตรวจสอบคำต้องห้ามก่อนส่ง
        const foundSpam = spamWords.filter(word => messageText.includes(word));
        if (foundSpam.length > 0) {
            return NextResponse.json({ success: false, message: `ไม่สามารถส่งข้อความได้ เนื่องจากพบคำต้องห้าม: ${foundSpam.join(', ')}` }, { status: 400 });
        }

        // 1. ตรวจสอบ PIN
        const correctPin = process.env.CAMPAIGN_SEND_PIN;
        if (!correctPin || pin !== correctPin) {
            return NextResponse.json({ success: false, message: 'PIN ไม่ถูกต้อง' }, { status: 403 });
        }
        
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const lockedUrl = process.env.LOCKED_TRACKING_URL;
        if (!lockedUrl) throw new Error("LOCKED_TRACKING_URL is not configured.");
        
        const originalUrl = url || lockedUrl;
        const fullMessage = `${messageText} ${originalUrl}`;

        // 2. สร้างแคมเปญในฐานข้อมูล
        const { data: campaignData, error: campaignError } = await supabase
            .from('campaigns')
            .insert([{ name, message_template: fullMessage, original_url: originalUrl, total_recipients: recipients.length }])
            .select()
            .single();
        if (campaignError) throw campaignError;
        const campaignId = campaignData.id;

        // --- ส่วนที่แก้ไขใหม่ทั้งหมด ---
        // 3. เรียกใช้ฟังก์ชันใน Supabase เพื่อ "จอง" ID เริ่มต้น
        let { data: nextId, error: rpcError } = await supabase.rpc('get_next_bk_id');
        if (rpcError) throw rpcError;
        
        let currentId = nextId;
        let successCount = 0;
        
        // 4. วนลูปเพื่อสร้างข้อความและส่ง SMS
        for (const recipient of recipients) {
            const trackingId = `bk${currentId}`;
            const trackingUrl = `${baseUrl}/${trackingId}`;
            const finalMessage = `${messageText} ${trackingUrl}`;

            // บันทึกข้อความลงฐานข้อมูล
            const { data: msgData, error: msgInsertError } = await supabase
                .from('sms_messages')
                .insert([{ campaign_id: campaignId, recipient, message: finalMessage, tracking_id: trackingId, original_url: originalUrl }])
                .select().single();
            
            if (msgInsertError) {
                console.error("DB Insert Error:", msgInsertError);
                continue; 
            }

            // ส่ง SMS ผ่าน API
            const apiResult = await callIsmsApi({ recipient, sender_name: senderName, message: finalMessage });

            if (apiResult.status === 'success') {
                successCount++;
                await supabase.from('sms_messages').update({
                    sms_uuid: apiResult.data.uuid,
                    ref_no: apiResult.data.ref_no,
                    status_code: apiResult.data.status,
                    cost: apiResult.data.cost
                }).eq('id', msgData.id);
            } else {
                await supabase.from('sms_messages').update({ status_code: 2 }).eq('id', msgData.id);
            }

            currentId++; // เพิ่มค่า ID สำหรับเบอร์ถัดไป
        }
        // --- สิ้นสุดส่วนที่แก้ไข ---

        return NextResponse.json({ success: true, message: `สร้างแคมเปญสำเร็จ ส่งไป ${successCount} จาก ${recipients.length} เบอร์` });

    } catch (error) {
        console.error("Send Campaign Error:", error);
        return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด: ' + error.message }, { status: 500 });
    }
}