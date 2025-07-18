import React, { useState } from 'react';
import Swal from 'sweetalert2';

const CampaignForm = ({ senderNames = [], lockedUrl = '', onSubmit, isLoading, theme = 'purple' }) => {
  const [campaignName, setCampaignName] = useState('');
  const [recipientsText, setRecipientsText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedSender, setSelectedSender] = useState(senderNames[0] || '');
  const [customUrl, setCustomUrl] = useState('');
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');

  const themeMap = {
    dark: {
      card: 'bg-black border-gray-700',
      input: 'bg-black border-gray-700 text-white',
      label: 'text-gray-200',
      btn: 'bg-gray-700 text-white',
      count: 'text-gray-300',
    },
    purple: {
      card: 'bg-purple-900/90 border-purple-400/40',
      input: 'bg-purple-950/80 border-purple-400 text-white',
      label: 'text-purple-200',
      btn: 'bg-purple-400 text-black',
      count: 'text-purple-300',
    },
    green: {
      card: 'bg-green-900/90 border-green-400/40',
      input: 'bg-green-950/80 border-green-400 text-white',
      label: 'text-green-200',
      btn: 'bg-green-400 text-black',
      count: 'text-green-300',
    },
    blue: {
      card: 'bg-blue-900/90 border-blue-400/40',
      input: 'bg-blue-950/80 border-blue-400 text-white',
      label: 'text-blue-200',
      btn: 'bg-blue-400 text-black',
      count: 'text-blue-300',
    },
  };
  const current = themeMap[theme] || themeMap['dark'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campaignName || !recipientsText || !messageText || !selectedSender || !pin) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง รวมถึง PIN');
      return;
    }
    setError('');
    try {
      const response = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          recipients: recipientsText.split('\n').map(r => r.trim()).filter(r => r),
          messageText,
          senderName: selectedSender,
          url: customUrl.trim() ? customUrl.trim() : lockedUrl,
          pin: pin.trim()
        })
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire({ icon: 'success', title: 'สำเร็จ', text: result.message });
        setCampaignName('');
        setRecipientsText('');
        setMessageText('');
        setCustomUrl('');
        setPin('');
      } else {
        // ตรวจสอบว่าข้อความ error มีคำต้องห้าม
        let spamWords = [];
        const match = result.message.match(/พบคำต้องห้าม: (.+)/);
        if (match && match[1]) {
          spamWords = match[1].split(',').map(w => w.trim());
        }
        Swal.fire({
          icon: 'error',
          title: 'พบคำต้องห้าม',
          html: spamWords.length > 0
            ? `ไม่สามารถส่งข้อความได้ เนื่องจากพบคำต้องห้าม:<br><b>${spamWords.join(', ')}</b>`
            : result.message
        });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถเชื่อมต่อ API ได้' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`max-w-2xl mx-auto rounded-2xl shadow-2xl p-10 space-y-8 border-4 border-red-900 bg-black/95 transition-all duration-300`}>
      <h2 className={`text-3xl font-bold mb-6 text-center drop-shadow-lg ${current.count}`}>สร้างแคมเปญใหม่</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="ชื่อแคมเปญ" className={`w-full p-4 rounded-xl focus:ring-2 focus:outline-none text-lg ${current.input}`} required />
        <select value={selectedSender} onChange={e => setSelectedSender(e.target.value)} className={`w-full p-4 rounded-xl focus:ring-2 focus:outline-none text-lg ${current.input}`} required>
          <option value="" disabled>-- เลือกชื่อผู้ส่ง --</option>
          {senderNames.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>
      <div>
        <textarea value={recipientsText} onChange={e => setRecipientsText(e.target.value)} placeholder="รายชื่อเบอร์โทร (หนึ่งเบอร์ต่อหนึ่งบรรทัด)" className={`w-full h-40 p-4 rounded-xl focus:ring-2 focus:outline-none text-lg ${current.input}`} required />
        <div className={`text-right text-sm mt-2 ${current.label}`}>จำนวนเบอร์โทร: <span className={`font-bold ${current.count}`}>{recipientsText.split('\n').map(r => r.trim()).filter(r => r).length}</span></div>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="messageText" className={`block font-bold mb-2 ${current.label}`}>ข้อความที่จะส่ง</label>
        <span className="text-xs text-gray-400">({messageText.length} ตัวอักษร)</span>
      </div>
      <textarea
        id="messageText"
        value={messageText}
        onChange={e => setMessageText(e.target.value)}
        placeholder="ข้อความที่จะส่งถึงผู้รับ"
        className={`w-full p-4 rounded-xl focus:ring-2 focus:outline-none text-lg ${current.input}`}
        rows={4}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={`block text-sm font-medium mb-1 ${current.label}`}>ลิ้งค์ที่ต้องการส่ง (ถ้าต้องการกำหนดเอง)</label>
          <input type="text" value={customUrl} onChange={e => setCustomUrl(e.target.value)} placeholder="กรอกลิ้งค์เอง (ถ้าไม่กรอกจะใช้ลิ้งค์ล็อค)" className={`w-full p-4 rounded-xl focus:ring-2 focus:outline-none text-lg ${current.input}`} />
          <span className={`text-xs ${current.count}`}>* ถ้ากรอกลิ้งค์นี้ ระบบจะใช้ลิ้งค์ที่คุณกรอกในการส่ง</span>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${current.label}`}>ลิ้งค์ที่ล็อคไว้โดยระบบ</label>
          <input type="text" value={lockedUrl} readOnly className={`w-full p-4 rounded-xl cursor-not-allowed text-lg ${current.input}`} />
          <span className={`text-xs ${current.count}`}>* ถ้าไม่กรอกลิ้งค์เอง ระบบจะใช้ลิ้งค์นี้ในการส่ง</span>
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1 ${current.label}`}>PIN สำหรับยืนยันการส่ง</label>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="กรอก PIN" className={`w-full p-4 rounded-xl focus:ring-2 focus:outline-none text-lg ${current.input}`} required />
        <span className={`text-xs ${current.count}`}>* ต้องกรอก PIN ที่ถูกต้องเพื่อส่งแคมเปญ</span>
      </div>
      {error && <div className="p-4 bg-red-900/70 text-red-300 rounded-xl font-semibold text-center shadow">{error}</div>}
      <div className="text-center mt-6">
        <button type="submit" disabled={isLoading} className={`inline-flex items-center gap-2 rounded-xl shadow-lg transition-all transform hover:scale-105 text-xl px-10 py-4 font-bold ${current.btn}`}>{isLoading ? 'กำลังส่ง...' : 'เริ่มแคมเปญ'}</button>
      </div>
    </form>
  );
};

export default CampaignForm;
