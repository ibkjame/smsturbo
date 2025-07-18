import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, campaignName, recipientCount, pin, setPin, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-lime-400/50 rounded-2xl shadow-lg p-8 m-4 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">ยืนยันการส่งแคมเปญ</h2>
        <div className="text-gray-300 space-y-4 mb-6">
          <p><strong>ชื่อแคมเปญ:</strong> {campaignName}</p>
          <p><strong>จำนวนผู้รับ:</strong> {recipientCount} คน</p>
        </div>
        <div className="mb-6">
          <label htmlFor="pin" className="block text-sm font-medium text-gray-400 mb-2">กรุณากรอก PIN เพื่อยืนยัน</label>
          <input type="password" id="pin" value={pin} onChange={e => setPin(e.target.value)} className="w-full p-3 bg-black border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none" autoComplete="off" required />
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition">ยกเลิก</button>
          <button onClick={onConfirm} disabled={isLoading || !pin} className="px-6 py-2 rounded-lg bg-lime-400 text-black font-bold hover:bg-lime-300 disabled:bg-gray-600 transition">{isLoading ? 'กำลังส่ง...' : 'ยืนยันและส่ง'}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
