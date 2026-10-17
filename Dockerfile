# ─────────────────────────────────────────────
# Base image
# ─────────────────────────────────────────────
FROM node:20-bookworm-slim

# ─────────────────────────────────────────────
# Google Chrome stable (bukan Chromium)
# apt akan otomatis narik semua lib yang dibutuhkan .deb-nya
# ─────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    xvfb \
    gnupg \
    fonts-liberation \
    fonts-noto-color-emoji \
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

# Arahkan Puppeteer ke Google Chrome sistem
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# ─────────────────────────────────────────────
# Install dependency Node (murni dari package.json)
# ─────────────────────────────────────────────
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm i

# ─────────────────────────────────────────────
# Copy source
# ─────────────────────────────────────────────
COPY . .

# ─────────────────────────────────────────────
# Non-root user
# ─────────────────────────────────────────────
RUN groupadd -r app && useradd -r -g app app \
  && chown -R app:app /app
USER app

EXPOSE 3000

CMD ["node", "index.js"]
