---
title: Mrbike Backend
emoji: 🏍️
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# MrBikeBD Backend

Deployment of the Django backend for MrBikeBD ecosystem on Hugging Face Spaces.

## 🚀 Deployment Info
- **SDK**: Docker
- **Port**: 7860 (exposed via Gunicorn)
- **Framework**: Django
- **Sync**: Auto-synced from GitHub Actions

## 🛠 Configuration
Environment variables must be set in the Space Settings:
- `DATABASE_URL` (PostgreSQL)
- `SECRET_KEY`
- `REDIS_URL`
- `CLOUDINARY_URL`
- `SUPER_ADMIN_EMAIL`
