import { ThemeToggle } from "@/components/ThemeToggle";

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
      <div className="flex items-center gap-2">
        {action}
        {/* No desktop o toggle vive no rodapé da SideNav: é um controle global
            do app, não da página, e assim ele passa a existir também nas 6
            telas de formulário, que não usam PageHeader e hoje ficam sem ele. */}
        <ThemeToggle className="lg:hidden" />
      </div>
    </header>
  );
}
