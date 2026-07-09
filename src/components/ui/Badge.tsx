const CORES: Record<string, string> = {
  azul: "bg-agendado-bg text-agendado-fg",
  verde: "bg-concluido-bg text-concluido-fg",
  cinza: "bg-cancelado-bg text-cancelado-fg",
};

const DOT: Record<string, string> = {
  azul: "bg-agendado",
  verde: "bg-concluido",
  cinza: "bg-cancelado",
};

export function Badge({ cor, children }: { cor: keyof typeof CORES; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${CORES[cor]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[cor]}`} />
      {children}
    </span>
  );
}
