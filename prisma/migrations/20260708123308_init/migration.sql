-- CreateTable
CREATE TABLE "prestadores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "categoriaOutro" TEXT,
    "telefone" TEXT NOT NULL,
    "empresa" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGENDADO',
    "motivo" TEXT NOT NULL,
    "observacoes" TEXT,
    "prestadorId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "agendamentos_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "prestadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "prestadores_categoria_idx" ON "prestadores"("categoria");

-- CreateIndex
CREATE INDEX "prestadores_nome_idx" ON "prestadores"("nome");

-- CreateIndex
CREATE INDEX "prestadores_ativo_idx" ON "prestadores"("ativo");

-- CreateIndex
CREATE INDEX "agendamentos_data_idx" ON "agendamentos"("data");

-- CreateIndex
CREATE INDEX "agendamentos_data_horario_idx" ON "agendamentos"("data", "horario");

-- CreateIndex
CREATE INDEX "agendamentos_status_idx" ON "agendamentos"("status");

-- CreateIndex
CREATE INDEX "agendamentos_status_data_idx" ON "agendamentos"("status", "data");

-- CreateIndex
CREATE INDEX "agendamentos_prestadorId_idx" ON "agendamentos"("prestadorId");
