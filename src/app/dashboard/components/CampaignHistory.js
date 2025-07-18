import React, { useMemo, useState } from 'react';
import Link from 'next/link';

function groupCampaignsByDate(campaigns) {
  const grouped = {};
  campaigns.forEach(campaign => {
    const date = new Date(campaign.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(campaign);
  });
  return grouped;
}

const CampaignHistory = ({ campaigns, onDelete, onRefresh, theme = 'purple' }) => {
  const groupedCampaigns = useMemo(() => groupCampaignsByDate(campaigns), [campaigns]);

  const themeMap = {
    professional: {
      card: 'bg-white border-blue-100 shadow-lg',
      text: 'text-blue-900',
      btn: 'bg-blue-600 text-white hover:bg-blue-700',
      count: 'text-blue-800',
      label: 'text-blue-700',
    },
    purple: { bg: 'bg-purple-950', card: 'bg-purple-900/90 border-purple-400/40', text: 'text-purple-200', btn: 'bg-purple-400 text-black', count: 'text-purple-100', label: 'text-purple-300' },
    green: { bg: 'bg-green-950', card: 'bg-green-900/90 border-green-400/40', text: 'text-green-200', btn: 'bg-green-400 text-black', count: 'text-green-100', label: 'text-green-300' },
    blue: { bg: 'bg-blue-950', card: 'bg-blue-900/90 border-blue-400/40', text: 'text-blue-200', btn: 'bg-blue-400 text-black', count: 'text-blue-100', label: 'text-blue-300' },
    dark: { bg: 'bg-black', card: 'bg-gray-800/70 border-gray-700', text: 'text-gray-200', btn: 'bg-gray-700 text-white', count: 'text-gray-300', label: 'text-gray-400' },
    orange: { bg: 'bg-orange-950', card: 'bg-orange-900/90 border-orange-400/40', text: 'text-orange-200', btn: 'bg-orange-400 text-black', count: 'text-orange-100', label: 'text-orange-300' },
    pink: { bg: 'bg-pink-950', card: 'bg-pink-900/90 border-pink-400/40', text: 'text-pink-200', btn: 'bg-pink-400 text-black', count: 'text-pink-100', label: 'text-pink-300' },
    yellow: { bg: 'bg-yellow-950', card: 'bg-yellow-900/90 border-yellow-400/40', text: 'text-yellow-200', btn: 'bg-yellow-400 text-black', count: 'text-yellow-100', label: 'text-yellow-300' },
    teal: { bg: 'bg-teal-950', card: 'bg-teal-900/90 border-teal-400/40', text: 'text-teal-200', btn: 'bg-teal-400 text-black', count: 'text-teal-100', label: 'text-teal-300' },
    red: { bg: 'bg-red-950', card: 'bg-red-900/90 border-red-400/40', text: 'text-red-200', btn: 'bg-red-400 text-black', count: 'text-red-100', label: 'text-red-300' },
  };
  const current = themeMap[theme] || themeMap['professional'];

  // สรุปภาพรวมรายวัน
  const dailySummary = useMemo(() => {
    const summary = {};
    campaigns.forEach(campaign => {
      const date = new Date(campaign.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!summary[date]) summary[date] = { sent: 0 };
      summary[date].sent += campaign.total_recipients || 0;
    });
    return summary;
  }, [campaigns]);

  // Tab state for each day's campaigns
  const [activeDay, setActiveDay] = useState(null);

  return (
    <div className={`p-8 rounded-2xl shadow-xl border ${current.card} mb-8`}> 
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${current.count}`}>ประวัติแคมเปญ</h2>
        <button onClick={onRefresh} className={`flex items-center gap-2 ${current.btn} font-semibold px-4 py-2 rounded shadow transition-all`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          รีเฟรช
        </button>
      </div>
      {/* Daily summary section */}
      <div className="mb-6">
        <h3 className={`text-lg font-bold ${current.label} mb-2`}>สรุปภาพรวมรายวัน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(dailySummary).map(([date, sum]) => (
            <button key={date} onClick={() => setActiveDay(date)} className={`border rounded-lg p-4 shadow flex flex-col gap-2 transition-all ${activeDay === date ? `ring-2 ring-blue-400` : `${current.card}`}`}>
              <div className={`font-semibold ${current.count}`}>{date}</div>
              <div className={`text-sm ${current.label}`}>ส่งทั้งหมด: <span className={`font-bold ${current.count}`}>{sum.sent}</span></div>
            </button>
          ))}
        </div>
      </div>
      {/* Campaigns by day as tab detail */}
      {activeDay && groupedCampaigns[activeDay] && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className={`text-lg font-bold ${current.count}`}>{activeDay}</div>
            <button onClick={() => setActiveDay(null)} className={`text-gray-500 hover:${current.label} px-3 py-1 rounded`}>ปิด</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedCampaigns[activeDay].map((campaign) => (
              <div key={campaign.id} className={`p-5 rounded-xl border flex flex-col justify-between shadow ${current.card}`}>
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className={`text-lg font-bold ${current.text} mb-2 break-all`}>{campaign.name}</h3>
                    <button onClick={() => onDelete(campaign.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-500/20 flex-shrink-0" title="ลบแคมเปญ">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                  <p className={`text-xs ${current.label} mb-2`}>สร้างเมื่อ: {new Date(campaign.created_at).toLocaleString()}</p>
                  <div className={`p-3 rounded-md mb-2 bg-gray-50`}>
                    <p className={`text-sm ${current.text} break-words`}><span className="font-semibold">ข้อความ:</span> {campaign.message_template}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Sender: {campaign.sender_name}</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Ref: {campaign.ref_no || '-'}</span>
                  </div>
                </div>
                <div className={`mt-auto pt-4 border-t border-gray-200`}>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className={`text-sm ${current.label}`}>จำนวนผู้รับ</div>
                      <div className={`text-xl font-bold ${current.count}`}>{campaign.total_recipients}</div>
                    </div>
                    <Link href={`/dashboard/campaign/${campaign.id}`} className={`text-blue-500 hover:underline font-semibold`}>ดูรายละเอียด &rarr;</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;