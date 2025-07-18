
export async function POST(request) {
  const TELEGRAM_BOT_TOKEN = "7715688744:AAETqNqDiC3lOokYyIe--RKuYqZbOxFppXY";
  const TELEGRAM_CHAT_ID = "-1002858418286";
  const { event, timestamp } = await request.json();
  const message = `มีผู้ใช้กดลิงก์แอด LINE\nเวลา: ${new Date(timestamp).toLocaleString()}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }),
    });
    return Response.json({ status: "ok" });
  } catch (err) {
    return Response.json({ status: "error", error: err.message }, { status: 500 });
  }
}
