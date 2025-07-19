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
        const { name, recipients, messageText, senderName, pin } = await req.json();

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

        // 2. สร้างแคมเปญในฐานข้อมูล (ใช้ messageText ตรง ๆ)
        const { data: campaignData, error: campaignError } = await supabase
            .from('campaigns')
            .insert([{ name, message_template: messageText, original_url: null, total_recipients: recipients.length }])
            .select()
            .single();
        if (campaignError) throw campaignError;
        const campaignId = campaignData.id;

        let successCount = 0;
        // 3. วนลูปเพื่อสร้างข้อความและส่ง SMS
        for (const recipient of recipients) {
            // บันทึกข้อความลงฐานข้อมูล (ไม่มี trackingId/URL)
            const { data: msgData, error: msgInsertError } = await supabase
                .from('sms_messages')
                .insert([{ campaign_id: campaignId, recipient, message: messageText, tracking_id: null, original_url: null }])
                .select().single();
            if (msgInsertError) {
                console.error("DB Insert Error:", msgInsertError);
                continue;
            }
            // ส่ง SMS ผ่าน API
            const apiResult = await callIsmsApi({ recipient, sender_name: senderName, message: messageText });
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
        }
        return NextResponse.json({ success: true, message: `สร้างแคมเปญสำเร็จ ส่งไป ${successCount} จาก ${recipients.length} เบอร์` });
    } catch (error) {
        console.error("Send Campaign Error:", error);
        return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด: ' + error.message }, { status: 500 });
    }
}
