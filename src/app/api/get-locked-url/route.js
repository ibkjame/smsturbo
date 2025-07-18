import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const lockedUrl = process.env.LOCKED_TRACKING_URL;
        if (!lockedUrl) {
            return NextResponse.json({ success: false, message: 'Locked URL not configured.' }, { status: 500 });
        }
        return NextResponse.json({ success: true, lockedUrl });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}