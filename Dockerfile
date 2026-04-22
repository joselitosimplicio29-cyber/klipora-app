FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
# Aumenta memória disponível para o build do Next.js
ENV NODE_OPTIONS=--max-old-space-size=4096

# Instala dependências do sistema: ffmpeg, Node.js 20, python + yt-dlp
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*


# yt-dlp removido — YouTube não é mais suportado no Klipora


WORKDIR /app

# Copia apenas package.json primeiro para aproveitar cache do Docker
COPY package*.json ./
RUN npm ci

# Copia o restante do código (node_modules e .next são ignorados pelo .dockerignore)
COPY . .

# Cria pasta de downloads temporários
RUN mkdir -p downloads

# Faz o build de produção
RUN npm run build

# Copia os arquivos estáticos para dentro do standalone (exigido pelo output: 'standalone')
RUN cp -r public .next/standalone/public \
    && cp -r .next/static .next/standalone/.next/static

# Copia cookies.txt e cria pasta downloads dentro do standalone
# (process.cwd() no servidor standalone aponta para .next/standalone)
RUN cp cookies.txt .next/standalone/cookies.txt 2>/dev/null || true \
    && mkdir -p .next/standalone/downloads

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", ".next/standalone/server.js"]