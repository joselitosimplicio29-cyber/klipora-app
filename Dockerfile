FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip python3-venv curl && python3 -m venv /opt/venv && /opt/venv/bin/pip install --upgrade pip && /opt/venv/bin/pip install yt-dlp && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/opt/venv/bin:"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p downloads

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]