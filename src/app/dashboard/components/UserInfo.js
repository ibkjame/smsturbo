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
      setCredit('19,999');
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
      {/* User Info Section */}
      <div className="w-1/2">
          {isTrialMode && (
            <span className="ml-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              โหมดทดลอง
            </span>
          )}
        </h2>
      </div>    
  );
};

export default UserInfo;
