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

const CampaignHistory = ({ campaigns, onDelete, onRefresh }) => {
  const groupedCampaigns = useMemo(() => groupCampaignsByDate(campaigns), [campaigns]);

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
    <div className="bg-gradient-to-br from-gray-100 via-lime-50 to-gray-200 p-6 rounded-2xl shadow-lg border border-lime-300/30">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-lime-600">ประวัติแคมเปญ</h2>
        <button onClick={onRefresh} className="flex items-center gap-2 text-lime-600 font-semibold hover:text-lime-700 transition bg-lime-100 px-3 py-1 rounded shadow">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          รีเฟรช
        </button>
      </div>
      {/* Daily summary section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-2">สรุปภาพรวมรายวัน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(dailySummary).map(([date, sum]) => (
            <button key={date} onClick={() => setActiveDay(date)} className={`bg-white/80 border border-lime-200 rounded-lg p-4 shadow flex flex-col gap-2 transition-all ${activeDay === date ? 'ring-2 ring-lime-400' : ''}`}>
              <div className="font-semibold text-lime-700">{date}</div>
              <div className="text-sm text-gray-700">ส่งทั้งหมด: <span className="font-bold text-lime-700">{sum.sent}</span></div>
            </button>
          ))}
        </div>
      </div>
      {/* Campaigns by day as tab detail */}
      {activeDay && groupedCampaigns[activeDay] && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="text-lg font-bold text-lime-600">{activeDay}</div>
            <button onClick={() => setActiveDay(null)} className="text-gray-500 hover:text-lime-600 px-3 py-1 rounded">ปิด</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedCampaigns[activeDay].map((campaign) => (
              <div key={campaign.id} className="bg-white/70 p-5 rounded-xl border border-gray-300 flex flex-col justify-between shadow">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 break-all">{campaign.name}</h3>
                    <button onClick={() => onDelete(campaign.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-500/20 flex-shrink-0" title="ลบแคมเปญ">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">สร้างเมื่อ: {new Date(campaign.created_at).toLocaleString()}</p>
                  <div className="bg-lime-50 p-3 rounded-md mb-4"><p className="text-sm text-gray-700 break-words">ข้อความ: {campaign.message_template}</p></div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-300/50">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-sm text-gray-500">จำนวนผู้รับ</div>
                      <div className="text-xl font-bold text-lime-700">{campaign.total_recipients}</div>
                    </div>
                    <Link href={`/dashboard/campaign/${campaign.id}`} className="text-blue-500 hover:underline font-semibold">ดูรายละเอียด &rarr;</Link>
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
