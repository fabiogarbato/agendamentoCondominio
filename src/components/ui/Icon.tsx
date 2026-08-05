import type { ReactNode } from "react";

const PATHS: Record<string, ReactNode> = {
  /* ---- navegação ---- */
  inicio: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18" />
      <path d="M8 3v3" />
      <path d="M16 3v3" />
    </>
  ),
  prestadores: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
    </>
  ),
  historico: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.2" />
      <path d="M3.5 4v4.2h4.2" />
      <path d="M12 8v4l2.8 1.7" />
    </>
  ),
  orcamentos: (
    <>
      <path d="M12.6 2.6A2 2 0 0 0 11.2 2H4.5A1.5 1.5 0 0 0 3 3.5v6.7a2 2 0 0 0 .6 1.4l8.7 8.7a2 2 0 0 0 2.8 0l6.3-6.3a2 2 0 0 0 0-2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </>
  ),

  /* ---- toggle de tema ---- */
  sol: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.2M12 19.8V22M4.5 4.5l1.6 1.6M17.9 17.9l1.6 1.6M2 12h2.2M19.8 12H22M4.5 19.5l1.6-1.6M17.9 6.1l1.6-1.6" />
    </>
  ),
  lua: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />,

  /* ---- ações ---- */
  check: <path d="M20 6 9 17l-5-5" />,
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </>
  ),
  lapis: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  lixeira: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </>
  ),
  // Traçado, não o logo sólido: o <svg> abaixo é fill="none" stroke="currentColor",
  // então um path preenchido sairia invisível. Balão + fone dentro.
  whatsapp: (
    <>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M9.2 8.8c.35-.35.9-.3 1.15.12l.75 1.25c.2.33.14.75-.14 1.02l-.42.4c-.16.16-.2.4-.1.6.45.9 1.18 1.63 2.08 2.08.2.1.44.06.6-.1l.4-.42c.27-.28.69-.34 1.02-.14l1.25.75c.42.25.47.8.12 1.15l-.5.5c-.4.4-1 .55-1.53.36a8.4 8.4 0 0 1-5.1-5.1c-.19-.53-.04-1.13.36-1.53z" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  "chevron-left": <path d="m15 18-6-6 6-6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
};

export function Icon({ name, className = "size-6" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
