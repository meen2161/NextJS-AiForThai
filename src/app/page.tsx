"use client"

import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setResponse(null);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResponse(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/summarize/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
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
        AI For Thai - Thai Food Image Recognition
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
          accept="image/*"
          onChange={handleFileChange}
          style={{
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              width: "100%",
              maxHeight: 300,
              objectFit: "contain",
              borderRadius: 8,
              marginBottom: 8,
            }}
          />
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
          {loading ? "กำลังส่ง..." : "ส่งข้อความ"}
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
              marginTop: 16,
              background: "#e6f7ff",
              padding: 20,
              borderRadius: 12,
              fontSize: 18,
              color: "#005c99",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              minHeight: 80,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {(() => {
              try {
                const data = JSON.parse(response);
                if (!data) return "ไม่พบข้อมูลอาหาร";
                return (
                  <>
                    <div>🍽️ {data.label}</div>
                    <div>🏷️ {data.result}</div>
                    <div>⭐ {data.score}</div>
                    <div>🏆 {data.rank}</div>
                  </>
                );
              } catch {
                return response;
              }
            })()}
          </div>
        )}
      </form>
    </div>
  );
}
