import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { spamWords } from '@/lib/spam-words';

// เพิ่มตัวแปรสำหรับโหมดทดลอง
const TRIAL_MODE = process.env.TRIAL_MODE === 'true';

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

    // --- ส่วนที่เพิ่มเข้ามาสำหรับโหมดทดลอง ---
    if (TRIAL_MODE) {
      // ในโหมดทดลอง ให้จำลองว่าส่งสำเร็จและตอบกลับทันที
      return NextResponse.json({ 
        success: true, 
        message: `(โหมดทดลอง) แคมเปญ "${name}" ถูกสร้างเรียบร้อยแล้ว` 
      });
    }

    // --- โค้ดเดิมสำหรับการส่งจริง (จะทำงานเมื่อ TRIAL_MODE เป็น false) ---
    // 1. สร้างแคมเปญหลักในตาราง 'campaigns'
    console.log(`Creating campaign: ${name}`);
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .insert([{ 
        name, 
        message_template: messageText, 
        total_recipients: recipients.length,
        status: 'pending'
      }])
      .select()
      .single();

    if (campaignError) throw campaignError;
    const campaignId = campaignData.id;

    // 2. เตรียมข้อมูลข้อความทั้งหมด
    console.log(`Preparing ${recipients.length} messages for campaign ID: ${campaignId}`);
    const messagesToInsert = recipients.map(recipient => ({
      campaign_id: campaignId,
      recipient,
      message: messageText,
      sender_name: senderName,
      status: 'pending'
    }));

    // 3. บันทึกข้อความทั้งหมดลงฐานข้อมูล
    const { error: messagesError } = await supabase
      .from('sms_messages')
      .insert(messagesToInsert);

    if (messagesError) throw messagesError;

    // 4. ตอบกลับ
    return NextResponse.json({ 
      success: true, 
      message: `แคมเปญ "${name}" ถูกเพิ่มเข้าระบบแล้ว และจะเริ่มทยอยส่งในเบื้องหลัง` 
    });

  } catch (error) {
    console.error("Error creating campaign job:", error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด: ' + error.message }, { status: 500 });
  }
}
