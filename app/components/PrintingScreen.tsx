"use client";

import { useEffect } from "react";
import Screen from "./Screen";

interface PrintingScreenProps {
  imageUrl: string | null; // 합성이 끝나기 전에는 null
  onDone: () => void;
}

const PRINT_DURATION_MS = 2600;

export default function PrintingScreen({ imageUrl, onDone }: PrintingScreenProps) {
  // 합성된 이미지가 준비된 뒤부터 출력 연출 시간을 셈
  useEffect(() => {
    if (!imageUrl) return;
    const t = setTimeout(onDone, PRINT_DURATION_MS);
    return () => clearTimeout(t);
  }, [imageUrl, onDone]);

  return (
    <Screen gap={20}>
      <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.3em" }}>인증사진 출력 중</p>

      {/* 출력구 */}
      <div style={{ width: "min(72vw, 300px)" }}>
        <div style={{ height: 14, background: "var(--ink)", borderRadius: 4 }} />
        <div style={{ overflow: "hidden", margin: "0 10px" }}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob URL이라 next/image 최적화 불가
            <img
              src={imageUrl}
              alt="출력 중인 인증사진"
              className="print-anim"
              style={{ width: "100%", display: "block", boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }}
            />
          ) : (
            <div style={{ aspectRatio: "941 / 1672" }} />
          )}
        </div>
      </div>

      <div style={{ width: "min(72vw, 300px)", height: 8, border: "1.5px solid var(--ink)", overflow: "hidden" }}>
        <div className="stripe-anim" style={{ height: "100%" }} />
      </div>
    </Screen>
  );
}
