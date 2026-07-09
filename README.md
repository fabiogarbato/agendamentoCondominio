# Agenda de Prestadores

App pessoal para organizar a agenda de prestadores de serviço que visitam o apartamento (eletricista, encanador, faxineira, técnico de ar-condicionado, entregador etc.). Uso individual, sem login, banco de dados local (SQLite) — não depende de nenhum serviço externo.

## Stack

- **Front-end + back-end**: Next.js 16 (App Router, TypeScript) — páginas em Server Components e rotas de API REST em `src/app/api`.
- **Banco de dados**: SQLite (arquivo local `dev.db`), acessado via Prisma ORM 7 com o driver adapter `@prisma/adapter-libsql` (evita a necessidade de compilar módulos nativos com Visual Studio no Windows).
- **Estilo**: Tailwind CSS v4.

## Como rodar

Pré-requisitos: Node.js **20.19 ou mais recente** (ou 22.12+/24+).

```bash
npm install
npx prisma migrate deploy   # cria o banco local (dev.db) e aplica as migrations
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador (ou no celular, pela rede local).

Se a porta 3000 já estiver em uso, o Next.js sobe automaticamente em outra porta (veja o terminal).

## Funcionalidades

- **Início**: próximos agendamentos (hoje, esta semana, mais adiante), com ações rápidas para marcar como concluído/cancelado.
- **Calendário**: visão mensal com navegação entre meses e lista dos agendamentos do mês.
- **Prestadores**: cadastro (nome, categoria, telefone, empresa, observações), edição, desativação (soft delete — some dos seletores de novo agendamento mas mantém o histórico) e exclusão definitiva (só permitida se o prestador nunca teve agendamento).
- **Histórico**: agendamentos passados/concluídos/cancelados, com filtro por status e período.

## Notas técnicas

- O banco (`dev.db`) fica na raiz do projeto e é ignorado pelo Git (`.gitignore`) — nunca é commitado.
- Datas de agendamento são guardadas como texto `"YYYY-MM-DD"`/`"HH:mm"` (não como `DateTime`), para evitar bugs de fuso horário no calendário.
- Um prestador com agendamentos vinculados não pode ser excluído (só desativado), para nunca perder o histórico.
- Comandos úteis do Prisma:
  - `npx prisma studio` — interface visual para ver/editar os dados do banco.
  - `npx prisma migrate dev --name <nome>` — criar uma nova migration depois de alterar `prisma/schema.prisma`.
  - Pare o `npm run dev` antes de rodar comandos de migration (o Windows pode travar o arquivo do client gerado se os dois rodarem ao mesmo tempo).
