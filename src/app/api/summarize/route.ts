import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export async function POST(request: NextRequest) {
  try {
    let base64Image = '';

    // เช็ค content-type
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // รับไฟล์จาก form-data
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'ไม่พบไฟล์ภาพ' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Image = buffer.toString('base64');
    } else {
      // รับชื่อไฟล์จาก JSON
      const { filename } = await request.json();
      if (!filename) {
        return NextResponse.json({ error: 'กรุณาระบุชื่อไฟล์' }, { status: 400 });
      }
      let filePath = '';
      if (path.extname(filename)) {
        filePath = path.join(process.cwd(), 'public', 'pic', filename);
        try {
          await fs.access(filePath);
        } catch {
          return NextResponse.json({ error: 'ไม่พบไฟล์ภาพ' }, { status: 404 });
        }
      } else {
        let found = false;
        for (const ext of IMAGE_EXTENSIONS) {
          const tryPath = path.join(process.cwd(), 'public', 'pic', filename + ext);
          try {
            await fs.access(tryPath);
            filePath = tryPath;
            found = true;
            break;
          } catch {}
        }
        if (!found) {
          return NextResponse.json({ error: 'ไม่พบไฟล์ภาพ' }, { status: 404 });
        }
      }
      const buffer = await fs.readFile(filePath);
      base64Image = buffer.toString('base64');
    }

    // ส่งไป API
    const response = await axios.post(
      'https://api.aiforthai.in.th/thaifood',
      { file: base64Image },
      {
        headers: {
          'Content-Type': 'application/json',
          'Apikey': process.env.NEXT_PUBLIC_API_KEY
        }
      }
    );

    // จัดระเบียบ output และตกแต่งผลลัพธ์
    let result = null;
    if (response.data?.objects?.length > 0) {
      const { label, rank, result: res, score } = response.data.objects[0];
      result = {
        label: `อาหารที่คาดว่าเป็น: ${label}`,
        rank: `อันดับ: ${rank}`,
        result: `ชื่ออาหาร: ${res}`,
        score: `ความมั่นใจ: ${(parseFloat(score) * 100).toFixed(2)}%`
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ API' },
      { status: error.response?.status || 500 }
    );
  }
}