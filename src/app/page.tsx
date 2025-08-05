"use client"

import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";
import axios from "axios";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ตรวจสอบชนิดไฟล์
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์ภาพเท่านั้น');
        return;
      }
      setSelectedFile(file);
      
      // สร้าง preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setLoading(true);
    setResponse(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const res = await axios.post('/api/superResolution', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // ตรวจสอบ response และดึง URL ของภาพ
      if (res.data.status === 'success' && res.data.url) {
        setResponse(res.data.url);
      } else {
        setResponse(res.data.error || "เกิดข้อผิดพลาดในการประมวลผล");
      }
    } catch (err: any) {
      console.error('Error:', err);
      setResponse(err.response?.data?.error || "เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
      }}
    >
      <h1
        style={{
          color: "#000",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        AI For Thai - Image Analysis
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: 400,
          maxWidth: "90vw",
        }}
      >
        <div
          style={{
            border: "2px dashed #ccc",
            borderRadius: 8,
            padding: 20,
            textAlign: "center",
            background: "#f9f9f9",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              width: "100%",
              padding: 8,
              fontSize: 14,
              border: "none",
              background: "transparent",
            }}
          />
          <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "#666" }}>
            เลือกไฟล์ภาพ (แนะนำขนาด 640 × 480 พิกเซล)
          </p>
          {selectedFile && (
            <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "#333" }}>
              ไฟล์ที่เลือก: {selectedFile.name}
            </p>
          )}
        </div>

        {imagePreview && (
          <div
            style={{
              textAlign: "center",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              background: "#fafafa",
            }}
          >
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: 4,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedFile}
          style={{
            padding: "12px 0",
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            background: loading ? "#ccc" : "#0070f3",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {loading && (
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid #fff",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
          {loading ? "กำลังประมวลผล..." : "อัปโหลดภาพ"}
        </button>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        {response && (
          <div
            style={{
              marginTop: 8,
              background: "#f5f5f5",
              padding: 12,
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            {response.startsWith('https://') ? (
              <>
                <h3 style={{ color: "#000", marginBottom: "8px" }}>ภาพที่ปรับปรุงแล้ว:</h3>
                <img
                  src={response}
                  alt="Enhanced"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "400px",
                    borderRadius: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <br />
                <a 
                  href={response} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: "#0070f3", 
                    textDecoration: "underline",
                    fontSize: "12px",
                    marginTop: "8px",
                    display: "inline-block"
                  }}
                >
                  ดาวน์โหลดภาพ
                </a>
              </>
            ) : (
              <div style={{ color: "#f00", fontSize: 14 }}>{response}</div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
