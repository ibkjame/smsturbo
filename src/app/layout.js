import { Analytics } from '@vercel/analytics/react';
import { Inter, Prompt } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const prompt = Prompt({ subsets: ['thai'], weight: ['300', '400', '800'], variable: '--font-prompt' });

export const metadata = {
  title: 'SMS Campaign Dashboard',
  description: 'ระบบจัดการแคมเปญ SMS ส่งข้อความผ่านระบบAPI ตรวจสอบสถานะการส่งรองรับมือถือ',
  keywords: ['SMS', 'Campaign', 'Dashboard', 'ส่งข้อความ', 'สถานะการส่ง', 'ธีมสี', 'Responsive', 'SweetAlert2', 'SpamWords', 'Next.js'],
  authors: [{ name: 'P', url: 'https://t.me/agentacsms' }],
  openGraph: {
    title: 'SMS Campaign Dashboard',
    description: 'ระบบจัดการแคมเปญ SMS ส่งข้อความ ตรวจสอบสถานะ และเลือกธีมสีได้อย่างง่ายดาย รองรับมือถือ',
    images: ['/sms.svg'],
    url: 'https://t.me/agentacsms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMS Campaign Dashboard',
    description: 'ระบบจัดการแคมเปญ SMS ส่งข้อความ ตรวจสอบสถานะ และเลือกธีมสีได้อย่างง่ายดาย รองรับมือถือ',
    images: ['https://img5.pic.in.th/file/secure-sv1/20250718_0729_Futuristic-SMS-Logo_simple_compose_01k0dexx8rf7pt8w041wkrywwn.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${prompt.variable} bg-gradient-to-b from-black via-gray-900 to-white text-white min-h-screen`}>
        {/* Spinner overlay: ซ่อน spinner โดย default */}
        <div id="global-spinner" style={{display:'none'}}>
          <div className="spinner"></div>
          <div className="spinner-text">กำลังโหลด...</div>
        </div>
        {children}
        <Analytics />
      </body>
    </html>
  )
}