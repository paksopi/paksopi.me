---
date: '2026-07-19'
title: 'Personal Homelab Infrastructure'
github: ''
external: 'https://paksopi.me'
tech:
  - Docker Compose
  - Cloudflare Tunnel
  - n8n
  - Linux
showInProjects: true
---

Repurposed an old laptop into an always-on, containerized homelab: an AI agent (Hermes) running as a persistent service with Telegram integration and Docker-sandboxed command execution, a Cloudflare Tunnel + Access setup exposing this site with zero inbound ports opened, and GNOME Remote Desktop reachable both over LAN and externally through the same tunnel. Every service runs in its own Docker Compose stack with explicit memory/CPU limits, since the whole box runs on ~5.7GB of RAM.
