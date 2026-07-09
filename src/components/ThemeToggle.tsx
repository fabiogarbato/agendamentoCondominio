"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Icon } from "@/components/ui/Icon";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Antes de montar (SSR e primeiro render no cliente) resolvedTheme é
  // desconhecido; manter isDark=false nesse instante garante que o markup do
  // servidor e o primeiro render do cliente batam (sem hydration mismatch).
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted shadow-card transition-colors hover:bg-surface hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {!mounted ? (
        <span className="size-5" />
      ) : isDark ? (
        <Icon name="sol" className="size-5" />
      ) : (
        <Icon name="lua" className="size-5" />
      )}
    </button>
  );
}
