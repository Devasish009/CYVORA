# 🌐 CYVORA Production Deployment Guide

CYVORA can be deployed online as a live public website through multiple free and cloud hosting services.

---

## Option 1: 1-Click Render.com / Railway Deployment (Unified Single Container)

Render and Railway allow hosting CYVORA as a single container serving both the **React Frontend UI** and the **FastAPI Backend API** on a single domain URL (e.g. `https://cyvora.onrender.com`).

### Deployment Steps on Render.com:
1. Push your CYVORA repository to GitHub.
2. Log in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Select **Docker** as the Runtime environment.
5. Set:
   - **Environment**: `Docker`
   - **Port**: `8000`
   - **Build Command**: (Automatically uses root `Dockerfile`)
6. Click **Deploy Web Service**!
   Render will build the React SPA, launch FastAPI, and provide your public live website URL (`https://cyvora.onrender.com`).

---

## Option 2: Separate Frontend & Backend Deployment

### Frontend (Vercel / Netlify / Render Static):
1. Import `apps/frontend` repository into [Vercel.com](https://vercel.com).
2. Set Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_API_BASE_URL` = `https://your-backend-api.onrender.com`
3. Click **Deploy**.

### Backend (Render / Railway / Fly.io):
1. Create a Python Web Service on Render or Railway.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `python -m uvicorn apps.backend.main:app --host 0.0.0.0 --port 8000`
4. Set Environment Variables:
   - `CYVORA_ALLOW_DEV_AUTH` = `true`

---

## Option 3: Local / VPS Docker Compose Deployment

If you own an AWS, DigitalOcean, or Hetzner VPS:

```bash
# 1. Build and launch all services in detached mode
docker-compose up -d --build

# 2. Access your website in browser
http://YOUR_SERVER_IP:8000
```
