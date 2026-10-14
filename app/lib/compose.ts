import type { Frame, Slot } from "./frames";

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${src.slice(0, 40)}`));
    img.src = src;
  });

// 사선으로 깎인 모서리 모양의 칸 경로
const slotPath = (ctx: CanvasRenderingContext2D, { x, y, w, h, chamfer: c }: Slot) => {
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.lineTo(x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
};

// object-fit: cover 처럼 칸을 꽉 채우도록 사진을 그림
const drawCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, { x, y, w, h }: Slot) => {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
};

// 프레임 픽셀이 "빈 칸 색(밝은 무채색)"에 가까울수록 1 → 사진이 보임
// 칸 위에 걸친 도장·테두리선 같은 진한/유채색 픽셀은 0 → 프레임이 그대로 남음
const slotKey = (r: number, g: number, b: number) => {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  const lumAlpha = Math.min(1, Math.max(0, (lum - 200) / 25));
  const chromaAlpha = Math.min(1, Math.max(0, (40 - chroma) / 20));
  return lumAlpha * chromaAlpha;
};

/** 고른 프레임의 두 칸에 사진을 합성해 한 장의 JPEG로 만듦 */
export async function composeFrame(frame: Frame, photos: string[]): Promise<Blob> {
  const [frameImg, ...photoImgs] = await Promise.all([frame.src, ...photos].map(loadImage));
  const W = frameImg.width;
  const H = frameImg.height;
  const k = W / frame.baseWidth;
  const slots = frame.slots.map((s) => ({
    x: Math.round(s.x * k),
    y: Math.round(s.y * k),
    w: Math.round(s.w * k),
    h: Math.round(s.h * k),
    chamfer: Math.round(s.chamfer * k),
  }));

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas context 없음");
  ctx.drawImage(frameImg, 0, 0);

  // 사진 레이어: 칸 모양으로 잘라 그림
  const layer = document.createElement("canvas");
  layer.width = W;
  layer.height = H;
  const lctx = layer.getContext("2d");
  if (!lctx) throw new Error("canvas context 없음");
  slots.forEach((slot, i) => {
    const img = photoImgs[i];
    if (!img) return;
    lctx.save();
    slotPath(lctx, slot);
    lctx.clip();
    drawCover(lctx, img, slot);
    lctx.restore();
  });

  // 칸 영역에서 프레임과 사진을 픽셀 단위로 섞음
  for (const { x, y, w, h } of slots) {
    const base = ctx.getImageData(x, y, w, h);
    const photo = lctx.getImageData(x, y, w, h);
    const b = base.data;
    const p = photo.data;
    for (let i = 0; i < b.length; i += 4) {
      const a = (p[i + 3] / 255) * slotKey(b[i], b[i + 1], b[i + 2]);
      if (a === 0) continue;
      b[i] = p[i] * a + b[i] * (1 - a);
      b[i + 1] = p[i + 1] * a + b[i + 1] * (1 - a);
      b[i + 2] = p[i + 2] * a + b[i + 2] * (1 - a);
    }
    ctx.putImageData(base, x, y);
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob 실패"))), "image/jpeg", 0.92)
  );
}
