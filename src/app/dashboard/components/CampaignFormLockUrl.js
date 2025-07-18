import React, { useState } from 'react';

const CampaignFormLockUrl = ({ senderNames, profile, setAlert, fetchInitialData, theme = 'purple' }) => {
  const [campaignName, setCampaignName] = useState('');
  const [recipientsText, setRecipientsText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedSender, setSelectedSender] = useState(senderNames[0] || '');
  const [lockUrl, setLockUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const themeMap = {
    professional: {
      card: 'bg-white border-blue-100 shadow-lg',
      input: 'bg-blue-50 border-blue-300 text-blue-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
      label: 'text-blue-700',
      btn: 'bg-blue-600 text-white hover:bg-blue-700',
      count: 'text-blue-800',
    },
    purple: { bg: 'bg-purple-950', card: 'bg-purple-900/90 border-purple-400/40', text: 'text-purple-200', btn: 'bg-purple-400 text-black', count: 'text-purple-100', label: 'text-purple-300', input: 'bg-purple-950/80 border-purple-400 text-white' },
    green: { bg: 'bg-green-950', card: 'bg-green-900/90 border-green-400/40', text: 'text-green-200', btn: 'bg-green-400 text-black', count: 'text-green-100', label: 'text-green-300', input: 'bg-green-950/80 border-green-400 text-white' },
    blue: { bg: 'bg-blue-950', card: 'bg-blue-900/90 border-blue-400/40', text: 'text-blue-200', btn: 'bg-blue-400 text-black', count: 'text-blue-100', label: 'text-blue-300', input: 'bg-blue-950/80 border-blue-400 text-white' },
    dark: { bg: 'bg-black', card: 'bg-gray-800/70 border-gray-700', text: 'text-gray-200', btn: 'bg-gray-700 text-white', count: 'text-gray-300', label: 'text-gray-400', input: 'bg-black border-gray-700 text-white' },
    orange: { bg: 'bg-orange-950', card: 'bg-orange-900/90 border-orange-400/40', text: 'text-orange-200', btn: 'bg-orange-400 text-black', count: 'text-orange-100', label: 'text-orange-300', input: 'bg-orange-950/80 border-orange-400 text-white' },
    pink: { bg: 'bg-pink-950', card: 'bg-pink-900/90 border-pink-400/40', text: 'text-pink-200', btn: 'bg-pink-400 text-black', count: 'text-pink-100', label: 'text-pink-300', input: 'bg-pink-950/80 border-pink-400 text-white' },
    yellow: { bg: 'bg-yellow-950', card: 'bg-yellow-900/90 border-yellow-400/40', text: 'text-yellow-200', btn: 'bg-yellow-400 text-black', count: 'text-yellow-100', label: 'text-yellow-300', input: 'bg-yellow-950/80 border-yellow-400 text-white' },
    teal: { bg: 'bg-teal-950', card: 'bg-teal-900/90 border-teal-400/40', text: 'text-teal-200', btn: 'bg-teal-400 text-black', count: 'text-teal-100', label: 'text-teal-300', input: 'bg-teal-950/80 border-teal-400 text-white' },
    red: { bg: 'bg-red-950', card: 'bg-red-900/90 border-red-400/40', text: 'text-red-200', btn: 'bg-red-400 text-black', count: 'text-red-100', label: 'text-red-300', input: 'bg-red-950/80 border-red-400 text-white' },
  };
  const current = themeMap[theme] || themeMap['professional'];

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
          url: lockUrl,
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
    <form onSubmit={handleSubmit} className="space-y-8 bg-white/80 p-8 rounded-2xl shadow-xl border border-blue-100">
      <div>
        <label htmlFor="campaignName" className={`block mb-2 font-semibold text-lg ${current.label}`}>ชื่อแคมเปญ</label>
        <input
          id="campaignName"
          className={`w-full p-3 rounded-lg ${current.input}`}
          value={campaignName}
          onChange={e => setCampaignName(e.target.value)}
          placeholder="ชื่อแคมเปญ"
          required
        />
      </div>
      <div>
        <label htmlFor="recipientsText" className={`block mb-2 font-semibold text-lg ${current.label}`}>เบอร์ผู้รับ (1 เบอร์/บรรทัด)</label>
        <textarea
          id="recipientsText"
          className={`w-full p-3 rounded-lg min-h-[100px] ${current.input}`}
          value={recipientsText}
          onChange={e => setRecipientsText(e.target.value)}
          placeholder="รายชื่อเบอร์โทร (หนึ่งเบอร์ต่อหนึ่งบรรทัด)"
          required
        />
      </div>
      <div>
        <label htmlFor="messageText" className={`block mb-2 font-semibold text-lg ${current.label}`}>ข้อความ</label>
        <textarea
          id="messageText"
          className={`w-full p-3 rounded-lg min-h-[80px] ${current.input}`}
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          placeholder="ข้อความ (ไม่ต้องใส่ลิงก์)"
          required
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="selectedSender" className={`block mb-2 font-semibold text-lg ${current.label}`}>Sender</label>
          <select
            id="selectedSender"
            className={`w-full p-3 rounded-lg ${current.input}`}
            value={selectedSender}
            onChange={e => setSelectedSender(e.target.value)}
            required
          >
            <option value="" disabled>-- เลือกชื่อผู้ส่ง --</option>
            {senderNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="customUrl" className={`block mb-2 font-semibold text-lg ${current.label}`}>Custom URL (ถ้ามี)</label>
          <input
            id="customUrl"
            className={`w-full p-3 rounded-lg ${current.input}`}
            value={lockUrl}
            onChange={e => setLockUrl(e.target.value)}
            placeholder="เลือก URL สำหรับติดตาม..."
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6">
        <button type="submit" className={`px-8 py-3 rounded-xl font-bold text-lg shadow transition-all ${current.btn} disabled:bg-gray-400 disabled:cursor-not-allowed`} disabled={isLoading}>
          {isLoading ? 'กำลังส่ง...' : 'ส่งแคมเปญ'}
        </button>
        {error && <span className="text-red-500 font-semibold text-sm mt-2">{error}</span>}
      </div>
    </form>
  );
};

export default CampaignFormLockUrl;