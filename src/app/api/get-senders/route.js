import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const senderNamesEnv = process.env.ISMS_SENDER_NAMES;
        if (!senderNamesEnv) {
            return NextResponse.json({ success: false, message: 'Sender names not configured.' }, { status: 500 });
        }

        const senders = senderNamesEnv.split(',').map(name => name.trim());

        return NextResponse.json({ success: true, senders });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
