"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        // บันทึกสถานะการ Login ใน sessionStorage
        // ข้อมูลจะหายไปเมื่อปิดแท็บเบราว์เซอร์
        sessionStorage.setItem('isLoggedIn', 'true');
        router.push('/dashboard');
      } else {
        setError(result.message || 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-lime-400/30">
        <h1 className="text-3xl font-bold text-lime-400 text-center mb-2">
          SMS Dashboard
        </h1>
        <p className="text-center text-gray-400 mb-8">กรุณาใส่รหัสผ่านเพื่อเข้าสู่ระบบ</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-black border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 focus:outline-none transition text-gray-300 placeholder-gray-500"
              placeholder="รหัสผ่าน"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center gap-2 bg-lime-400 text-black font-bold px-8 py-3 rounded-lg hover:bg-lime-300 disabled:bg-gray-600 transition-all transform hover:scale-105"
            >
              {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
