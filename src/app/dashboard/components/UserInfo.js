import React from 'react';

const UserInfo = ({ profile }) => (
  <div className="bg-gray-800/70 border border-lime-400/30 p-3 rounded-lg flex items-center gap-3">
    {/* UserIcon */}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    <div>
      <div className="text-xs text-gray-400">ผู้ใช้งาน</div>
      <div className="text-lg font-bold text-white">
        {profile ? `${profile.first_name} ${profile.last_name}` : '...'}
      </div>
    </div>
  </div>
);

export default UserInfo;
