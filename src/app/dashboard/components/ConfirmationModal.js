import React from 'react';
import NumericKeypad from './NumericKeypad';

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

const ConfirmationModal = ({ isOpen, onClose, onConfirm, campaignName, recipientCount, pin, setPin, isLoading, theme }) => {
  const current = themeMap[theme] || themeMap['professional'];
  const maxLength = 6;

  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm`}>
      <div className={`p-8 m-4 max-w-lg w-full rounded-2xl shadow-lg border ${current.card}`}>
        <h2 className={`text-2xl font-bold mb-4 ${current.count}`}>ยืนยันการส่งแคมเปญ</h2>
        <div className={`space-y-4 mb-6 ${current.text}`}>
          <p><strong>ชื่อแคมเปญ:</strong> {campaignName}</p>
          <p><strong>จำนวนผู้รับ:</strong> {recipientCount} คน</p>
        </div>
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${current.label}`}>กรุณากรอก PIN เพื่อยืนยัน</label>
          <NumericKeypad value={pin} onChange={setPin} maxLength={maxLength} />
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className={`px-6 py-2 rounded-lg transition ${current.card} ${current.text} hover:bg-gray-100`}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={isLoading || pin.length !== maxLength} className={`px-6 py-2 rounded-lg font-bold transition ${current.btn} disabled:bg-gray-400`}>
            {isLoading ? 'กำลังส่ง...' : 'ยืนยันและส่ง'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;