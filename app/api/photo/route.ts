import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import { BLOB_ACCESS } from "../../lib/blob";
import { PHOTO_MAX_BYTES, photoPathname } from "../../lib/photo";

// 합성된 인증사진(JPEG) 업로드 → QR용 ID 발급
export async function POST(req: Request) {
  if (req.headers.get("content-type") !== "image/jpeg") {
    return Response.json({ error: "invalid_type" }, { status: 415 });
  }

  const body = new Uint8Array(await req.arrayBuffer());
  if (body.length === 0 || body.length > PHOTO_MAX_BYTES) {
    return Response.json({ error: "invalid_size" }, { status: 413 });
  }
  // 누구나 호출할 수 있으므로 실제 JPEG인지 시그니처 확인
  if (body[0] !== 0xff || body[1] !== 0xd8 || body[2] !== 0xff) {
    return Response.json({ error: "invalid_image" }, { status: 400 });
  }

  const id = randomBytes(16).toString("base64url");
  try {
    await put(photoPathname(id), Buffer.from(body), {
      access: BLOB_ACCESS,
      contentType: "image/jpeg",
      addRandomSuffix: false,
    });
  } catch (e) {
    console.error("blob put 실패", e);
    return Response.json({ error: "storage_failed" }, { status: 500 });
  }

  return Response.json({ id });
}
