"use client"

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResponse(null);
    if (selectedFile) {
      setFileUrl(URL.createObjectURL(selectedFile));
    } else {
      setFileUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResponse(null);
    try {
      if (!file) {
        setResponse({ error: "กรุณาเลือกไฟล์ภาพ" });
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("src_img", file);
      formData.append("json_export", "true");
      formData.append("img_export", "true");

      const res = await axios.post("/api/summarize/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResponse(res.data);
    } catch (err: any) {
      setResponse({ error: err.response?.data?.error || "เกิดข้อผิดพลาดในการเชื่อมต่อ API" });
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
        AI For Thai - Human Detection
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
        <input
          type="file"
          accept="image/jpeg,image/jpg"
          onChange={handleFileChange}
        />
        {fileUrl && (
          <div style={{ margin: "8px 0", textAlign: "center" }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>ภาพที่อัปโหลด</div>
            <img
              src={fileUrl}
              alt="uploaded"
              style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, border: "1px solid #eee" }}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !file}
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
          {loading ? "กำลังประมวลผล..." : "อัปโหลดรูปภาพ"}
        </button>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        {response && (
          <div style={{ marginTop: 16, width: "100%" }}>
            {response.error && (
              <div style={{ color: "red", marginBottom: 8 }}>{response.error}</div>
            )}
            {response?.human_img && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <div style={{ fontSize: 16, marginBottom: 8, fontWeight: "bold" }}>ผลลัพธ์ที่ตรวจจับบุคคล</div>
                <img
                  src={response.human_img}
                  alt="human detected"
                  style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 8, border: "1px solid #eee" }}
                />
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
