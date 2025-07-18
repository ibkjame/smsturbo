"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;

export default function CreditPage() {
  const [credit, setCredit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCredit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/get-credit');
      const data = await res.json();
      if (data.success) {
        setCredit(data.credit);
      } else {
        setError(data.message || 'ไม่สามารถดึงข้อมูลเครดิตได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredit();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-main)] font-sans">
      <div className="container mx-auto p-4 sm:p-8 lg:p-12">
        <header className="mb-8">
          <Link href="/dashboard" className="text-[var(--color-primary)] hover:underline mb-4 block font-semibold transition-colors">&larr; กลับไปหน้าแดชบอร์ด</Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">ตรวจสอบเครดิต</h1>
        </header>
        <div className="flex justify-center items-center">
          <div className="card w-full max-w-md text-center">
            <h2 className="text-lg text-[var(--color-text-secondary)] mb-2">เครดิตคงเหลือ</h2>
            {isLoading && <div className="text-5xl font-bold text-[var(--color-primary)] my-4 animate-pulse">Loading...</div>}
            {error && <div className="alert-success bg-[var(--color-error)] text-white my-4">{error}</div>}
            {!isLoading && !error && (
              <div className="text-7xl font-bold text-[var(--color-primary)] my-4">
                {credit !== null ? credit.toLocaleString() : 'N/A'}
              </div>
            )}
            <button 
              onClick={fetchCredit} 
              disabled={isLoading}
              className="button-main mt-6 inline-flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <RefreshIcon className={isLoading ? 'animate-spin' : ''} />
              รีเฟรช
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
