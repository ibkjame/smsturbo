import { NextResponse } from 'next/server';
// import { db } from '../../../../lib/db'; // แก้ไข path ให้ถูกต้อง

export async function GET(request) {
  console.log("Cron job started at:", new Date().toISOString());

  // 1. ตรวจสอบความปลอดภัย
  const authHeader = request.headers.get('authorization');
  console.log("Checking authorization...");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("Authorization failed. Incorrect or missing CRON_SECRET.");
    return new Response('Unauthorized', { status: 401 });
  }
  console.log("Authorization successful.");

  try {
    // 2. ค้นหาแคมเปญที่ยังรอดำเนินการ
    console.log("Searching for a pending campaign in the database...");
    
    // --- ส่วนจำลองฐานข้อมูล (ให้นำ Comment ออกเมื่อใช้งานจริง) ---
    /*
    const campaign = await db.campaign.findFirst({
      where: { status: 'pending' },
    });
    */
    const campaign = null; // สมมติว่ายังหาแคมเปญไม่เจอ
    // --- สิ้นสุดส่วนจำลอง ---

    if (!campaign) {
      console.log("No pending campaigns found. Job finished.");
      return NextResponse.json({ success: true, message: 'No pending campaigns.' });
    }

    console.log(`Found campaign to process: ${campaign.name} (ID: ${campaign.id})`);

    // 3. ดึงรายชื่อผู้รับที่ยังไม่ได้ส่ง
    const remainingRecipients = campaign.recipients.filter(
      r => !campaign.processed_recipients.includes(r)
    );
    console.log(`Remaining recipients to send: ${remainingRecipients.length}`);

    // 4. กำหนดจำนวนที่จะส่ง
    const BATCH_SIZE = 50; 
    const recipientsToSend = remainingRecipients.slice(0, BATCH_SIZE);
    console.log(`Processing a batch of ${recipientsToSend.length} recipients.`);

    if (recipientsToSend.length > 0) {
      // 5. เตรียมส่ง SMS
      console.log("Preparing to send SMS via external API...");
      const apiToken = process.env.SMS_API_TOKEN;
      const payload = {
        sender: campaign.sender_name,
        message: campaign.message_template,
        recipients: recipientsToSend,
      };

      // await fetch('https://portal.isms.asia/sms-api/send', { ... });
      console.log("SMS batch sent (simulated).");

      // 6. อัปเดตฐานข้อมูล
      console.log("Updating database with processed recipients...");
      // await db.campaign.update({ ... });
      console.log("Database updated.");
    }

    // 7. ตรวจสอบว่าส่งครบหรือยัง
    const newTotalProcessed = campaign.processed_recipients.length + recipientsToSend.length;
    if (newTotalProcessed >= campaign.total_recipients) {
      console.log(`Campaign ${campaign.id} is complete. Updating status to 'completed'.`);
      // await db.campaign.update({ data: { status: 'completed' } });
    }

    return NextResponse.json({ success: true, message: `Processed batch for campaign ${campaign.id}.` });

  } catch (error) {
    console.error('Cron Job Execution Error:', error);
    return NextResponse.json({ success: false, message: 'An error occurred during cron job execution.' }, { status: 500 });
  }
}
