"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// --- ส่วนประกอบ UI ---

const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

const RadialProgressBar = ({ percentage }) => {
  const sqSize = 140;
  const strokeWidth = 14;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * (percentage || 0)) / 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: sqSize, height: sqSize }}>
      <svg width={sqSize} height={sqSize} viewBox={viewBox}>
        <circle className="stroke-current text-gray-700" cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} fill="none" />
        <circle className="stroke-current text-lime-400 transition-all duration-1000 ease-in-out" cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`} fill="none" style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset, strokeLinecap: 'round' }} />
      </svg>
      <div className="absolute text-3xl font-bold text-white">{`${Math.round(percentage || 0)}%`}</div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, colorClass }) => (
  <div className={`p-4 rounded-lg bg-gray-800/70 border ${colorClass}`}>
    <div className="flex items-center">
      <div className={`text-2xl mr-3 ${colorClass.replace('border', 'text')}`}>{icon}</div>
      <div>
        <div className="text-gray-400 text-sm">{title}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
      </div>
    </div>
  </div>
);

const ClickDetailModal = ({ isOpen, onClose, message, translateStatus }) => {
  if (!isOpen || !message) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-lime-400/50 rounded-2xl shadow-lg p-8 m-4 max-w-md w-full sm:max-w-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-lime-400 mb-4">รายละเอียดการส่ง</h2>
        <div className="text-gray-300 space-y-4">
          <div>
            <label className="text-sm text-gray-500">เบอร์ผู้รับ</label>
            <p className="font-mono text-lg">{message.recipient}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">สถานะการส่ง</label>
            <p className="font-bold text-base">{translateStatus(message.status_code)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Ref No</label>
            <p className="font-mono text-base">{message.ref_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Cost</label>
            <p className="font-mono text-base">{message.cost ? `${message.cost} เครดิต` : 'N/A'}</p>
          </div>
          {message.error_message && (
            <div>
              <label className="text-sm text-gray-500">Error Message</label>
              <p className="text-red-400 text-sm bg-black p-2 rounded-md mt-1 break-all">{message.error_message}</p>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-500">เวลาที่คลิก</label>
            <p className="text-lg">{message.clicked_at ? new Date(message.clicked_at).toLocaleString() : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">IP Address</label>
            <p className="font-mono text-lg">{message.click_ip_address || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">User-Agent (อุปกรณ์/เบราว์เซอร์)</label>
            <p className="text-sm bg-black p-3 rounded-md mt-1 break-all">{message.click_user_agent || 'N/A'}</p>
          </div>
        </div>
        <div className="text-right mt-6">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-lime-400 text-black font-bold hover:bg-lime-300 transition">ปิด</button>
        </div>
      </div>
    </div>
  );
};

// --- สิ้นสุดส่วนประกอบ UI ---


export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id;
  const [campaign, setCampaign] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/get-campaign-details?id=${id}`);
      const data = await res.json();
      if (data.success) {
        setCampaign(data.campaign);
        setMessages(data.messages);
      }
    } catch (error) { console.error("Failed to fetch details:", error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDetails(); }, [id]);

  const summaryStats = useMemo(() => {
    if (!messages || messages.length === 0) return { total: 0, success: 0, failed: 0, waiting: 0, percentage: 0, credits: 0, failedBreakdown: {} };
    const total = messages.length;
    const success = messages.filter(m => m.status_code === 0).length;
    const failedCodes = [2, 3, 4, 10, 11];
    const failed = messages.filter(m => failedCodes.includes(m.status_code)).length;
    const waiting = messages.filter(m => [1, 7].includes(m.status_code)).length;
    const percentage = total > 0 ? (success / total) * 100 : 0;
    const credits = messages.reduce((acc, m) => acc + (parseFloat(m.cost) || 0), 0);
    const failedBreakdown = messages.filter(m => failedCodes.includes(m.status_code)).reduce((acc, m) => { acc[m.status_code] = (acc[m.status_code] || 0) + 1; return acc; }, {});
    return { total, success, failed, waiting, percentage, credits, failedBreakdown };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (filterStatus === 'all') return messages;
    if (filterStatus === 'failed') return messages.filter(m => [2, 3, 4, 10, 11].includes(m.status_code));
    if (filterStatus === 'waiting') return messages.filter(m => [1, 7].includes(m.status_code));
    return messages.filter(m => m.status_code === filterStatus);
  }, [messages, filterStatus]);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
        const res = await fetch('/api/update-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId: id }) });
        const data = await res.json();
        if (data.success) setMessages(data.messages);
    } catch (error) { console.error("Failed to update statuses:", error); } 
    finally { setIsUpdating(false); }
  };

  const translateStatus = (code) => {
    const statusMap = { 0: 'สำเร็จ', 1: 'กำลังประมวลผล', 2: 'ไม่สำเร็จ', 3: 'หมดอายุ', 4: 'ถูกบล็อก', 7: 'รอการตอบกลับ', 8: 'ไม่ประมวลผล', 10: 'บัญชีดำ', 11: 'สแปม' };
    return statusMap[code] || 'ไม่ทราบสถานะ';
  };
  
  const getStatusColorClass = (code) => {
    if (code === 0) return 'bg-green-900/50 border-green-700/80';
    if ([1, 7].includes(code)) return 'bg-yellow-900/50 border-yellow-700/80';
    if ([2, 3, 4, 10, 11].includes(code)) return 'bg-red-900/50 border-red-700/80';
    return 'bg-gray-800/50 border-gray-600/80';
  };

  if (isLoading) return <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center text-[var(--color-primary)] font-bold animate-pulse">Loading Campaign Data...</div>;
  if (!campaign) return <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center text-[var(--color-error)] font-bold">ไม่พบข้อมูลแคมเปญ</div>;

  return (
    <>
      <ClickDetailModal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)} message={selectedMessage} translateStatus={translateStatus} />
      <div className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-main)] font-sans">
        <div className="container mx-auto p-4 sm:p-8 lg:p-12">
          <header className="mb-8">
            <Link href="/dashboard" className="text-[var(--color-primary)] hover:underline mb-4 block font-semibold transition-colors">&larr; กลับไปหน้าแคมเปญทั้งหมด</Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary)] drop-shadow mb-2">{campaign.name}</h1>
            <p className="text-[var(--color-text-secondary)] mt-2">ข้อความ: {campaign.message_template}</p>
          </header>

          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">ภาพรวมการส่งข้อความ</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 flex flex-col items-center justify-center gap-6 p-4 bg-[var(--color-bg-card-alt)] rounded-xl border border-[var(--color-border)] shadow-sm">
                <h3 className="font-semibold text-center text-[var(--color-primary)]">เปอร์เซ็นต์สำเร็จ</h3>
                <RadialProgressBar percentage={summaryStats.percentage} />
                <div className="w-full">
                  <h4 className="font-semibold text-center mb-2 text-[var(--color-primary)]">รายละเอียดการส่ง (ไม่สำเร็จ)</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(summaryStats.failedBreakdown).map(([code, count]) => (
                      <div key={code} className="flex justify-between items-center">
                        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-[var(--color-error)] mr-2"></span>{translateStatus(parseInt(code))}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                    {Object.keys(summaryStats.failedBreakdown).length === 0 && <p className="text-center text-[var(--color-text-secondary)]">ไม่มีรายการที่ส่งไม่สำเร็จ</p>}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 p-6 rounded-lg bg-[var(--color-bg-card-alt)] flex flex-col items-center justify-center border border-[var(--color-border)] shadow-sm">
                  <div className="text-[var(--color-text-secondary)]">จำนวนเครดิตที่ใช้ทั้งหมด</div>
                  <div className="text-5xl font-bold text-[var(--color-primary)] my-2">{summaryStats.credits.toFixed(2)}</div>
                </div>
                <SummaryCard title="ผู้รับทั้งหมด" value={summaryStats.total} icon="👥" colorClass="border-[var(--color-primary)]" />
                <SummaryCard title="รอรับ DR ทั้งหมด" value={summaryStats.waiting} icon="⏳" colorClass="border-[var(--color-warning)]" />
                <SummaryCard title="ส่งสำเร็จทั้งหมด" value={summaryStats.success} icon="✅" colorClass="border-[var(--color-success)]" />
                <SummaryCard title="ส่งไม่สำเร็จทั้งหมด" value={summaryStats.failed} icon="❌" colorClass="border-[var(--color-error)]" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-[var(--color-primary)]">สถานะการส่งรายบุคคล</h2>
              <button onClick={handleUpdateStatus} disabled={isUpdating} className="button-main flex items-center gap-2 font-semibold transition disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed">
                <RefreshIcon className={isUpdating ? 'animate-spin' : ''} />{isUpdating ? 'กำลังอัปเดต...' : 'อัปเดตสถานะ'}
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button onClick={() => setFilterStatus('all')} className={`button-secondary text-sm font-semibold rounded-full px-4 py-1.5 transition ${filterStatus === 'all' ? '!bg-[var(--color-primary)] !text-white' : ''}`}>ทั้งหมด ({summaryStats.total})</button>
              <button onClick={() => setFilterStatus(0)} className={`button-secondary text-sm font-semibold rounded-full px-4 py-1.5 transition ${filterStatus === 0 ? '!bg-[var(--color-success)] !text-white' : ''}`}>สำเร็จ ({summaryStats.success})</button>
              <button onClick={() => setFilterStatus('failed')} className={`button-secondary text-sm font-semibold rounded-full px-4 py-1.5 transition ${filterStatus === 'failed' ? '!bg-[var(--color-error)] !text-white' : ''}`}>ไม่สำเร็จ ({summaryStats.failed})</button>
              <button onClick={() => setFilterStatus('waiting')} className={`button-secondary text-sm font-semibold rounded-full px-4 py-1.5 transition ${filterStatus === 'waiting' ? '!bg-[var(--color-warning)] !text-black' : ''}`}>รอการตอบกลับ ({summaryStats.waiting})</button>
            </div>
            <div className="space-y-2">
              {filteredMessages.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-card-alt)] border border-[var(--color-border)] shadow-sm transition-all hover:shadow-lg">
                  <div className={`flex items-center gap-4 p-2 rounded-md border flex-grow ${getStatusColorClass(item.status_code)}`}>
                    <span className="font-bold text-sm min-w-[120px] text-center">{translateStatus(item.status_code)}</span>
                    <span className="border-l-2 border-[var(--color-border)] pl-4 font-mono text-base text-[var(--color-text-main)]">{item.recipient}</span>
                  </div>
                  <div className="flex flex-col items-center w-24 gap-2">
                    <button onClick={() => setSelectedMessage(item)} className="text-[var(--color-primary)] hover:text-white hover:bg-[var(--color-primary)] flex items-center justify-center w-full gap-1 text-xs border border-[var(--color-primary)] rounded px-2 py-1 transition" title="ดูรายละเอียดการส่ง">ดูรายละเอียด</button>
                    {item.link_clicked ? (
                      <button onClick={() => setSelectedMessage(item)} className="text-[var(--color-success)] hover:text-white hover:bg-[var(--color-success)] flex items-center justify-center w-full gap-1 text-xs border border-[var(--color-success)] rounded px-2 py-1 transition" title="ดูรายละเอียดการคลิก">
                        ✔️ <InfoIcon />
                      </button>
                    ) : (
                      <span className="text-gray-400">➖</span>
                    )}
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
