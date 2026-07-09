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
        <ThemeToggle />
      </div>
    </header>
  );
}
