"use client"

import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";
import axios from "axios";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      console.log("Sending text to API:", text);
      const res = await axios.post('/api/summarize/', {
        text: text
      });
      console.log(res.data);
      setResponse(JSON.stringify(res.data, null, 2));
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
        AI For Thai - Thai Text Summarization
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
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="กรอกข้อความที่นี่..."
          style={{
            width: "100%",
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
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
          {loading ? "กำลังประมวลผล..." : "ส่งข้อความ"}
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
              fontSize: 14,
              color: "#333",
              wordBreak: "break-all",
            }}
          >
            {response}
          </div>
        )}
      </form>
    </div>
  );
}
