import React from 'react';

const AlertBox = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`p-4 mb-6 rounded-lg font-semibold border shadow-lg ${type === 'success' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{message}</div>
  );
};

export default AlertBox;
