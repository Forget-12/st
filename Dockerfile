# ─────────────────────────────────────────────
# Base image
# ─────────────────────────────────────────────
FROM node:20-bookworm-slim

# ─────────────────────────────────────────────
# Google Chrome stable + Xvfb (Virtual Screen)
# ─────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    gnupg \
    fonts-liberation \
    fonts-noto-color-emoji \
    xvfb \
    libxtst6 \
    libxi6 \
    libxss1 \
  && wget -q -O /tmp/chrome.deb \
       https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
  && apt-get install -y --no-install-recommends /tmp/chrome.deb \
  && rm /tmp/chrome.deb \
  && rm -rf /var/lib/apt/lists/*

# ─────────────────────────────────────────────
# Environment
# ─────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=3000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm i

COPY . .

RUN groupadd -r app && useradd -r -g app app \
  && chown -R app:app /app
USER app

EXPOSE 3000

# PERHATIKAN BARIS INI: Kita bungkus pakai xvfb-run
CMD ["xvfb-run", "-a", "-s", "-screen 0 1280x720x24", "node", "index.js"]
