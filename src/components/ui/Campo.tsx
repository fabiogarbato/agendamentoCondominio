import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Icon } from "@/components/ui/Icon";

const CAMPO_BASE =
  "w-full rounded-xl border border-border-strong bg-card text-foreground placeholder:text-muted px-3 min-h-11 text-base transition-colors disabled:opacity-50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

function Wrapper({ label, erro, children }: { label: string; erro?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {erro ? <span className="text-sm text-danger">{erro}</span> : null}
    </label>
  );
}

export function CampoTexto({
  label,
  erro,
  className = "",
  ...props
}: { label: string; erro?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper label={label} erro={erro}>
      <input className={`${CAMPO_BASE} ${className}`} {...props} />
    </Wrapper>
  );
}

export function CampoArea({
  label,
  erro,
  className = "",
  ...props
}: { label: string; erro?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrapper label={label} erro={erro}>
      <textarea className={`${CAMPO_BASE} py-2 min-h-24 ${className}`} {...props} />
    </Wrapper>
  );
}

export function CampoSelect({
  label,
  erro,
  className = "",
  children,
  ...props
}: { label: string; erro?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrapper label={label} erro={erro}>
      <div className="relative">
        <select className={`${CAMPO_BASE} appearance-none pr-9 ${className}`} {...props}>
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
          <Icon name="chevron-down" className="size-4" />
        </span>
      </div>
    </Wrapper>
  );
}
