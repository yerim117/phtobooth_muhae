"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Button from "./Button";
import LongPressHint from "./LongPressHint";
import Screen from "./Screen";
import { PHOTO_RETENTION_DAYS, photoApiUrl } from "../lib/photo";
import { isInAppBrowser, saveImage } from "../lib/save";

const noopSubscribe = () => () => {};

// QR로 열리는 사진 받기 화면
export default function PhotoDownload({ id }: { id: string }) {
  const src = photoApiUrl(id);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [hint, setHint] = useState(false);
  // 서버 렌더링 시에는 false, 브라우저에서 UA로 판별
  const inApp = useSyncExternalStore(noopSubscribe, isInAppBrowser, () => false);

  // iOS 공유 시트는 탭 직후에만 열 수 있어서 이미지 파일을 미리 받아 둠
  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(`${res.status}`))))
      .then((b) => !cancelled && setBlob(b))
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [src]);

  const save = async () => {
    if (!blob) return;
    try {
      if ((await saveImage(blob)) === "longpress") setHint(true);
    } catch (e) {
      console.error(e);
      alert("사진 저장에 실패했어요.");
    }
  };

  return (
    <Screen gap={20}>
      <p style={{ fontSize: 13, letterSpacing: "0.3em", fontWeight: 700 }}>
        <span style={{ background: "var(--lime)", padding: "2px 8px" }}>입소자 인증사진</span>
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element -- private 저장소 이미지를 API로 내려받음 */}
      <img
        src={src}
        alt="무해센터 입소자 인증사진"
        style={{ width: "min(84vw, 360px)", boxShadow: "0 10px 28px rgba(0,0,0,0.18)", WebkitTouchCallout: "default" }}
      />

      {inApp ? (
        <p style={{ fontSize: 15, fontWeight: 700, textAlign: "center" }}>사진을 길게 눌러 저장해 주세요</p>
      ) : (
        <Button onClick={save} disabled={!blob} style={{ minWidth: 200 }}>
          {blob ? "사진 저장" : "불러오는 중…"}
        </Button>
      )}

      <p style={{ fontSize: 12, color: "var(--muted)" }}>이 사진은 촬영 후 {PHOTO_RETENTION_DAYS}일 동안 보관돼요</p>

      {hint && blob && <LongPressHint imageUrl={src} onClose={() => setHint(false)} />}
    </Screen>
  );
}
