"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CaptureScreen from "./components/CaptureScreen";
import FrameSelect from "./components/FrameSelect";
import PrintingScreen from "./components/PrintingScreen";
import ResultScreen, { type Upload } from "./components/ResultScreen";
import { composeFrame } from "./lib/compose";
import { getFrame, type Frame } from "./lib/frames";

type Step = "select" | "shooting" | "printing" | "result";

interface Result {
  blob: Blob;
  url: string;
}

const uploadPhoto = async (blob: Blob): Promise<string> => {
  const res = await fetch("/api/photo", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });
  if (!res.ok) throw new Error(`photo API ${res.status}`);
  return ((await res.json()) as { id: string }).id;
};

export default function Home() {
  const [step, setStep] = useState<Step>("select");
  const [frameId, setFrameId] = useState<Frame["id"]>("white");
  const [result, setResult] = useState<Result | null>(null);
  const [upload, setUpload] = useState<Upload>({ status: "uploading" });
  const uploadSeq = useRef(0);

  // 이전 결과 이미지 URL 정리
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  // 출력 연출이 도는 동안 미리 업로드해서 결과 화면에서 QR이 바로 보이게 함
  const startUpload = useCallback((blob: Blob) => {
    const seq = ++uploadSeq.current;
    setUpload({ status: "uploading" });
    uploadPhoto(blob)
      .then((id) => seq === uploadSeq.current && setUpload({ status: "done", id }))
      .catch((e) => {
        console.error(e);
        if (seq === uploadSeq.current) setUpload({ status: "error" });
      });
  }, []);

  const handleStart = (id: Frame["id"]) => {
    setFrameId(id);
    setStep("shooting");
  };

  const handleCaptured = async (photos: string[]) => {
    setResult(null);
    setStep("printing");
    try {
      const blob = await composeFrame(getFrame(frameId), photos);
      setResult({ blob, url: URL.createObjectURL(blob) });
      startUpload(blob);
    } catch (e) {
      console.error(e);
      alert("사진을 만들지 못했어요. 다시 찍어 주세요.");
      setStep("select");
    }
  };

  const handleRetake = () => {
    uploadSeq.current++; // 진행 중인 업로드 결과 무시
    setResult(null);
    setStep("select");
  };

  const handlePrintDone = useCallback(() => setStep("result"), []);

  return (
    <main style={{ width: "100%", minHeight: "100dvh", overflow: "hidden" }}>
      {step === "select" && <FrameSelect initial={frameId} onStart={handleStart} />}

      {step === "shooting" && <CaptureScreen onComplete={handleCaptured} onCancel={handleRetake} />}

      {step === "printing" && <PrintingScreen imageUrl={result?.url ?? null} onDone={handlePrintDone} />}

      {step === "result" && result && (
        <ResultScreen
          blob={result.blob}
          imageUrl={result.url}
          upload={upload}
          onRetryUpload={() => startUpload(result.blob)}
          onRetake={handleRetake}
        />
      )}
    </main>
  );
}
