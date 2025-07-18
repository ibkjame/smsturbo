"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import "./globals.css";
// Layout component to protect the dashboard route

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  
  // แสดงเนื้อหาของหน้าที่ถูกป้องกันเมื่อตรวจสอบผ่านแล้ว
  return (
    <>
     
      {children}
    </>
  );
}
