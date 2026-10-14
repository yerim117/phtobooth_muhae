import { FILE_NAME } from "./photo";

// 기기별 사진 저장
// - 인앱 브라우저(카카오톡 등): 다운로드·파일 공유가 막혀 있어 "길게 눌러 저장" 안내
// - iOS: 다운로드 대신 공유 시트의 "이미지 저장" (탭 직후에만 허용되므로 blob을 미리 준비해 둘 것)
// - PC·Android: 바로 다운로드

const isIOS = () =>
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS

export const isInAppBrowser = () =>
  /KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER\(inapp|DaumApps|everytimeApp|; wv\)/i.test(navigator.userAgent);

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

const shareFile = async (file: File): Promise<"done" | "cancelled" | "failed"> => {
  if (!navigator.canShare?.({ files: [file] })) return "failed";
  try {
    await navigator.share({ files: [file] });
    return "done";
  } catch (e) {
    return (e as DOMException)?.name === "AbortError" ? "cancelled" : "failed";
  }
};

/** 저장을 시도하고, 직접 저장할 수 없는 환경이면 "longpress"를 돌려줌 → 길게 눌러 저장 안내 표시 */
export async function saveImage(blob: Blob): Promise<"done" | "longpress"> {
  if (isInAppBrowser()) return "longpress";
  if (isIOS()) {
    const file = new File([blob], FILE_NAME, { type: blob.type || "image/jpeg" });
    return (await shareFile(file)) === "failed" ? "longpress" : "done";
  }
  downloadBlob(blob, FILE_NAME);
  return "done";
}
