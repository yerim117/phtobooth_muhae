"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Button from "./Button";
import LongPressHint from "./LongPressHint";
import Screen from "./Screen";
import { PHOTO_RETENTION_DAYS, photoPageUrl } from "../lib/photo";
import { saveImage } from "../lib/save";

export type Upload = { status: "uploading" } | { status: "done"; id: string } | { status: "error" };

interface ResultScreenProps {
  blob: Blob;
  imageUrl: string;
  upload: Upload;
  onRetryUpload: () => void;
  onRetake: () => void;
}

export default function ResultScreen({ blob, imageUrl, upload, onRetryUpload, onRetake }: ResultScreenProps) {
  const [qr, setQr] = useState<{ id: string; dataUrl: string } | null>(null);
  const [hint, setHint] = useState(false);

  const uploadedId = upload.status === "done" ? upload.id : null;
  useEffect(() => {
    if (!uploadedId) return;
    let cancelled = false;
    QRCode.toDataURL(photoPageUrl(window.location.origin, uploadedId), {
      margin: 1,
      width: 480,
      color: { dark: "#1c1d1c", light: "#ffffff" },
    }).then((dataUrl) => {
      if (!cancelled) setQr({ id: uploadedId, dataUrl });
    });
    return () => {
      cancelled = true;
    };
  }, [uploadedId]);

  const qrUrl = qr && qr.id === uploadedId ? qr.dataUrl : null;

  const save = async () => {
    try {
      if ((await saveImage(blob)) === "longpress") setHint(true);
    } catch (e) {
      console.error(e);
      alert("사진 저장에 실패했어요.");
    }
  };

  return (
    <Screen gap={24}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: 760,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- blob URL이라 next/image 최적화 불가 */}
        <img
          src={imageUrl}
          alt="완성된 인증사진"
          style={{ width: "min(78vw, 320px)", boxShadow: "0 10px 28px rgba(0,0,0,0.18)" }}
        />

        <div
          style={{
            width: "min(78vw, 300px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            padding: 20,
            background: "#fff",
            border: "2px solid var(--ink)",
          }}
        >
          <p style={{ fontSize: 13, letterSpacing: "0.25em", fontWeight: 700 }}>
            <span style={{ background: "var(--lime)", padding: "2px 8px" }}>QR로 사진 받기</span>
          </p>

          <div
            style={{
              width: 200,
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL이라 next/image 최적화 불가
              <img src={qrUrl} alt="사진 받기 QR 코드" style={{ width: "100%", height: "100%" }} />
            ) : upload.status === "error" ? (
              <div style={{ textAlign: "center", fontSize: 14, lineHeight: 1.6 }}>
                QR을 만들지 못했어요
                <br />
                <button
                  onClick={onRetryUpload}
                  style={{ marginTop: 8, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: "var(--muted)" }}>QR 만드는 중…</p>
            )}
          </div>

          <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", lineHeight: 1.6 }}>
            휴대폰 카메라로 QR을 찍으면
            <br />
            사진을 저장할 수 있어요 · {PHOTO_RETENTION_DAYS}일간 보관
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Button onClick={save}>이 기기에 저장</Button>
        <Button variant="secondary" onClick={onRetake}>
          다시 찍기
        </Button>
      </div>

      {hint && <LongPressHint imageUrl={imageUrl} onClose={() => setHint(false)} />}
    </Screen>
  );
}
