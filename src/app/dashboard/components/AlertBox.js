import React from 'react';

const AlertBox = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`p-4 mb-6 rounded-lg font-semibold border ${type === 'success' ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-red-900/50 text-red-300 border-red-700'}`}>{message}</div>
  );
};

export default AlertBox;
