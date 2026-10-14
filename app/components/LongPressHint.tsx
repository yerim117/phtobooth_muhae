"use client";

interface LongPressHintProps {
  imageUrl: string;
  onClose: () => void;
}

// 다운로드·공유 시트가 막힌 환경(인앱 브라우저 등)에서 "길게 눌러 저장"을 안내하는 오버레이
export default function LongPressHint({ imageUrl, onClose }: LongPressHintProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
      }}
    >
      <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, textAlign: "center", lineHeight: 1.5 }}>
        사진을 길게 눌러 저장해 주세요
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- blob URL이라 next/image 최적화 불가 */}
      <img
        src={imageUrl}
        alt="인증사진"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "100%", maxHeight: "72dvh", WebkitTouchCallout: "default" }}
      />
      <button
        onClick={onClose}
        style={{
          padding: "10px 24px",
          background: "transparent",
          color: "#fff",
          border: "1.5px solid #fff",
          borderRadius: 4,
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        닫기
      </button>
    </div>
  );
}
