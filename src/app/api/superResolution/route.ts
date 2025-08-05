import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ไม่พบไฟล์ที่อัปโหลด' },
        { status: 400 }
      );
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 2.5 MB)
    if (file.size > 2.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ขนาดไฟล์เกิน 2.5 MB' },
        { status: 400 }
      );
    }

    // ตรวจสอบชนิดไฟล์
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'กรุณาส่งไฟล์ภาพเท่านั้น' },
        { status: 400 }
      );
    }

    // สร้าง FormData สำหรับส่งไปยัง API
    const apiFormData = new FormData();
    apiFormData.append('file', file);

    const response = await axios.post(
      'https://api.aiforthai.in.th/superresolution/sr',
      apiFormData,
      {
        headers: {
          'Apikey': process.env.NEXT_PUBLIC_API_KEY,
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer', // สำหรับรับไฟล์ภาพ
      }
    );

    // ส่งกลับเป็น image response
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="enhanced_image.jpg"',
      },
    });

  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการประมวลผลภาพ' },
      { status: error.response?.status || 500 }
    );
  }
}