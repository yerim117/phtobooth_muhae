import { get } from "@vercel/blob";
import { BLOB_ACCESS } from "../../../lib/blob";
import { FILE_NAME, PHOTO_ID_RE, photoPathname } from "../../../lib/photo";

// 인증사진 이미지 전달 (private 스토어라 서버를 거쳐 내려줌)
// ?download=1 이면 첨부파일로 내려서 Android·PC에서 바로 다운로드되게 함
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!PHOTO_ID_RE.test(id)) return new Response("not found", { status: 404 });

  try {
    const result = await get(photoPathname(id), { access: BLOB_ACCESS });
    if (!result || result.statusCode !== 200) return new Response("not found", { status: 404 });

    const download = new URL(req.url).searchParams.get("download") === "1";
    return new Response(result.stream, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=3600",
        ...(download && { "Content-Disposition": `attachment; filename="${FILE_NAME}"` }),
      },
    });
  } catch (e) {
    console.error("blob get 실패", e);
    return new Response("not found", { status: 404 });
  }
}
