-- CreateTable
CREATE TABLE "orcamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "validadeAte" TEXT,
    "observacoes" TEXT,
    "prestadorId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "orcamentos_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "prestadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "orcamentos_prestadorId_idx" ON "orcamentos"("prestadorId");

-- CreateIndex
CREATE INDEX "orcamentos_status_idx" ON "orcamentos"("status");
