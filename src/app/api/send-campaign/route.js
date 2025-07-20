import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { spamWords } from '@/lib/spam-words';

export async function POST(req) {
  try {
    const { name, recipients, messageText, senderName, pin } = await req.json();

    // --- การตรวจสอบข้อมูลเบื้องต้น ---
    const foundSpam = spamWords.filter(word => messageText.includes(word));
    if (foundSpam.length > 0) {
      return NextResponse.json({ success: false, message: `ตรวจพบคำต้องห้าม: ${foundSpam.join(', ')}` }, { status: 400 });
    }

    const correctPin = process.env.CAMPAIGN_SEND_PIN;
    if (!correctPin || pin !== correctPin) {
      return NextResponse.json({ success: false, message: 'PIN ไม่ถูกต้อง' }, { status: 403 });
    }

    // 1. สร้างแคมเปญหลักในตาราง 'campaigns' โดยตั้งสถานะเป็น 'pending'
    console.log(`Creating campaign: ${name}`);
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .insert([{ 
        name, 
        message_template: messageText, 
        total_recipients: recipients.length,
        status: 'pending' // <-- สถานะเริ่มต้น
      }])
      .select()
      .single();

    if (campaignError) throw campaignError;
    const campaignId = campaignData.id;

    // 2. เตรียมข้อมูลข้อความทั้งหมดสำหรับตาราง 'sms_messages'
    console.log(`Preparing ${recipients.length} messages for campaign ID: ${campaignId}`);
    const messagesToInsert = recipients.map(recipient => ({
      campaign_id: campaignId,
      recipient,
      message: messageText,
      sender_name: senderName, // <-- บันทึก sender_name ไปด้วยเพื่อง่ายต่อการดึงใช้
      status: 'pending' // <-- สถานะของแต่ละข้อความ
    }));

    // 3. บันทึกข้อความทั้งหมดลงฐานข้อมูลในครั้งเดียว
    const { error: messagesError } = await supabase
      .from('sms_messages')
      .insert(messagesToInsert);

    if (messagesError) throw messagesError;

    // 4. ตอบกลับทันทีว่ารับงานแล้ว (API ทำงานเสร็จสิ้นตรงนี้)
    console.log(`Campaign ${name} successfully queued.`);
    return NextResponse.json({ 
      success: true, 
      message: `แคมเปญ "${name}" ถูกเพิ่มเข้าระบบแล้ว และจะเริ่มทยอยส่งในเบื้องหลัง` 
    });

  } catch (error) {
    console.error("Error creating campaign job:", error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด: ' + error.message }, { status: 500 });
  }
}
