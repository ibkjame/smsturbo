import React from 'react';

const StatsBar = ({ recipientsText, messageText }) => {
  // Count unique, non-empty phone numbers
  const recipientCount = recipientsText
    ? recipientsText.split('\n').map(r => r.trim()).filter(r => r).length
    : 0;
  // Count total messages (lines in messageText, or just 1 if not multiline)
  const messageCount = messageText
    ? messageText.split('\n').filter(line => line.trim()).length
    : 0;

  return (
    <div className="flex gap-6 items-center mb-4">
      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-orange-700 font-semibold shadow-sm">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 3.13a4 4 0 0 1 0 7.75M12 21v-2m0-4v-2m0-4V7m0-4V3m0 0a9 9 0 1 1-8.94 8.06"/></svg>
        <span>จำนวนเบอร์: {recipientCount}</span>
      </div>
      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-orange-700 font-semibold shadow-sm">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-1a2 2 0 0 0-2 2v2"/></svg>
        <span>จำนวนข้อความ: {messageCount}</span>
      </div>
    </div>
  );
};

export default StatsBar;
