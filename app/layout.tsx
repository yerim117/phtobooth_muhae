import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "무해센터 입소자 인증사진",
  description: "프레임을 고르고 2컷을 찍어 무해센터 입소자 인증사진을 받아 가세요.",
};

export const viewport: Viewport = {
  themeColor: "#efede8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
