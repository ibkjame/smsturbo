'use client'

import { useState, useEffect } from 'react';

// Check for trial mode from Environment Variable
const isTrialMode = process.env.NEXT_PUBLIC_TRIAL_MODE === 'true';

const UserInfo = () => {
  const [credit, setCredit] = useState('...');
  const [error, setError] = useState('');

  useEffect(() => {
    // If in trial mode, show simulated credit and skip fetching real data
    if (isTrialMode) {
      setCredit('19,999'); // ตั้งค่าเครดิตสำหรับโหมดทดลอง
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
          <span>ข้อมูลผู้ใช้</span>
          {isTrialMode && (
            <span className="ml-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              โหมดทดลอง
            </span>
          )}
        </h2>
        <p className="text-gray-400">ภาพรวมบัญชีของคุณ</p>
      </div>

      {/* Credit Balance Section (Right Side) */}
      <div className="w-1/2 text-right">
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
