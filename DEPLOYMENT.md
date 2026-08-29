# GoWider — Production Deployment & Operations Guide

## 1. Production Architecture Overview

GoWider follows a **disposable VPS** architecture where compute and temporary queue state reside on a single server, while all authoritative data and media assets reside in external managed services:

```text
                          Internet
                             │
                             ▼
                       Caddy / Nginx
                      (HTTPS 80 / 443)
                             │
                             ▼
                   ┌──────────────────┐
                   │   GoWider VPS    │
                   │                  │
                   │ Docker Compose   │
                   │  - web (:3000)   │
                   │  - worker        │
                   │  - redis         │
                   └────────┬─────────┘
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
       Managed Postgres     R2           Sarvam
       (Neon/RDS/etc.)    Storage         API
```

- **Web Application (`gowider-web`):** Next.js 15 serving web routes and authenticated APIs. Bound to `127.0.0.1:3000`. Only holds auth and billing credentials; no access to `SARVAM_API_KEY`.
- **Worker Process (`gowider-worker`):** Node.js daemon orchestrating Sarvam AI dubbing and Razorpay webhooks via BullMQ. Only holds AI and reconciliation credentials; no access to `AUTH_SECRET` or Google OAuth credentials.
- **Queue Service (`gowider-redis`):** Redis 7 with AOF persistence on internal Docker network with healthcheck. **Disposable & reconstructable from PostgreSQL.**
- **Managed PostgreSQL (External):** Authoritative business truth (users, projects, generation runs, wallets, ledger).
- **Cloudflare R2 (External):** Private storage for source videos, dubbed MP4s, and SRT subtitles.

---

## 2. Server Requirements & VPS Sizing

- **Operating System:** Ubuntu 22.04 LTS or 24.04 LTS
- **Recommended Sizing:** 2 vCPUs, 4 GB RAM, 20 GB SSD
- **Firewall / Security Group:**
  - Inbound: Port `80` (HTTP), Port `443` (HTTPS), Port `22` (SSH)
  - **Do NOT open ports 3000, 5432, or 6379 to the public internet.**

---

## 3. Initial Server Setup & Deployment

### Step 1: Install Docker & Docker Compose
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw

# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker \$USER
newgrp docker
```

### Step 2: Prepare Application Directory
```bash
sudo mkdir -p /opt/gowider
sudo chown \$USER:\$USER /opt/gowider
cd /opt/gowider

git clone https://github.com/your-org/gowider.git .
```

### Step 3: Configure Production Environment (`.env`)
Create `/opt/gowider/.env` and secure permissions:
```bash
cat << ENVFILE > /opt/gowider/.env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://gowider.in

# 1. Authoritative Managed PostgreSQL (Neon, AWS RDS, Supabase, etc.)
DATABASE_URL=postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require

# 2. Redis Queue (Internal Docker Compose Service)
REDIS_URL=redis://redis:6379
GENERATION_WORKER_CONCURRENCY=3

# 3. Cloudflare R2 Remote Storage
STORAGE_DRIVER=r2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=gowider-production-media

# 4. Authentication (Web Container)
AUTH_SECRET=your_32_character_random_hex_secret
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 5. AI Voice Localization Provider (Worker Container)
SARVAM_API_KEY=your_sarvam_production_api_key

# 6. Payments
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
ENVFILE

chmod 600 /opt/gowider/.env
```

### Step 4: Execute Database Versioned Migrations
Run versioned database migrations against the managed PostgreSQL database before starting containers:
```bash
npm run db:migrate
```

### Step 5: Build and Start Production Containers
```bash
# Build multi-stage Docker image and start services in background
docker compose -f docker-compose.prod.yml up -d --build

# Verify container status and health
docker compose -f docker-compose.prod.yml ps
```

---

## 4. Reverse Proxy & HTTPS Configuration

### Option A: Caddy (Recommended — Automatic HTTPS)
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# Configure /etc/caddy/Caddyfile
sudo cat << 'EOF' > /etc/caddy/Caddyfile
gowider.in {
    reverse_proxy 127.0.0.1:3000
}
EOF

sudo systemctl restart caddy
```

---

## 5. Health Checks & Monitoring

GoWider provides a hardened health check endpoint at `/api/health`:
```bash
curl http://127.0.0.1:3000/api/health
```
**Response (200 OK):**
```json
{
  "status": "ok"
}
```

Check live container logs:
```bash
# Web application logs
docker compose -f docker-compose.prod.yml logs -f web

# Background worker & reconciliation logs
docker compose -f docker-compose.prod.yml logs -f worker
```

---

## 6. Zero-Data-Loss Server Migration & Disaster Recovery

Because PostgreSQL (business data) and R2 (media) are external managed services, **the VPS server itself is 100% disposable**:

```text
[ VPS Failure / Migration Triggered ]
               │
               ▼
1. Provision new VPS instance
2. Install Docker Engine
3. Clone repository into /opt/gowider
4. Copy production .env (pointing to same Managed PostgreSQL & R2)
5. Run: npm run db:migrate
6. Run: docker compose -f docker-compose.prod.yml up -d --build
               │
               ▼
[ Automatic State Recovery ]
- Worker starts and runs maintenance heartbeat.
- Maintenance worker scans PostgreSQL for any interrupted runs or pending webhooks.
- Unfinished jobs are automatically re-enqueued into Redis without duplicate charges or provider jobs.
- Service is restored immediately with 0 data loss.
```

---

## 7. Ongoing Updates & Deployments

```bash
cd /opt/gowider
git pull origin main
npm run db:migrate
docker compose -f docker-compose.prod.yml up -d --build
```
