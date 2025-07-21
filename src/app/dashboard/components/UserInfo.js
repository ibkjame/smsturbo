'use client'

import { useState, useEffect } from 'react';

// ตรวจสอบโหมดทดลองจาก Environment Variable
const isTrialMode = process.env.NEXT_PUBLIC_TRIAL_MODE === 'true';

const UserInfo = () => {
  const [credit, setCredit] = useState('...');
  const [error, setError] = useState('');

  useEffect(() => {
    // ตรวจสอบว่าเป็นโหมดทดลองหรือไม่
    if (isTrialMode) {
      // ---- จุดที่แก้ไข ----
      // ถ้าใช่, ให้กำหนดค่าเครดิตเป็น '****'
      setCredit('****'); 
      return; // จบการทำงานทันทีเพื่อไม่ให้ดึงเครดิตจริง
    }

    // ส่วนนี้จะทำงานเมื่อ isTrialMode เป็น false เท่านั้น
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
        setError('Could not load credit data');
      }
    };

    fetchCredit();
  }, []);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex justify-between items-center">
      
      {/* User Info Section (Left Side) */}
      <div className="w-1/2">
        <h2 className="text-xl font-bold flex items-center">
          {isTrialMode && (
            <span className="ml-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              โหมดทดลอง
            </span>
          )}
        </h2>
      </div>

      {/* Credit Balance Section (Right Side) */}
      <div className="w-1/2 text-right">
        <p className="text-lg">เครดิต</p>
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
