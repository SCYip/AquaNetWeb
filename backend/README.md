# AquaNet Backend API

China-compatible Node.js backend for AquaNet water monitoring system.

## Features

- **Authentication**: Email/Password, Phone/SMS, WeChat OAuth
- **Database**: MySQL for users and buoy data
- **JWT**: Secure token-based authentication
- **CORS**: Configurable for multiple origins

## Setup

### 1. Prerequisites

- Node.js 18+
- MySQL 8.0+

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Edit `.env` file:

```env
# Server
PORT=3000

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aquanet

# JWT
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

# WeChat OAuth (for Chinese users)
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# Alibaba Cloud SMS (for phone verification)
ALIYUN_ACCESS_KEY_ID=your_access_key
ALIYUN_ACCESS_KEY_SECRET=your_secret
ALIYUN_SMS_SIGN_NAME=AquaNet
ALIYUN_SMS_TEMPLATE_CODE=SMS_xxxxxxx

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 4. Create Database

Create a MySQL database named `aquanet`:

```sql
CREATE DATABASE aquanet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Server runs on http://localhost:3000

## API Endpoints

### Health Check
```
GET /health
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email |
| POST | `/api/auth/login` | Login with email |
| POST | `/api/auth/phone/send-code` | Send SMS verification code |
| POST | `/api/auth/phone/verify` | Verify phone code & login |
| POST | `/api/auth/wechat` | WeChat login |
| GET | `/api/auth/profile` | Get user profile (auth required) |

### Buoys

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buoys` | Get all buoys |
| GET | `/api/buoys/:id` | Get buoy by ID |
| GET | `/api/buoys/my/list` | Get user's buoys (auth required) |
| POST | `/api/buoys` | Create buoy (auth required) |
| PUT | `/api/buoys/:id` | Update buoy (auth required) |
| DELETE | `/api/buoys/:id` | Delete buoy (auth required) |
| POST | `/api/buoys/:id/telemetry` | Update telemetry data (auth required) |

## API Examples

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create Buoy (Authenticated)
```bash
curl -X POST http://localhost:3000/api/buoys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Beach Station A","lat":37.7749,"lng":-122.4194}'
```

## China-Specific Setup

### WeChat OAuth
1. Register at https://open.weixin.qq.com
2. Create an application
3. Set `WECHAT_APP_ID` and `WECHAT_APP_SECRET` in `.env`

### SMS (Alibaba Cloud)
1. Register at https://www.aliyun.com
2. Enable SMS service
3. Create an SMS signature and template
4. Set credentials in `.env`

## Deployment

For production in China, consider deploying on:
- Alibaba Cloud (ECS, Container Service)
- Tencent Cloud (CVM, TKE)
- Or any VPS with MySQL support
