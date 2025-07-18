import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// --- ฟังก์ชันใหม่สำหรับกรองบอท ---

// รายชื่อคำที่มักจะพบใน User-Agent ของบอท
const BOT_IDENTIFIERS = [
  'bot',
  'spider',
  'crawler',
  'Google-PageRenderer', // ตัวที่เจาะจงจากปัญหาของคุณ
  'Googlebot',
  'Bingbot',
  'Slurp',
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'Sogou',
  'Exabot',
  'facebot',
  'ia_archiver',
  'TelegramBot',
  'WhatsApp'
];

// ฟังก์ชันสำหรับตรวจสอบ User-Agent
function isBot(userAgent) {
  if (!userAgent) {
    return false; // ถ้าไม่มี User-Agent ให้ถือว่าไม่ใช่บอท
  }
  const lowercasedUserAgent = userAgent.toLowerCase();
  // ตรวจสอบว่ามีคำใน list ของเราอยู่ใน User-Agent หรือไม่
  return BOT_IDENTIFIERS.some(identifier => lowercasedUserAgent.includes(identifier.toLowerCase()));
}


// --- ฟังก์ชันส่งแจ้งเตือน (ไม่มีการเปลี่ยนแปลง) ---
async function sendTelegramNotification({ campaignName, recipient, originalUrl, ipAddress, userAgent }) {
    const proxyUrl = process.env.TELEGRAM_PROXY_URL;
    if (!proxyUrl) {
        console.error("TELEGRAM_PROXY_URL is not set.");
        return;
    }
    const shortUserAgent = userAgent ? userAgent.substring(0, 70) + '...' : 'N/A';
    const message = `
🔔 **มีการคลิกลิงก์!** 🔔

**แคมเปญ:** \`${campaignName}\`
**เบอร์ผู้รับ:** \`${recipient}\`
**IP:** \`${ipAddress || 'N/A'}\`
**Device/Browser:** \`${shortUserAgent}\`
**ลิงก์ปลายทาง:** ${originalUrl}
    `;
    try {
        await fetch(`${proxyUrl}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignName, recipient, originalUrl, ipAddress, userAgent: shortUserAgent }),
        });
    } catch (error) {
        console.error("Failed to send request to proxy server:", error);
    }
}


export async function GET(req, { params }) {
    const { id: trackingId } = params;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '/';

    const ip = req.headers.get('x-forwarded-for') || req.ip || 'Unknown';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    if (!trackingId) return NextResponse.redirect(baseUrl);

    try {
        const { data: message, error: messageError } = await supabase
            .from('sms_messages')
            .select('id, campaign_id, recipient, link_clicked')
            .eq('tracking_id', trackingId)
            .single();

        if (messageError || !message) {
            return NextResponse.redirect(baseUrl);
        }

        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('name, original_url')
            .eq('id', message.campaign_id)
            .single();

        if (campaignError || !campaign) {
            return NextResponse.redirect(baseUrl);
        }
        
        let destinationUrl = campaign.original_url;
        if (destinationUrl && !destinationUrl.startsWith('http')) {
            destinationUrl = `https://${destinationUrl}`;
        }

        // --- ส่วนที่เพิ่มเข้ามา: ตรรกะการกรองบอท ---
        if (isBot(userAgent)) {
            console.log(`Bot detected, redirecting without tracking. UA: ${userAgent}`);
            // ส่งบอทไปยังปลายทาง แต่ไม่ทำอะไรต่อ
            return NextResponse.redirect(destinationUrl || baseUrl);
        }
        // --- สิ้นสุดส่วนการกรองบอท ---


        // ถ้าไม่ใช่บอท ให้ทำงานตามปกติ
        if (!message.link_clicked) {
            // อัปเดตฐานข้อมูล
            supabase
                .from('sms_messages')
                .update({ 
                    link_clicked: true, 
                    clicked_at: new Date().toISOString(),
                    click_ip_address: ip,
                    click_user_agent: userAgent
                })
                .eq('id', message.id)
                .then(({ error: updateError }) => {
                    if (updateError) console.error("Failed to update click status:", updateError.message);
                });

            // ส่งการแจ้งเตือน
            sendTelegramNotification({
                campaignName: campaign.name,
                recipient: message.recipient,
                originalUrl: campaign.original_url,
                ipAddress: ip,
                userAgent: userAgent
            });
        }

        return NextResponse.redirect(destinationUrl || baseUrl);

    } catch (error) {
        console.error("Tracker Error:", error.message);
        return NextResponse.redirect(baseUrl);
    }
}
