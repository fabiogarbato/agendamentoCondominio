import { Icon } from "@/components/ui/Icon";

export function EmptyState({
  titulo,
  descricao,
  icone = "calendario",
}: {
  titulo: string;
  descricao?: string;
  icone?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
      <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name={icone} className="size-6" />
      </span>
      <p className="font-semibold text-foreground">{titulo}</p>
      {descricao ? <p className="max-w-xs text-sm text-muted">{descricao}</p> : null}
    </div>
  );
}
