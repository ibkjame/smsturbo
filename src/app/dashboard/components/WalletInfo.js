import React from 'react';

const WalletInfo = ({ profile }) => (
  <div className="bg-gray-800/70 border border-lime-400/30 p-3 rounded-lg flex items-center gap-3">
    {/* WalletIcon */}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
    <div>
      <div className="text-xs text-gray-400">Credit คงเหลือ</div>
      <div className="text-lg font-bold text-white">
        {profile ? profile.credit_balance.toLocaleString() : '...'}
      </div>
    </div>
  </div>
);

export default WalletInfo;
