# Deployment Guide for aquanet-water.org

## 1. GoDaddy DNS Configuration

Log in to [GoDaddy DNS Management](https://dcc.godaddy.com/manage-dns) and set the following DNS records for `aquanet-water.org`:

| Type | Name | Value           | TTL    |
|------|------|-----------------|--------|
| A    | @    | 8.135.45.252    | 600    |
| A    | www  | 8.135.45.252    | 600    |

- The `@` record points `aquanet-water.org` to your server.
- The `www` record points `www.aquanet-water.org` to your server.
- Remove any existing A or CNAME records for `@` and `www` that conflict.

DNS propagation may take up to 48 hours, but typically completes within minutes to a few hours. You can check propagation status at [dnschecker.org](https://dnschecker.org/).

## 2. Server Setup (Aliyun - 8.135.45.252)

### Install Nginx config

```bash
# Copy the Nginx config to sites-available
sudo cp config/nginx/aquanet-water.org.conf /etc/nginx/sites-available/aquanet-water.org

# Enable the site
sudo ln -s /etc/nginx/sites-available/aquanet-water.org /etc/nginx/sites-enabled/

# Remove the default site if it conflicts (optional)
# sudo rm /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Build and deploy the frontend

```bash
cd /var/www/aquanet/frontend
npm run build
# The built files will be in /var/www/aquanet/frontend/dist/
```

### Update backend CORS

In `backend/.env`, add the new domain to `CORS_ORIGINS`:

```env
CORS_ORIGINS=http://aquanet-water.org,http://www.aquanet-water.org,https://aquanet-water.org,https://www.aquanet-water.org
```

Then restart the backend:

```bash
pm2 restart aquanet-backend
```

## 3. SSL/HTTPS Setup (Recommended)

Install a free SSL certificate using Let's Encrypt:

```bash
# Install certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate (auto-configures Nginx)
sudo certbot --nginx -d aquanet-water.org -d www.aquanet-water.org

# Certbot will automatically:
# - Obtain the SSL certificate
# - Update the Nginx config to use HTTPS
# - Add HTTP -> HTTPS redirect

# Verify auto-renewal is set up
sudo certbot renew --dry-run
```

After SSL is set up, update `frontend/.env` to use HTTPS:

```env
VITE_API_URL=https://aquanet-water.org/api
```

Then rebuild the frontend:

```bash
cd /var/www/aquanet/frontend
npm run build
```

## 4. Verify

- Visit http://aquanet-water.org - should load the frontend
- Visit http://aquanet-water.org/api - should proxy to the backend
- After SSL: https://aquanet-water.org should work with a valid certificate
