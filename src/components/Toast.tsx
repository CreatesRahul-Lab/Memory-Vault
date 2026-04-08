"use client";

import { useEffect, useState, useCallback } from "react";

interface ToastMessage {
  text: string;
  type: "success" | "error" | "";
}

let showToastFn: ((text: string, type?: "success" | "error" | "") => void) | null = null;

export function showToast(text: string, type: "success" | "error" | "" = "") {
  if (showToastFn) showToastFn(text, type);
}

export default function Toast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [visible, setVisible] = useState(false);

  const show = useCallback((text: string, type: "success" | "error" | "" = "") => {
    setToast({ text, type });
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  }, []);

  useEffect(() => {
    showToastFn = show;
    return () => {
      showToastFn = null;
    };
  }, [show]);

  return (
    <div className={`toast ${visible ? "visible" : ""} ${toast?.type || ""}`}>
      {toast?.text}
    </div>
  );
}
