import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

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

export async function GET() {
    // 1. หาแคมเปญ pending
    const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

    if (!campaign) return NextResponse.json({ done: true });

    // 2. ดึง recipients ที่ยังไม่ส่ง (status_code: 'pending')
    const { data: messages, error: msgError } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('status_code', 'pending')
        .limit(50);

    if (!messages || messages.length === 0) {
        // ถ้าส่งครบแล้ว อัปเดต status แคมเปญ
        await supabase.from('campaigns').update({ status: 'done' }).eq('id', campaign.id);
        return NextResponse.json({ done: true });
    }

    // 3. ส่ง SMS ทีละเบอร์
    for (const msg of messages) {
        const apiResult = await callIsmsApi({
            recipient: msg.recipient,
            sender_name: campaign.sender_name,
            message: campaign.message_template
        });
        if (apiResult.status === 'success') {
            await supabase.from('sms_messages').update({
                sms_uuid: apiResult.data.uuid,
                ref_no: apiResult.data.ref_no,
                status_code: apiResult.data.status,
                cost: apiResult.data.cost
            }).eq('id', msg.id);
        } else {
            await supabase.from('sms_messages').update({ status_code: 2 }).eq('id', msg.id);
        }
    }

    return NextResponse.json({ processed: messages.length });
}
