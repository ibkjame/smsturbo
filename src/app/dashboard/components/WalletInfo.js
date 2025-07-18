import React from 'react';

const themeMap = {
  professional: {
    card: 'bg-white border-blue-100 shadow-lg',
    input: 'bg-blue-50 border-blue-300 text-blue-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
    label: 'text-blue-700',
    btn: 'bg-blue-600 text-white hover:bg-blue-700',
    count: 'text-blue-800',
  },
  // ...existing themes...
};

const WalletInfo = ({ profile, currentTheme }) => {
  const current = themeMap[currentTheme] || themeMap['professional'];

  return (
    <div className={`p-3 rounded-lg flex items-center gap-3 ${current.card}`}>
      {/* WalletIcon */}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
      <div>
        <div className={`text-xs ${current.label}`}>Credit คงเหลือ</div>
        <div className={`text-lg font-bold ${current.count}`}>
          {profile ? profile.credit_balance.toLocaleString() : '...'}
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;