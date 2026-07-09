"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ToastContainer } from "react-toastify";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // resolvedTheme é undefined no SSR/primeiro render; montar depois evita
  // hydration mismatch no container.
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <ToastContainer
      position="top-center"
      autoClose={2500}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnHover
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastClassName="!rounded-xl !text-sm !font-medium !bg-card !text-foreground !border !border-border !shadow-elevated"
    />
  );
}
