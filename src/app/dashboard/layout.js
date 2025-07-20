"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Layout component to protect the dashboard route

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/login');
    } else {
      setIsVerified(true);
    }
  }, [router]);

  // Render nothing until the verification is complete
  if (!isVerified) {
    return null;
  }

  // แสดงเนื้อหาของหน้าที่ถูกป้องกันเมื่อตรวจสอบผ่านแล้ว
  return (
    <div className="bg-[var(--color-bg-main)] text-[var(--color-text-main)] font-sans min-h-screen">
      {children}
    </div>
  );
}
