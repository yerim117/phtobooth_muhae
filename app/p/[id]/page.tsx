import type { Metadata } from "next";
import { head } from "@vercel/blob";
import PhotoDownload from "../../components/PhotoDownload";
import Screen from "../../components/Screen";
import { PHOTO_ID_RE, PHOTO_RETENTION_DAYS, photoPathname } from "../../lib/photo";

export const metadata: Metadata = {
  title: "무해센터 입소자 인증사진",
  description: "QR로 받은 인증사진을 저장해 보세요.",
  robots: { index: false },
};

async function exists(id: string) {
  if (!PHOTO_ID_RE.test(id)) return false;
  try {
    await head(photoPathname(id));
    return true;
  } catch {
    return false; // 없는 ID이거나 보관 기간이 지나 삭제됨
  }
}

export default async function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await exists(id))) {
    return (
      <Screen gap={10}>
        <p style={{ fontSize: 20, fontWeight: 800 }}>사진을 찾을 수 없어요</p>
        <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", lineHeight: 1.6 }}>
          링크가 잘못됐거나
          <br />
          보관 기간({PHOTO_RETENTION_DAYS}일)이 지나 삭제됐어요.
        </p>
      </Screen>
    );
  }
  return <PhotoDownload id={id} />;
}
