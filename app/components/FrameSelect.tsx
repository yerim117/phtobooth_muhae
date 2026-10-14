"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "./Button";
import Screen from "./Screen";
import { FRAMES, type Frame } from "../lib/frames";

interface FrameSelectProps {
  initial?: Frame["id"];
  onStart: (frameId: Frame["id"]) => void;
}

export default function FrameSelect({ initial = FRAMES[0].id, onStart }: FrameSelectProps) {
  const [selected, setSelected] = useState<Frame["id"]>(initial);

  return (
    <Screen gap={28}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, letterSpacing: "0.3em", color: "var(--muted)" }}>MUHAE CENTER</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 6, wordBreak: "keep-all" }}>인증사진 프레임을 골라주세요</h1>
      </div>

      <div role="radiogroup" aria-label="프레임" style={{ display: "flex", gap: 16, width: "100%", maxWidth: 440 }}>
        {FRAMES.map((frame) => {
          const active = frame.id === selected;
          return (
            <button
              key={frame.id}
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(frame.id)}
              style={{
                flex: 1,
                position: "relative",
                padding: 6,
                background: active ? "var(--lime)" : "transparent",
                border: `2px solid ${active ? "var(--ink)" : "transparent"}`,
                borderRadius: 6,
                cursor: "pointer",
                transform: active ? "translateY(-4px)" : "none",
                boxShadow: active ? "0 8px 20px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.2s ease",
              }}
            >
              <Image
                src={frame.src}
                alt={`${frame.label} 프레임`}
                width={941}
                height={1672}
                sizes="(max-width: 480px) 45vw, 210px"
                priority
                style={{ width: "100%", height: "auto", display: "block", borderRadius: 3 }}
              />
              <span
                style={{
                  display: "block",
                  marginTop: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                {active ? "✓ " : ""}
                {frame.label}
              </span>
            </button>
          );
        })}
      </div>

      <Button onClick={() => onStart(selected)} style={{ minWidth: 200 }}>
        촬영 시작
      </Button>
    </Screen>
  );
}
