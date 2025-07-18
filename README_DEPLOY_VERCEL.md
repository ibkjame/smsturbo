# Vercel Deployment Guide for SMS Dashboard (Next.js)

## 1. เตรียมไฟล์และโค้ด
- ตรวจสอบว่า next.config.mjs มี basePath: '/1s' และ output: 'standalone'
- สร้างไฟล์ .env.example สำหรับอ้างอิง Environment Variables

## 2. เตรียมฐานข้อมูล
- ฐานข้อมูล MySQL ต้องออนไลน์และเข้าถึงได้จาก Vercel (แนะนำใช้บริการ Cloud DB เช่น PlanetScale, Supabase, หรือ MySQL บน Cloud)
- กำหนดค่าใน Environment Variables ให้ถูกต้อง

## 3. Deploy ขึ้น Vercel
1. สมัคร/ล็อกอินที่ https://vercel.com
2. กด New Project แล้วเชื่อมต่อกับ GitHub/GitLab/Bitbucket ที่มีโปรเจกต์นี้
3. ตั้ง Environment Variables ตาม .env.example ในหน้า Settings > Environment Variables ของ Project
4. กด Deploy

## 4. ตรวจสอบหลัง Deploy
- URL จะเป็น https://ibk168.net/1s (ถ้าตั้ง domain และ basePath ตรงกัน)
- API route เช่น /api/tracker/[id] จะเป็น https://ibk168.net/1s/api/tracker/xxxxxx
- ตรวจสอบการเชื่อมต่อฐานข้อมูลและการ redirect ของลิงก์ tracker

## 5. หมายเหตุ
- หากใช้ Custom Domain ให้ตั้งค่า DNS ให้ชี้ไปที่ Vercel
- หากต้องการเปลี่ยน basePath ให้แก้ไขทั้ง next.config.mjs และ NEXT_PUBLIC_BASE_URL ให้ตรงกัน
- หากมี static file หรือ public asset ให้ใส่ไว้ใน /public

---

**หากติดปัญหาเรื่อง DB Connection หรือ ENV บน Vercel ให้ตรวจสอบ Log ของ Vercel และสิทธิ์การเข้าถึงฐานข้อมูล**
