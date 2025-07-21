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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 p-4">
      <div className="w-full max-w-sm p-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-200">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-2">
          SMS Dashboard
        </h1>
        <p className="text-center text-blue-400 mb-8">กรอกรหัส 123456 เพื่อเข้าส่โหมดทดลอง</p>
        
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
              className="w-full p-3 bg-blue-50 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition text-blue-700 placeholder-blue-400"
              placeholder="รหัสผ่าน"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all transform hover:scale-105"
            >
              {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
