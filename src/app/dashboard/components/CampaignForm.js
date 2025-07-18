import React from 'react';

const CampaignForm = ({
  campaignName,
  recipientsText,
  messageText,
  selectedSender,
  senderNames = [],
  onChange,
  onSubmit,
  isLoading,
  theme = 'purple',
  error
}) => {
  const themeMap = {
    professional: {
      card: 'bg-white border-blue-100 shadow-lg',
      input: 'bg-blue-50 border-blue-300 text-blue-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
      label: 'text-blue-700',
      btn: 'bg-blue-600 text-white hover:bg-blue-700',
      count: 'text-blue-800',
    },
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
  const current = themeMap[theme] || themeMap['professional'];

  return (
    <form onSubmit={onSubmit} className="space-y-8 bg-white/80 p-8 rounded-2xl shadow-xl border border-blue-100">
      <div>
        <label htmlFor="campaignName" className={`block mb-2 font-semibold text-lg ${current.label}`}>ชื่อแคมเปญ</label>
        <input
          id="campaignName"
          className={`w-full p-3 rounded-lg ${current.input}`}
          value={campaignName}
          onChange={e => onChange('campaignName', e.target.value)}
          placeholder="กรอกชื่อแคมเปญ"
          required
        />
      </div>
      <div>
        <label htmlFor="recipientsText" className={`block mb-2 font-semibold text-lg ${current.label}`}>เบอร์ผู้รับ (1 เบอร์/บรรทัด)</label>
        <textarea
          id="recipientsText"
          className={`w-full p-3 rounded-lg min-h-[100px] ${current.input}`}
          value={recipientsText}
          onChange={e => onChange('recipientsText', e.target.value)}
          placeholder="กรอกเบอร์โทรผู้รับ"
          required
        />
      </div>
      <div>
        <label htmlFor="messageText" className={`block mb-2 font-semibold text-lg ${current.label}`}>ข้อความ (สามารถใส่ลิงก์ได้เลย)</label>
        <textarea
          id="messageText"
          className={`w-full p-3 rounded-lg min-h-[80px] ${current.input}`}
          value={messageText}
          onChange={e => onChange('messageText', e.target.value)}
          placeholder="กรอกข้อความที่จะส่ง (ใส่ลิงก์ได้เลย)"
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
            onChange={e => onChange('selectedSender', e.target.value)}
            required
          >
            <option value="" disabled>-- เลือกชื่อผู้ส่ง --</option>
            {senderNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
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

export default CampaignForm;
