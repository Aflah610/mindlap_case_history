# Mindlap Case History EMR - Production Deployment Guide (AWS EC2 Ubuntu)

This guide provides step-by-step instructions for deploying the **Mindlap Case History & Clinical EMR Application** to an AWS EC2 instance running Ubuntu 22.04 LTS using **Nginx**, **Gunicorn**, **PostgreSQL**, and **React Production Build**.

---

## 📋 1. Required Environment Variables

Create a `/var/www/mindlap/backend/.env` file with the following variables:

| Variable | Description | Recommended Production Value |
| :--- | :--- | :--- |
| `DEBUG` | Enables or disables Django debug mode | `False` |
| `SECRET_KEY` | Django cryptographic signing key | Generate via `openssl rand -hex 32` |
| `ALLOWED_HOSTS` | Comma-separated list of domain names/IPs | `yourdomain.com,api.yourdomain.com,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Permitted frontend origins | `https://yourdomain.com,https://www.yourdomain.com` |
| `DB_ENGINE` | Database backend engine | `django.db.backends.postgresql` |
| `DB_NAME` | PostgreSQL database name | `mindlap_db` |
| `DB_USER` | PostgreSQL user | `mindlap_user` |
| `DB_PASSWORD` | PostgreSQL user password | Secure generated password |
| `DB_HOST` | Database host | `127.0.0.1` (or RDS Endpoint URI) |
| `DB_PORT` | Database port | `5432` |
| `SECURE_SSL_REDIRECT` | Enforces HTTPS redirection | `True` |

---

## 🚀 2. EC2 Server Provisioning & Initial Setup

### Step 2.1: Update System Packages & Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib nginx git curl
```

### Step 2.2: Setup PostgreSQL Database
```bash
sudo -u postgres psql -c "CREATE DATABASE mindlap_db;"
sudo -u postgres psql -c "CREATE USER mindlap_user WITH PASSWORD 'YOUR_STRONG_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mindlap_db TO mindlap_user;"
sudo -u postgres psql -d mindlap_db -c "GRANT ALL ON SCHEMA public TO mindlap_user;"
```

---

## 🛠️ 3. Backend Deployment (Django + Gunicorn)

### Step 3.1: Clone & Setup Codebase
```bash
sudo mkdir -p /var/www/mindlap
sudo chown -R ubuntu:www-data /var/www/mindlap
git clone <YOUR_GIT_REPO_URL> /var/www/mindlap
```

### Step 3.2: Configure Python Virtual Environment
```bash
cd /var/www/mindlap/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3.3: Configure Production `.env`
Create `/var/www/mindlap/backend/.env`:
```ini
DEBUG=False
SECRET_KEY=y0ur-5ecure-pr0ducti0n-key-here-change-this!
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,127.0.0.1
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DB_ENGINE=django.db.backends.postgresql
DB_NAME=mindlap_db
DB_USER=mindlap_user
DB_PASSWORD=YOUR_STRONG_PASSWORD
DB_HOST=127.0.0.1
DB_PORT=5432
SECURE_SSL_REDIRECT=True
```

### Step 3.4: Apply Migrations & Collect Static Files
```bash
python manage.py migrate
python manage.py seed_data # Initial demo data
python manage.py collectstatic --noinput
```

### Step 3.5: Configure Gunicorn Systemd Service
Create `/etc/systemd/system/gunicorn.service`:
```ini
[Unit]
Description=Gunicorn daemon for Mindlap EMR Backend
After=network.target postgresql.service

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/mindlap/backend
EnvironmentFile=/var/www/mindlap/backend/.env
ExecStart=/var/www/mindlap/backend/venv/bin/gunicorn \
          --access-logfile /var/log/gunicorn/access.log \
          --error-logfile /var/log/gunicorn/error.log \
          --workers 3 \
          --bind 127.0.0.1:8000 \
          mindlap_backend.wsgi:application

Restart=always
RestartSec=3s

[Install]
WantedBy=multi-user.target
```

Enable and start Gunicorn:
```bash
sudo mkdir -p /var/log/gunicorn
sudo chown -R ubuntu:www-data /var/log/gunicorn
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn
sudo systemctl status gunicorn
```

---

## ⚡ 4. Frontend Deployment (React SPA Build)

### Step 4.1: Install Node.js & Build Static Assets
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

cd /var/www/mindlap/frontend
npm ci
npm run build
```

---

## 🌐 5. Nginx & HTTPS SSL Configuration

### Step 5.1: Create Nginx Site File
Create `/etc/nginx/sites-available/mindlap`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 25M;

    # React Production Single Page Application
    location / {
        root /var/www/mindlap/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Django REST Framework API Requests Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Static Files
    location /static/ {
        alias /var/www/mindlap/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Uploaded Media Files
    location /media/ {
        alias /var/www/mindlap/backend/media/;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable Nginx site:
```bash
sudo ln -s /etc/nginx/sites-available/mindlap /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5.2: Install Free SSL Certificate (Certbot / Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔒 6. Security & Firewall Hardening

### Step 6.1: Configure UFW Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Step 6.2: AWS Security Group Rules
- **Port 22** (SSH): Restrict to your developer IP address.
- **Port 80** (HTTP): Open to `0.0.0.0/0`.
- **Port 443** (HTTPS): Open to `0.0.0.0/0`.
- **Port 8000 & 5432**: Block external traffic (bound to `127.0.0.1` locally).

---

## 📈 7. Scaling to AWS Managed Services (RDS, S3, CloudFront)

### Migrating Database to Amazon RDS PostgreSQL:
1. Provision PostgreSQL instance in Amazon RDS inside your VPC.
2. Update `/var/www/mindlap/backend/.env`:
   ```ini
   DB_HOST=mindlap-db.c123456789.us-east-1.rds.amazonaws.com
   DB_USER=rds_mindlap_user
   DB_PASSWORD=RDS_STRONG_PASSWORD
   ```
3. Run `python manage.py migrate`. Zero code changes required!

### Migrating Media Storage to Amazon S3:
1. Install `django-storages` and `boto3`:
   ```bash
   pip install django-storages boto3
   ```
2. Configure S3 credentials in `.env` and set `DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'`.

---

## ✅ 8. Production Verification Checklist

- [x] Gunicorn installed & systemd service enabled
- [x] PostgreSQL database initialized & migrations applied
- [x] JWT token blacklist table migrated (`token_blacklist`)
- [x] React SPA compiled to `/frontend/dist`
- [x] Nginx proxying `/api/` to Gunicorn on `127.0.0.1:8000`
- [x] `collectstatic` assets served under `/static/`
- [x] SSL certificate active via Let's Encrypt
- [x] `DEBUG=False` & `SECRET_KEY` set in `.env`
- [x] PDF reports generating in-memory cleanly
