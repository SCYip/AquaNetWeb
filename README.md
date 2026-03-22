# AquaNet - Ocean Monitoring System

浮标海洋监测系统 / Ocean Buoy Monitoring System

## 项目结构 / Project Structure

```
AquaNet/
├── frontend/           # React 前端应用
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/           # Node.js 后端 API
│   ├── src/
│   └── package.json
│
├── docker-compose.yml # 本地开发环境 (可选)
└── README.md
```

## 快速开始 / Quick Start

### 前置要求 / Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 安装 / Installation

```bash
# 克隆仓库
git clone <your-repo-url>
cd AquaNet

# 安装所有依赖
npm install

# 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 填入你的配置

# 启动后端
cd backend && npm run dev

# 新开终端，启动前端
cd frontend && npm run dev
```

### 环境变量 / Environment Variables

**后端 (backend/.env):**
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aquanet
JWT_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:5173

# 可选 / Optional
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_secret
ALIYUN_ACCESS_KEY_ID=your_aliyun_key
ALIYUN_ACCESS_KEY_SECRET=your_aliyun_secret
```

**前端 (frontend/.env):**
```env
VITE_API_URL=http://localhost:3000/api
```

## 功能 / Features

- 用户认证 (邮箱/手机/微信)
- 浮标数据可视化
- 实时传感器数据
- 历史数据查询

## 技术栈 / Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** MySQL
- **Deployment:** PM2 + Nginx

## API 端点 / API Endpoints

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 邮箱注册 |
| POST | /api/auth/login | 邮箱登录 |
| POST | /api/auth/phone/send-code | 发送手机验证码 |
| POST | /api/auth/phone/verify | 手机验证码登录 |
| POST | /api/auth/wechat | 微信登录 |
| GET | /api/auth/profile | 获取用户信息 |
| GET | /api/buoys | 获取浮标列表 |
| GET | /api/buoys/:id | 获取浮标详情 |
| POST | /api/buoys | 创建浮标 |
| PUT | /api/buoys/:id | 更新浮标 |
| DELETE | /api/buoys/:id | 删除浮标 |
| GET | /api/telemetry/:buoyId | 获取传感器数据 |

## 许可证 / License

MIT
