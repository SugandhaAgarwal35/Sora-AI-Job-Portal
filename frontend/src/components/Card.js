import React from "react";

export default function Card({ children, className = "", style }) {
  return (
    <div className={`sora-card ${className}`} style={style}>
      {children}
    </div>
  );
}
