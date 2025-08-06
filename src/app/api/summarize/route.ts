import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await axios.post(
      'https://api.aiforthai.in.th/textsummarize',
      [
        {
          id: 100,
          src: body.text,
          comp_rate: 30
        }
      ],
      {
        headers: {
          'Content-Type': 'application/json',
          'Apikey': process.env.NEXT_PUBLIC_API_KEY
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ API' },
      { status: error.response?.status || 500 }
    );
  }
}