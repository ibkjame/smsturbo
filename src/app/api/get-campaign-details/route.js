import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, message: 'Campaign ID is required' }, { status: 400 });

        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (campaignError) throw campaignError;

        const { data: messages, error: messagesError } = await supabase
            .from('sms_messages')
            .select('*')
            .eq('campaign_id', id)
            .order('id', { ascending: true });

        if (messagesError) throw messagesError;

        return NextResponse.json({ success: true, campaign, messages });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
