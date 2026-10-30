# TaskFlow AI — Production Deployment Guide

This guide details the steps to deploy **TaskFlow AI** to production with a cloud-native architecture:
* **Frontend:** Vercel (Edge CDN)
* **Backend:** AWS EC2 with Docker & Nginx (Persistent Node.js + WebSocket server)
* **Database & Cache:** Managed PostgreSQL & Redis (e.g. AWS RDS/ElastiCache, Supabase, Neon, Upstash)

---

## 1. Frontend Deployment (Vercel)

The React SPA is optimized for Vercel edge deployment.

### Option A: Via Vercel Dashboard (Recommended)

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), click **Add New > Project** and select your `taskflow-ai` repository.
3. Configure the project settings:
   * **Framework Preset:** Vite
   * **Root Directory:** `./` (or `apps/web`)
   * **Build Command:** `npm run build --workspace=@taskflow/shared && npm run build --workspace=@taskflow/web`
   * **Output Directory:** `apps/web/dist`
   * **Install Command:** `npm install`
4. Add Environment Variables:
   * `VITE_API_URL`: `https://api.yourdomain.com` (or your AWS EC2 public URL, e.g., `http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com:5000`)
   * `VITE_WS_URL`: Same as `VITE_API_URL`
5. Click **Deploy**. Vercel will build the frontend and provide a production HTTPS URL (e.g., `https://taskflow-ai.vercel.app`).

### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 2. Backend Deployment (AWS EC2 with Docker)

Persistent WebSockets require a long-running process containerized on AWS EC2.

### Step 1: Launch an EC2 Instance
* **AMI:** Ubuntu Server 24.04 LTS (HVM) or Amazon Linux 2023
* **Instance Type:** `t3.small` or `t3.medium`
* **Security Group Rules:**
  * Port 22 (SSH) from your IP
  * Port 80 (HTTP) from `0.0.0.0/0`
  * Port 443 (HTTPS) from `0.0.0.0/0`
  * Port 5000 (API/WebSocket) from `0.0.0.0/0` (or restricted to your Nginx proxy)

### Step 2: Connect & Install Docker on EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker & Docker Compose
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
newgrp docker
```

### Step 3: Clone & Configure
```bash
git clone https://github.com/adarshtiwaridev/taskflow-ai.git
cd taskflow-ai

# Create production .env file
cp .env.example .env
nano .env
```
Ensure you configure:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://taskflow:your_secure_password@postgres:5432/taskflow?schema=public
REDIS_URL=redis://redis:6379
WEB_URL=https://your-vercel-app.vercel.app
CORS_ORIGIN=https://your-vercel-app.vercel.app
JWT_SECRET=super_secret_production_key_minimum_32_characters_long
LLM_API_KEY=your_openai_api_key_here
```

### Step 4: Run Database Migrations & Start Containers
```bash
# Build and run API, PostgreSQL, and Redis
docker compose up -d --build

# Run Prisma schema push / migrations
docker compose exec api npx prisma db push --schema=apps/api/prisma/schema.prisma

# Verify health status
curl http://localhost:5000/api/health
```

### Step 5: Configure Nginx & SSL (Certbot)
To enable custom domains and HTTPS for WebSocket traffic:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```
Create `/etc/nginx/sites-available/taskflow-api`:
```nginx
server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable the site and obtain SSL:
```bash
sudo ln -s /etc/nginx/sites-available/taskflow-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 3. Resume & Portfolio Presentation

Add these links to your resume under **Projects**:

* **TaskFlow AI — Real-Time Collaborative Team Board**
  * **Live Demo:** `https://your-taskflow-ai.vercel.app`
  * **API & Health:** `https://api.yourdomain.com/api/health`
  * **GitHub:** `https://github.com/adarshtiwaridev/taskflow-ai`
  * **Tech Stack:** TypeScript, React 19, Express.js 5, PostgreSQL, Prisma, Redis Pub/Sub, Socket.io, Docker, AWS EC2, Jest.

