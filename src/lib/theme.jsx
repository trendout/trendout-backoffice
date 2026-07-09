import React from "react";

export const T = {
  bg: "#0f1210",
  bgRaised: "#171b18",
  bgRaised2: "#1c211d",
  border: "#262b26",
  text: "#eef0ec",
  muted: "#8a9089",
  accent: "#c9ff3f",
  accentDim: "#7c9a2e",
  danger: "#ff6b5e",
  warn: "#ffb44d",
};

export const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 13.5,
  background: T.bg,
  border: `1px solid ${T.border}`,
  color: T.text,
  outline: "none",
  boxSizing: "border-box",
};

export function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 600, letterSpacing: 0.3 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

export function Button({ children, onClick, variant = "primary", style, ...rest }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center",
    padding: "10px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
    border: "1px solid transparent", cursor: "pointer", transition: "opacity .15s",
  };
  const variants = {
    primary: { background: T.accent, color: "#0f1210" },
    ghost: { background: "transparent", color: T.text, border: `1px solid ${T.border}` },
    danger: { background: "transparent", color: T.danger, border: `1px solid ${T.danger}55` },
  };
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.85)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
