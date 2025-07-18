"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CampaignHistory from './components/CampaignHistory';
import CampaignForm from './components/CampaignForm';

// Icons
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>;


export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [recipientsText, setRecipientsText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [senderNames, setSenderNames] = useState([]);
  const [selectedSender, setSelectedSender] = useState('');
  const [lockedUrl, setLockedUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credit, setCredit] = useState(null);
  const [activeTab, setActiveTab] = useState('create'); // 'create' หรือ 'history'
  const [theme, setTheme] = useState('purple');
  const [showThemePicker, setShowThemePicker] = useState(false);
  // เพิ่มธีมใหม่และสุ่มสี
  const themeMap = {
    purple: { bg: 'bg-purple-950', card: 'bg-green-900/90 border-green-400/40', text: 'text-purple-200', btn: 'bg-purple-400 text-black', count: 'text-purple-100', label: 'text-purple-300' },
    green: { bg: 'bg-green-950', card: 'bg-purple-900/90 border-purple-400/40', text: 'text-green-200', btn: 'bg-green-400 text-black', count: 'text-green-100', label: 'text-green-300' },
    blue: { bg: 'bg-blue-950', card: 'bg-orange-900/90 border-orange-400/40', text: 'text-blue-200', btn: 'bg-blue-400 text-black', count: 'text-blue-100', label: 'text-blue-300' },
    dark: { bg: 'bg-black', card: 'bg-lime-900/90 border-lime-400/40', text: 'text-gray-200', btn: 'bg-gray-700 text-white', count: 'text-gray-300', label: 'text-gray-400' },
    orange: { bg: 'bg-orange-950', card: 'bg-blue-900/90 border-blue-400/40', text: 'text-orange-200', btn: 'bg-orange-400 text-black', count: 'text-orange-100', label: 'text-orange-300' },
    pink: { bg: 'bg-pink-950', card: 'bg-yellow-900/90 border-yellow-400/40', text: 'text-pink-200', btn: 'bg-pink-400 text-black', count: 'text-pink-100', label: 'text-pink-300' },
    yellow: { bg: 'bg-yellow-950', card: 'bg-pink-900/90 border-pink-400/40', text: 'text-yellow-200', btn: 'bg-yellow-400 text-black', count: 'text-yellow-100', label: 'text-yellow-300' },
    teal: { bg: 'bg-teal-950', card: 'bg-red-900/90 border-red-400/40', text: 'text-teal-200', btn: 'bg-teal-400 text-black', count: 'text-teal-100', label: 'text-teal-300' },
    red: { bg: 'bg-red-950', card: 'bg-teal-900/90 border-teal-400/40', text: 'text-red-200', btn: 'bg-red-400 text-black', count: 'text-red-100', label: 'text-red-300' },
  };
  const themeKeys = Object.keys(themeMap);
  const randomTheme = () => {
    const idx = Math.floor(Math.random() * themeKeys.length);
    setTheme(themeKeys[idx]);
    setShowThemePicker(false);
  };
  const current = themeMap[theme];

  const fetchInitialData = async () => {
    try {
      const [campaignsRes, sendersRes, urlRes, creditRes] = await Promise.all([
        fetch('/api/get-campaigns'),
        fetch('/api/get-senders'),
        fetch('/api/get-locked-url'),
        fetch('/api/get-credit')
      ]);
      
      const campaignsData = await campaignsRes.json();
      if (campaignsData.success) setCampaigns(campaignsData.campaigns);

      const sendersData = await sendersRes.json();
      if (sendersData.success && sendersData.senders.length > 0) {
        setSenderNames(sendersData.senders);
        setSelectedSender(sendersData.senders[0]);
      }

      const urlData = await urlRes.json();
      if (urlData.success) setLockedUrl(urlData.lockedUrl);

      const creditData = await creditRes.json();
      if (creditData.success) setCredit(creditData.credit);

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  const handleOpenModal = (event) => {
    event.preventDefault();
    if (!campaignName || !recipientsText || !messageText || !selectedSender) {
      setAlert({ message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง', type: 'error' });
      return;
    }
    setPinInput('');
    setIsModalOpen(true);
  };

  const handleConfirmSend = async () => {
    const recipients = recipientsText.split('\n').map(r => r.trim()).filter(r => r);
    setIsLoading(true);
    setAlert({ message: '', type: '' });
    try {
      const response = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: campaignName, recipients, messageText, senderName: selectedSender, pin: pinInput, customUrl }),
      });
      const result = await response.json();
      if (result.success) {
        setAlert({ message: result.message, type: 'success' });
        setCampaignName('');
        setRecipientsText('');
        setMessageText('');
        setCustomUrl('');
        fetchInitialData();
      } else {
        setAlert({ message: result.message, type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', type: 'error' });
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (campaignId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแคมเปญนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
        return;
    }
    setIsLoading(true);
    setAlert({ message: '', type: '' });
    try {
      const response = await fetch('/api/delete-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      const result = await response.json();
      if (result.success) {
        setAlert({ message: result.message, type: 'success' });
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

  const handleSubmitCampaign = async (formData) => {
    setIsLoading(true);
    setAlert({ message: '', type: '' });
    try {
      const recipients = formData.recipientsText.split('\n').map(r => r.trim()).filter(r => r);
      const response = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.campaignName,
          recipients,
          messageText: formData.messageText,
          senderName: formData.selectedSender,
          url: formData.url,
          pin: formData.pin,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setAlert({ message: result.message, type: 'success' });
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

  const ConfirmationModal = ({ isOpen, onClose, onConfirm, campaignName, recipientCount, pin, setPin, isLoading }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-gray-900 border border-lime-400/50 rounded-2xl shadow-lg p-8 m-4 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">ยืนยันการส่งแคมเปญ</h2>
          <div className="text-gray-300 space-y-4 mb-6">
            <p><strong>ชื่อแคมเปญ:</strong> {campaignName}</p>
            <p><strong>จำนวนผู้รับ:</strong> {recipientCount} คน</p>
          </div>
          <div className="mb-6">
            <label htmlFor="pin" className="block text-sm font-medium text-gray-400 mb-2">กรุณากรอก PIN เพื่อยืนยัน</label>
            <input type="password" id="pin" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-3 bg-black border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none" autoComplete="off" required />
          </div>
          <div className="flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition">ยกเลิก</button>
            <button onClick={onConfirm} disabled={isLoading || !pin} className="px-6 py-2 rounded-lg bg-lime-400 text-black font-bold hover:bg-lime-300 disabled:bg-gray-600 transition">{isLoading ? 'กำลังส่ง...' : 'ยืนยันและส่ง'}</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmSend} campaignName={campaignName} recipientCount={recipientsText.split('\n').map(r => r.trim()).filter(r => r).length} pin={pinInput} setPin={setPinInput} isLoading={isLoading} />
      <div className={`min-h-screen ${current.bg} ${current.text} font-sans transition-all duration-300`}>
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-5xl font-extrabold tracking-wide animate-pulse mb-2" style={{letterSpacing: '0.15em', color: '#F07300'}}>AUTOSMSAPI</h1>
            {/* ระบบเลือกสีธีม */}
            <div className="flex items-center gap-3 mb-8 justify-center">
              <span className="font-bold text-lg text-white">เลือกธีมสี:</span>
              <button
                className="rounded-full w-10 h-10 flex items-center justify-center border-2 border-white bg-gradient-to-br from-gray-900 via-gray-700 to-gray-400 shadow-lg hover:scale-110 transition"
                onClick={() => setShowThemePicker(true)}
                aria-label="เลือกธีมสี"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
              </button>
              {showThemePicker && (
                <div className="absolute z-50 mt-12 p-6 bg-black/95 rounded-2xl shadow-2xl border-4 border-white flex flex-col gap-4 min-w-[220px]">
                  <span className="font-bold text-white mb-2">เลือกธีมสี</span>
                  {Object.keys(themeMap).map(key => (
                    <button key={key} onClick={() => { setTheme(key); setShowThemePicker(false); }} className={`w-full py-2 rounded-xl font-bold mb-1 ${themeMap[key].btn} border-2 border-white shadow hover:scale-105 transition`}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                  <button onClick={() => { const keys = Object.keys(themeMap); setTheme(keys[Math.floor(Math.random()*keys.length)]); setShowThemePicker(false); }} className="w-full py-2 rounded-xl font-bold bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 text-black border-2 border-white shadow hover:scale-105 transition">สุ่มสี</button>
                  <button onClick={() => setShowThemePicker(false)} className="w-full py-2 rounded-xl font-bold bg-gray-700 text-white border-2 border-white shadow hover:scale-105 transition">ปิด</button>
                </div>
              )}
            </div>
          </div>
          {/* ส่วนแสดงเครดิตตรงกลางก่อน card ฟอร์ม */}
          <div className="flex justify-center mb-8">
            <Link href="/dashboard/credit" className={`p-4 rounded-xl flex items-center gap-3 border-2 shadow-lg transition-all font-bold ${current.card} hover:border-lime-400`} style={{minWidth: 320, justifyContent: 'center'}}>
              <WalletIcon />
              <div>
                <div className={`text-xs ${current.label}`}>Credit คงเหลือ</div>
                <div className={`text-lg font-bold ${current.count}`}>{credit !== null ? credit.toLocaleString() : '...'}</div>
              </div>
            </Link>
          </div>
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 justify-center">
            <button onClick={() => setActiveTab('create')} className={`px-6 py-2 rounded-xl font-bold border-2 shadow transition-all text-lg ${activeTab === 'create' ? `${current.btn} border-lime-400` : `${current.card} ${current.text} border-transparent hover:border-lime-400 hover:bg-opacity-80`}`}>สร้างแคมเปญใหม่</button>
            <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-xl font-bold border-2 shadow transition-all text-lg ${activeTab === 'history' ? `${current.btn} border-lime-400` : `${current.card} ${current.text} border-transparent hover:border-lime-400 hover:bg-opacity-80`}`}>ประวัติแคมเปญ</button>
            <button onClick={() => setActiveTab('contact')} className={`px-6 py-2 rounded-xl font-bold border-2 shadow transition-all text-lg ${activeTab === 'contact' ? `${current.btn} border-orange-400` : `${current.card} ${current.text} border-transparent hover:border-orange-400 hover:bg-opacity-80`}`}>ติดต่อเรา</button>
          </div>

          {alert.message && (<div className={`p-4 mb-6 rounded-xl font-semibold border-2 shadow ${alert.type === 'success' ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-red-900/50 text-red-300 border-red-700'}`}>{alert.message}</div>)}

          {/* Tab Content */}
          {activeTab === 'create' && (
            <CampaignForm
              senderNames={senderNames}
              lockedUrl={lockedUrl}
              onSubmit={handleSubmitCampaign}
              isLoading={isLoading}
              theme={theme}
            />
          )}

          {activeTab === 'history' && (
            <CampaignHistory campaigns={campaigns} onDelete={handleDelete} onRefresh={fetchInitialData} />
          )}
          {/* ส่วนติดต่อเรา */}
          {activeTab === 'contact' && (
            <div className={`max-w-xl mx-auto rounded-2xl shadow-2xl p-10 border-4 border-blue-900 bg-black/95 text-center mt-8`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-300">ติดต่อเรา</h2>
              <p className="mb-6 text-gray-200">สอบถาม/แจ้งปัญหา ติดต่อผ่าน Telegram</p>
              <a href="https://t.me/jxzem1223" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 rounded-xl bg-blue-500 text-white font-bold text-lg shadow hover:bg-blue-600 transition">ติดต่อผ่าน Telegram</a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}