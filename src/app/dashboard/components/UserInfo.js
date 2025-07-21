import React from 'react';

const themeMap = {
  professional: {
    card: 'bg-white border-blue-100 shadow-lg',
    text: 'text-blue-900',
    label: 'text-blue-700',
    count: 'text-blue-800',
  },
  // ...existing themes...
};

const UserInfo = ({ profile, currentTheme }) => {
  const current = themeMap[currentTheme] || themeMap['professional'];

  return (
    <div className={`p-3 rounded-lg flex items-center gap-3 ${current.card}`}>
      {/* UserIcon */}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      <div>
        <div className={`text-xs ${current.label}`}>ผู้ใช้งาน</div>
        <div className={`text-lg font-bold ${current.count}`}>
          {profile ? `${profile.first_name} ${profile.last_name}` : '...'}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
