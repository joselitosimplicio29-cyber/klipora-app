FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20

RUN apt-get update && \
    apt-get install -y curl ffmpeg python3 python3-pip python3-venv && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/* && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install yt-dlp

ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN mkdir -p downloads
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]