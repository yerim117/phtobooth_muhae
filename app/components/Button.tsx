import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({ variant = "primary", disabled, style, ...props }: ButtonProps) {
  const primary = variant === "primary";
  return (
    <button
      disabled={disabled}
      style={{
        minWidth: 140,
        padding: "13px 22px",
        background: primary ? "var(--ink)" : "transparent",
        color: primary ? "var(--lime)" : "var(--ink)",
        border: "2px solid var(--ink)",
        borderRadius: 4,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: "0.08em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...props}
    />
  );
}
