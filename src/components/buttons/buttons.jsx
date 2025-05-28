import React from "react";

export function Button({ children, variant = "default", className = "", ...props }) {
  const base = "px-4 py-2 rounded font-semibold transition-colors ";
  const styles = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border border-indigo-600 text-indigo-600 hover:bg-indigo-100",
  };

  return (
    <button className={`${base}${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
