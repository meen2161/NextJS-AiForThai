"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("กรุณาเลือกไฟล์ภาพก่อน");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("ไฟล์ต้องไม่เกิน 2 MB");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/chestxray", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
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
        วิเคราะห์ภาพเอ็กซ์เรย์ทรวงอก
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
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
          style={{
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        />
        <button
          type="submit"
          disabled={loading || !file}
          style={{
            padding: "12px 0",
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            background: "#0070f3",
            color: "#fff",
            cursor: loading || !file ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "กำลังวิเคราะห์..." : "วิเคราะห์"}
        </button>
      </form>

      {error && (
        <p
          style={{
            marginTop: 8,
            color: "red",
            fontWeight: "bold",
            maxWidth: 400,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}

      {result && (
        <div
          style={{
            marginTop: 20,
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 8,
            fontSize: 14,
            color: "#333",
            wordBreak: "break-word",
            maxWidth: 400,
            textAlign: "center",
          }}
        >
          {result.OK && result.objects?.length > 0 ? (
            <>
              <p>
                <strong>สถานะ:</strong> {result.objects[0].result}
              </p>
              <p>
                <strong>ความน่าเชื่อถือ:</strong> {result.objects[0].score}
              </p>
            </>
          ) : (
            <p>ไม่สามารถวิเคราะห์ได้</p>
          )}
        </div>
      )}
    </div>
  );
}
