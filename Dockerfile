FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
# Aumenta memória disponível para o build do Next.js
ENV NODE_OPTIONS=--max-old-space-size=4096

# Instala dependências do sistema: ffmpeg, Node.js 20, python + yt-dlp
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    python3 \
    python3-pip \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --upgrade "yt-dlp[default]"
RUN yt-dlp --update-to nightly 2>/dev/null || pip3 install -U "yt-dlp[default]"

ENV YT_DLP_NO_UPDATE=1

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

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", ".next/standalone/server.js"]