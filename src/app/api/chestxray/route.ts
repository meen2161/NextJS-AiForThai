import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormDataNode from "form-data"; 

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    
    const buffer = Buffer.from(await file.arrayBuffer());

    
    const newFormData = new FormDataNode();
    newFormData.append("file", buffer, {
      filename: (file as any).name || "file.jpg", 
      contentType: file.type || "image/jpeg",
    });

    
    const response = await axios.post(
      "https://api.aiforthai.in.th/chestxray",
      newFormData,
      {
        headers: {
          Apikey: process.env.API_KEY || "",
          ...newFormData.getHeaders(), 
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเชื่อมต่อ API" },
      { status: error.response?.status || 500 }
    );
  }
}
