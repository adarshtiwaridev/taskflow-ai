# TaskFlow AI — Production Deployment Guide

This guide details the steps to deploy **TaskFlow AI** to production:
* **Frontend:** Vercel (Edge CDN) — **Live at:** [https://taskflow-ai-murex.vercel.app](https://taskflow-ai-murex.vercel.app)
* **Backend:** Render (Free Managed Cloud) OR AWS EC2 with Docker
* **Database & Cache:** PostgreSQL (Prisma ORM) & Redis

---

## 1. Frontend Deployment (Vercel)

The React SPA is live at **https://taskflow-ai-murex.vercel.app**.

To link it with your live backend once deployed:
1. Open your project in the [Vercel Dashboard](https://vercel.com).
2. Go to **Settings** &rarr; **Environment Variables**.
3. Set:
   * `VITE_API_URL`: Your backend URL (e.g., `https://taskflow-api.onrender.com`)
   * `VITE_WS_URL`: Your backend URL (e.g., `https://taskflow-api.onrender.com`)
4. Go to **Deployments** &rarr; click `...` &rarr; **Redeploy**.

---

## 2. Backend Deployment on Render (Recommended)

Render provides free persistent WebSockets and managed PostgreSQL out of the box.

### Option A: 1-Click Blueprint (Fastest)

1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Click **New +** &rarr; **Blueprint**.
3. Connect your repository: `adarshtiwaridev/Taskflow-Ai`.
4. Render will read the included `render.yaml` and automatically configure:
   * **Web Service:** `taskflow-api` (Node.js Express + Socket.io server)
   * **Database:** `taskflow-db` (PostgreSQL 16)
   * **Environment Variables:** `DATABASE_URL`, `WEB_URL`, `CORS_ORIGIN`, `JWT_SECRET`.
5. Click **Apply**.
6. Render will provision your database, build the code, and launch your API with a free HTTPS URL like:
   `https://taskflow-api-xxxx.onrender.com`

---

### Option B: Manual Web Service Setup on Render

If you prefer to configure manually:

1. **Create the Database:**
   * In Render, click **New +** &rarr; **PostgreSQL**.
   * Name: `taskflow-db`, Database: `taskflow`, User: `taskflow`.
   * Click **Create Database** and copy the **Internal Database URL**.

2. **Create the Web Service:**
   * Click **New +** &rarr; **Web Service**.
   * Select `adarshtiwaridev/Taskflow-Ai`.
   * **Name:** `taskflow-api`
   * **Region:** Same as database (e.g., Oregon or Frankfurt).
   * **Runtime:** `Node`
   * **Build Command:**
     ```bash
     npm install && npx prisma generate --schema=apps/api/prisma/schema.prisma && npm run build --workspace=@taskflow/shared && npm run build --workspace=@taskflow/api
     ```
   * **Start Command:**
     ```bash
     npm run start --workspace=@taskflow/api
     ```
   * **Plan:** Free

3. **Configure Environment Variables:**
   * `NODE_ENV`: `production`
   * `PORT`: `5000`
   * `WEB_URL`: `https://taskflow-ai-murex.vercel.app`
   * `CORS_ORIGIN`: `https://taskflow-ai-murex.vercel.app`
   * `DATABASE_URL`: *(Paste the Internal Database URL from Step 1)*
   * `JWT_SECRET`: *(Click 'Generate' or enter a 32+ character random secret)*
   * `LLM_API_KEY`: *(Optional, for live OpenAI calls; otherwise heuristic engine runs)*

4. Click **Deploy Web Service**.

---

## 3. Backend Deployment on AWS EC2 (Docker Alternative)

If you prefer self-hosting on AWS EC2:

1. Launch an Ubuntu 24.04 `t3.small` or `t2.micro` EC2 instance.
2. Open ports `22`, `80`, `443`, and `5000` in your Security Group.
3. SSH into the instance:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```
4. Install Docker:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
   sudo usermod -aG docker ubuntu && newgrp docker
   ```
5. Clone and start:
   ```bash
   git clone https://github.com/adarshtiwaridev/Taskflow-Ai.git
   cd Taskflow-Ai
   cp .env.example .env
   nano .env # Set WEB_URL=https://taskflow-ai-murex.vercel.app
   docker compose up -d --build
   ```

---

## 4. Resume & Portfolio Presentation

Add these verified links to your resume under **Projects**:

* **TaskFlow AI — Real-Time Collaborative Team Board**
  * **Live Demo:** `https://taskflow-ai-murex.vercel.app`
  * **API & Health:** `https://taskflow-ai-jom0.onrender.com/api/health`
  * **GitHub:** `https://github.com/adarshtiwaridev/Taskflow-Ai`
  * **Tech Stack:** TypeScript, React 19, Express.js 5, PostgreSQL, Prisma, Redis Pub/Sub, Socket.io, Docker, Vercel, Render.
