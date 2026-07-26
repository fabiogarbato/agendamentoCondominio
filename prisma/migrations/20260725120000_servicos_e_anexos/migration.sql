-- CreateTable
CREATE TABLE "servicos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "anexos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeArquivo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "conteudo" BLOB NOT NULL,
    "orcamentoId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "anexos_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Backfill de dados: cria um Serviço por descrição distinta (case-insensitive)
-- dos orçamentos existentes, para NÃO comparar entre si serviços diferentes que
-- antes caíam no mesmo balde de categoria. Em banco novo (deploy limpo) não há
-- orçamentos, então este INSERT simplesmente não insere nada.
INSERT INTO "servicos" ("nome", "criadoEm", "atualizadoEm")
SELECT TRIM("descricao"), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "orcamentos"
WHERE TRIM(COALESCE("descricao", '')) <> ''
GROUP BY LOWER(TRIM("descricao"));

-- RedefineTable: orcamentos ganha servicoId (FK NOT NULL) e descricao vira
-- opcional. Padrão de "table rebuild" do SQLite (Prisma faz igual).
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_orcamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT,
    "valorCentavos" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "validadeAte" TEXT,
    "observacoes" TEXT,
    "servicoId" INTEGER NOT NULL,
    "prestadorId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "orcamentos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orcamentos_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "prestadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_orcamentos" ("id", "descricao", "valorCentavos", "status", "validadeAte", "observacoes", "servicoId", "prestadorId", "criadoEm", "atualizadoEm")
SELECT
    "o"."id",
    "o"."descricao",
    "o"."valorCentavos",
    "o"."status",
    "o"."validadeAte",
    "o"."observacoes",
    (SELECT "s"."id" FROM "servicos" "s" WHERE LOWER(TRIM("s"."nome")) = LOWER(TRIM("o"."descricao")) LIMIT 1),
    "o"."prestadorId",
    "o"."criadoEm",
    "o"."atualizadoEm"
FROM "orcamentos" "o";

DROP TABLE "orcamentos";
ALTER TABLE "new_orcamentos" RENAME TO "orcamentos";
CREATE INDEX "orcamentos_prestadorId_idx" ON "orcamentos"("prestadorId");
CREATE INDEX "orcamentos_status_idx" ON "orcamentos"("status");
CREATE INDEX "orcamentos_servicoId_idx" ON "orcamentos"("servicoId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "servicos_nome_idx" ON "servicos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "anexos_orcamentoId_key" ON "anexos"("orcamentoId");
