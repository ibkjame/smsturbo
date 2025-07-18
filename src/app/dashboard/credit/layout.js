export const metadata = {
  title: 'ตรวจสอบเครดิต - SMS Campaign Dashboard',
  description: 'ตรวจสอบเครดิตคงเหลือสำหรับส่งแคมเปญ SMS',
}

export default function RootLayout({ children }) {
  return (
    <div className="bg-[var(--color-bg-main)] text-[var(--color-text-main)] font-sans min-h-screen">{children}</div>
  );
}
