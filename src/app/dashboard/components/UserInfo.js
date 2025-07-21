'use client'

import { useState, useEffect } from 'react';

// ตรวจสอบโหมดทดลองจาก Environment Variable
const isTrialMode = process.env.NEXT_PUBLIC_TRIAL_MODE === 'true';

const UserInfo = () => {
  const [credit, setCredit] = useState('...');
  const [error, setError] = useState('');

  useEffect(() => {
    // ถ้าเป็นโหมดทดลอง ให้แสดงเครดิตจำลองและไม่ต้อง fetch ข้อมูลจริง
    if (isTrialMode) {
      setCredit('999,999');
      return;
    }

    const fetchCredit = async () => {
      try {
        const response = await fetch('/api/get-credit');
        const data = await response.json();
        if (data.success) {
          setCredit(data.credit);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลเครดิตได้');
      }
    };
    fetchCredit();
  }, []);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold flex items-center">
          <span>ข้อมูลผู้ใช้</span>
          {/* ปรับแก้ส่วนนี้เพื่อแสดงป้ายกำกับ */}
          {isTrialMode && (
            <span className="ml-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              โหมดทดลอง
            </span>
          )}
        </h2>
        <p className="text-gray-400">ภาพรวมบัญชีของคุณ</p>
      </div>
      <div className="text-right">
        <p className="text-lg">เครดิตคงเหลือ</p>
        {error ? (
          <p className="text-2xl font-bold text-red-500">{error}</p>
        ) : (
          <p className="text-3xl font-bold text-green-400">{credit}</p>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
