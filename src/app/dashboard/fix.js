"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credit, setCredit] = useState(null);

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
        body: JSON.stringify({ name: campaignName, recipients, messageText, senderName: selectedSender, pin: pinInput }),
      });
      const result = await response.json();
      if (result.success) {
        setAlert({ message: result.message, type: 'success' });
        setCampaignName('');
        setRecipientsText('');
        setMessageText('');
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
      <div className="min-h-screen bg-black text-gray-200 font-sans">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-lime-400">Campaign Dashboard</h1>
            <Link href="/dashboard/credit" className="bg-gray-800/70 border border-lime-400/30 p-3 rounded-lg flex items-center gap-3 hover:border-lime-400 transition">
              <WalletIcon />
              <div>
                <div className="text-xs text-gray-400">Credit คงเหลือ</div>
                <div className="text-lg font-bold text-white">{credit !== null ? credit.toLocaleString() : '...'}</div>
              </div>
            </Link>
          </header>

          {alert.message && (<div className={`p-4 mb-6 rounded-lg font-semibold border ${alert.type === 'success' ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-red-900/50 text-red-300 border-red-700'}`}>{alert.message}</div>)}

          <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-lime-400/30 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-lime-400">สร้างแคมเปญใหม่</h2>
            <form onSubmit={handleOpenModal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="ชื่อแคมเปญ" className="w-full p-3 bg-black border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none" required />
                <select value={selectedSender} onChange={(e) => setSelectedSender(e.target.value)} className="w-full p-3 bg-black border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none" required>
                  <option value="" disabled>-- เลือกชื่อผู้ส่ง --</option>
                  {senderNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <textarea value={recipientsText} onChange={(e) => setRecipientsText(e.target.value)} placeholder="รายชื่อเบอร์โทร (หนึ่งเบอร์ต่อหนึ่งบรรทัด)" className="w-full h-40 p-3 bg-black border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none" required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="ข้อความ (ไม่ต้องใส่ลิงก์)" className="w-full h-24 p-3 bg-black border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none" required />
                <input type="text" value={lockedUrl} placeholder="ลิงก์สำหรับติดตาม..." className="w-full h-24 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-400 cursor-not-allowed" readOnly />
              </div>
              <div className="text-right">
                <button type="submit" className="inline-flex items-center gap-2 bg-lime-400 text-black font-bold px-8 py-3 rounded-lg hover:bg-lime-300 transition-all transform hover:scale-105"><SendIcon />เริ่มแคมเปญ</button>
              </div>
            </form>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-lime-400/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lime-400">ประวัติแคมเปญ</h2>
              <button onClick={fetchInitialData} className="flex items-center gap-2 text-lime-400 font-semibold hover:text-lime-300 transition"><RefreshIcon /> รีเฟรช</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-gray-800/70 p-5 rounded-xl border border-gray-700 flex flex-col justify-between">
                  {/* --- ส่วนบนของการ์ด --- */}
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-lg font-bold text-white mb-2 break-all">{campaign.name}</h3>
                      <button onClick={() => handleDelete(campaign.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-500/20 flex-shrink-0" title="ลบแคมเปญ"><TrashIcon /></button>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">สร้างเมื่อ: {new Date(campaign.created_at).toLocaleString()}</p>
                    <div className="bg-black p-3 rounded-md mb-4"><p className="text-sm text-gray-300 break-words">ข้อความ: {campaign.message_template}</p></div>
                  </div>
                  
                  {/* --- ส่วนล่างของการ์ด (จุดที่แก้ไข) --- */}
                  <div className="mt-auto pt-4 border-t border-gray-700/50">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-sm text-gray-400">จำนวนผู้รับ</div>
                        <div className="text-xl font-bold">{campaign.total_recipients}</div>
                      </div>
                      <Link href={`/dashboard/campaign/${campaign.id}`} className="text-blue-400 hover:underline font-semibold">ดูรายละเอียด &rarr;</Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}