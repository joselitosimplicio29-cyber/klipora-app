FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    python3 \
    python3-pip \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && pip3 install yt-dlp \
    && yt-dlp --update

ENV PATH="/usr/bin:$PATH"
ENV YT_DLP_NO_UPDATE=1

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN mkdir -p downloads
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]