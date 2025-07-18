import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

async function getSmsStatus(uuid) {
    const url = `https://portal.isms.asia/sms-api/message-sms/get/${uuid}`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${process.env.ISMS_API_KEY}` }
        });
        if (!response.ok) return null;
        const result = await response.json();
        return result.status === 'success' ? result.data : null;
    } catch {
        return null;
    }
}

export async function POST(req) {
    try {
        const { campaignId } = await req.json();

        const { data: pendingMessages, error: fetchError } = await supabase
            .from('sms_messages')
            .select('id, sms_uuid, status_code')
            .eq('campaign_id', campaignId)
            .in('status_code', [1, 7]); // 1=Processing, 7=Waiting DR

        if (fetchError) throw fetchError;

        for (const msg of pendingMessages) {
            if (!msg.sms_uuid) continue;
            const latestStatus = await getSmsStatus(msg.sms_uuid);
            if (latestStatus && latestStatus.status !== msg.status_code) {
                await supabase
                    .from('sms_messages')
                    .update({ status_code: latestStatus.status })
                    .eq('id', msg.id);
            }
        }

        // Fetch the updated list of messages for the campaign
        const { data: updatedMessages, error: updatedFetchError } = await supabase
            .from('sms_messages')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('id', { ascending: true });
        
        if(updatedFetchError) throw updatedFetchError;

        return NextResponse.json({ success: true, messages: updatedMessages });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
