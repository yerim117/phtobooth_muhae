import type { ReactNode } from "react";

interface ScreenProps {
  children: ReactNode;
  gap?: number;
}

// 내용을 세로 중앙 정렬하는 전체 화면 레이아웃
export default function Screen({ children, gap = 24 }: ScreenProps) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap,
        padding: "32px 20px",
      }}
    >
      {children}
    </div>
  );
}
