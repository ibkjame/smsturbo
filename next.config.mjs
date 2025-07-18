/** @type {import('next').NextConfig} */
const nextConfig = {
  // ไม่ต้องใช้ basePath เพื่อให้ลิงก์สั้นทำงานที่รากของโดเมน
  output: 'standalone',

  async rewrites() {
    return [
      // กฎสำหรับหน้าหลัก (ถ้ามี)
      {
        source: '/',
        destination: '/dashboard',
      },
      // *** กฎที่แก้ไขใหม่สำหรับแพทเทิร์น 'bk' ***
      // เมื่อมีคนเข้ามาที่ /bk ตามด้วยตัวเลข (เช่น /bk1, /bk123)
      // ให้ส่งต่อไปยัง API จริงที่ /api/tracker/bk...
      {
        source: '/bk:id(\\d+)', // ใช้ Regular Expression เพื่อจับเฉพาะตัวเลข
        destination: '/api/tracker/bk:id',
      },
    ];
  },
};

export default nextConfig;
