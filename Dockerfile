FROM node:20-bullseye

ENV PATH="/opt/venv/bin:"

RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip \
    && /opt/venv/bin/pip install yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p downloads

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]