# Imagem de produção do app "Agenda de Prestadores" (Next.js 16 + Prisma 7 + SQLite).
FROM node:22-slim

WORKDIR /app

# DATABASE_URL precisa existir já no build: o `prisma generate` carrega o
# prisma.config.ts, que resolve env("DATABASE_URL"). É o mesmo valor usado em
# runtime (o compose reafirma). O banco só é criado/migrado quando o container
# sobe (prisma migrate deploy no CMD), então definir aqui não toca em disco.
ENV DATABASE_URL="file:/app/data/prod.db"

# openssl é necessário para o Prisma; ca-certificates para TLS de saída.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Instala dependências (inclui devDeps: precisamos de tsc/tailwind/prisma no build).
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código e builda.
COPY . .
RUN npx prisma generate && npm run build

# Diretório do banco SQLite (montado como volume no compose para persistir dados).
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Aplica as migrations no banco do volume e sobe o Next em produção.
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p 3000 -H 0.0.0.0"]
