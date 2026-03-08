# ────────────────────────────────────────────────────────────────────────────
# Zylos — Official Dockerfile
#
# Build:  docker build -t zylos .
# Run:    docker compose up -d   (see docker-compose.yml)
#
# This image installs Zylos and its dependencies, then starts all PM2-managed
# services (scheduler, web-console, c4-dispatcher, activity-monitor, channels).
# The AI loop (Claude Code) runs inside a persistent tmux session so it can
# receive heartbeat / message commands through the c4-dispatcher bridge.
# ────────────────────────────────────────────────────────────────────────────

FROM node:24-slim

LABEL org.opencontainers.image.source="https://github.com/zylos-ai/zylos-core"
LABEL org.opencontainers.image.description="Zylos — autonomous AI agent infrastructure"

# ── System packages ───────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
      git \
      curl \
      tmux \
      bash \
      ca-certificates \
      # Needed by some Claude Code operations
      procps \
      # For `zylos doctor` network checks
      dnsutils \
    && rm -rf /var/lib/apt/lists/*

# ── Global npm tools ──────────────────────────────────────────────────────────
RUN npm install -g pm2@latest

# ── Install Claude Code CLI ───────────────────────────────────────────────────
# Installs to ~/.local/bin/claude (Node.js-based CLI)
RUN npm install -g @anthropic-ai/claude-code

# ── Create zylos user (non-root) ──────────────────────────────────────────────
RUN useradd -m -s /bin/bash zylos
USER zylos
ENV HOME=/home/zylos

# ── Install zylos-core ────────────────────────────────────────────────────────
WORKDIR /home/zylos
RUN npm install -g zylos

# ── Workspace directories ─────────────────────────────────────────────────────
# These directories will be mounted as volumes in docker-compose.yml.
# Creating them here ensures correct ownership in the image.
RUN mkdir -p \
      /home/zylos/zylos/memory \
      /home/zylos/zylos/workspace \
      /home/zylos/zylos/logs \
      /home/zylos/zylos/pm2 \
      /home/zylos/zylos/http \
      /home/zylos/zylos/bin \
      /home/zylos/.claude

# ── Copy PM2 ecosystem config ─────────────────────────────────────────────────
COPY --chown=zylos:zylos templates/pm2/ecosystem.config.cjs /home/zylos/zylos/pm2/ecosystem.config.cjs

# ── Copy entrypoint ───────────────────────────────────────────────────────────
COPY --chown=zylos:zylos docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# ── Ports ─────────────────────────────────────────────────────────────────────
# Web console (web-console service, default 3456)
EXPOSE 3456
# Caddy / reverse proxy (optional, enabled via .env)
EXPOSE 8080

# ── Healthcheck ───────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD pm2 list 2>/dev/null | grep -q "online" || exit 1

ENTRYPOINT ["/entrypoint.sh"]
