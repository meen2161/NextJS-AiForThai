import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // รับ form data ที่มีไฟล์ภาพ
    const formData = await request.formData();
    const file = formData.get('src_img') as File;
    const json_export = formData.get('json_export') || 'true';
    // กำหนด img_export เป็น true เสมอ เพื่อให้ได้ human_img
    const img_export = 'true';

    if (!file) {
      return NextResponse.json({ error: 'กรุณาอัปโหลดไฟล์ภาพ' }, { status: 400 });
    }

    // เตรียม form data สำหรับส่งไป API
    const apiForm = new FormData();
    apiForm.append('src_img', file);
    apiForm.append('json_export', json_export);
    apiForm.append('img_export', img_export);

    const response = await axios.post(
      'https://api.aiforthai.in.th/person/human_detect/',
      apiForm,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Apikey': process.env.NEXT_PUBLIC_API_KEY as string,
        },
      }
    );

    // ตรวจสอบว่ามี human_img ใน response หรือไม่
    if (!response.data.human_img) {
      return NextResponse.json(
        { status: 500 }
      );
    }

    // ส่งกลับ human_img เป็น JSON
    return NextResponse.json({ human_img: response.data.human_img });
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ API' },
      { status: error.response?.status || 500 }
    );
  }
}