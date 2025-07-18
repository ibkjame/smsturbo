import React, { useState } from 'react';

const CampaignFormLockUrl = ({ senderNames, profile, setAlert, fetchInitialData }) => {
  const [campaignName, setCampaignName] = useState('');
  const [recipientsText, setRecipientsText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedSender, setSelectedSender] = useState(senderNames[0] || '');
  const [lockUrl, setLockUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // เพิ่มตัวเลือก URL ที่ต้องการล้อค
  const lockedUrlOptions = [
    'https://ibk168.net',
    'https://www.ibk168.com',
    'https://idea-bet.live',
    // เพิ่ม URL อื่นๆ ตามต้องการ
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAlert({ message: '', type: '' });
    if (!campaignName || !recipientsText || !messageText || !selectedSender || !lockUrl) {
      setAlert({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', type: 'error' });
      return;
    }
    setIsLoading(true);
    try {
      const recipients = recipientsText.split('\n').map(r => r.trim()).filter(r => r);
      const response = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          recipients,
          messageText,
          senderName: selectedSender,
          lockUrl,
          type: 'lock-url',
        }),
      });
      const result = await response.json();
      if (result.success) {
        setAlert({ message: result.message, type: 'success' });
        setCampaignName('');
        setRecipientsText('');
        setMessageText('');
        setLockUrl('');
        fetchInitialData();
      } else {
        setAlert({ message: result.message, type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6 mb-8">
      <h2 className="text-2xl font-bold header mb-4">สร้างแคมเปญแบบ Lock URL</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="ชื่อแคมเปญ" className="input" required />
          <select value={selectedSender} onChange={e => setSelectedSender(e.target.value)} className="select" required>
            <option value="" disabled>-- เลือกชื่อผู้ส่ง --</option>
            {senderNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <textarea value={recipientsText} onChange={e => setRecipientsText(e.target.value)} placeholder="รายชื่อเบอร์โทร (หนึ่งเบอร์ต่อหนึ่งบรรทัด)" className="textarea" required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="ข้อความ (ไม่ต้องใส่ลิงก์)" className="w-full h-24 p-3 bg-black border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none" required />
          <select value={lockUrl} onChange={e => setLockUrl(e.target.value)} className="w-full h-24 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-400">
            <option value="" disabled>เลือก URL สำหรับติดตาม...</option>
            {lockedUrlOptions.map(url => (
              <option key={url} value={url}>{url}</option>
            ))}
          </select>
        </div>
        <div className="text-right">
          <button type="submit" disabled={isLoading || !campaignName || !recipientsText || !messageText || !selectedSender || !lockUrl} className="button-main px-8 py-3">
            {isLoading ? 'กำลังส่ง...' : 'เริ่มแคมเปญแบบ Lock URL'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignFormLockUrl;
