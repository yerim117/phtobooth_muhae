import { del, list } from "@vercel/blob";
import { PHOTO_PREFIX, PHOTO_RETENTION_DAYS } from "../../../lib/photo";

// 보관 기간이 지난 인증사진 삭제 (vercel.json의 cron이 매일 호출)
export async function GET(req: Request) {
  // Vercel Cron은 CRON_SECRET 환경변수를 Authorization 헤더로 보냄
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const cutoff = Date.now() - PHOTO_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let cursor: string | undefined;
  let deleted = 0;
  do {
    const page = await list({ prefix: PHOTO_PREFIX, cursor, limit: 1000 });
    const expired = page.blobs.filter((b) => b.uploadedAt.getTime() < cutoff).map((b) => b.url);
    if (expired.length > 0) {
      await del(expired);
      deleted += expired.length;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return Response.json({ deleted });
}
