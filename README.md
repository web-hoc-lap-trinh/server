# Server - Codery Platform

## ✨ Recent Updates (November 2024)

### 🏆 Online Judge System (NEW!)
- ✅ **Code Execution** - Chạy code trong Docker sandbox an toàn
- ✅ **Multi-language Support** - C, C++, Python, JavaScript, Java
- ✅ **Auto Judging** - Chấm bài tự động với BullMQ + Redis
- ✅ **Test Cases** - Hỗ trợ sample và hidden test cases
- ✅ **Tags System** - Gán tags cho problems

### 🎯 API Standardization & Advanced Exception Handling
- ✅ **Standardized API Response Format** - All endpoints return consistent JSON structure
- ✅ **Advanced Exception Handling** - Centralized error handling with custom error classes
- ✅ **Simplified Routes** - Removed `/auth` prefix from all endpoints
- ✅ **Unified Login** - Single `/api/login` endpoint for both students and admins
- ✅ **Password Change without OTP** - Change password using old password verification
- ✅ **Full TypeScript Support** - Type-safe error handling and responses

📖 **Documentation:**
- [API_GUIDE.md](./API_GUIDE.md) - Complete API guide
- [ONLINE_JUDGE_API.md](./ONLINE_JUDGE_API.md) - Online Judge API documentation

---

## 🚀 Cài Đặt và Chạy Project

### 📋 Yêu cầu hệ thống

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.0 (cho job queue)
- **Docker Desktop** (cho code execution)

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` trong thư mục project (copy từ `.env.example`):

```env
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=Codery
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key

# Redis (for BullMQ Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=secret  # Uncomment if Redis requires auth

# Cloudinary (for image upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Cài đặt và chạy Redis

**Windows (WSL hoặc Docker):**
```bash
# Option 1: Docker
docker run -d --name redis -p 6379:6379 redis

# Option 2: WSL
wsl
sudo apt update && sudo apt install redis-server
sudo service redis-server start
```

**MacOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

### 4. Pull Docker images (cho code execution)

```bash
# Pull tất cả images cần thiết
npm run docker:pull

# Hoặc pull từng image
docker pull gcc:latest
docker pull python:3.11-slim
docker pull node:20-slim
docker pull eclipse-temurin:17-jdk
```

### 5. Chạy project

```bash
# Development mode (migrations tự động chạy)
npm run dev
```

Server sẽ chạy tại: http://localhost:4000
API Docs (Swagger): http://localhost:4000/api-docs

**Lưu ý:** Database sẽ được **tự động tạo** nếu chưa tồn tại. Không cần tạo database thủ công!

## 📦 Database Migrations

Project này sử dụng **TypeORM Migrations** để quản lý database thay vì file SQL thuần.

### Ưu điểm:
- ✅ Tự động chạy khi start server
- ✅ Không chạy lại migrations đã thực thi
- ✅ Tự động chạy migrations mới nếu chưa chạy
- ✅ Dễ dàng rollback và quản lý phiên bản

### Quick Start:

```bash
# Xem trạng thái migrations
npm run migration:show

# Chạy migrations thủ công
npm run migration:run

# Tạo migration mới
npm run migration:create src/migrations/TenMigration

# Quay lại migration trước
npm run migration:revert
```

### 📖 Tài liệu chi tiết:
- [MIGRATION.md](./MIGRATION.md) - Hướng dẫn đầy đủ về migrations
- [MIGRATION_QUICKSTART.md](./MIGRATION_QUICKSTART.md) - Hướng dẫn nhanh

## 📁 Cấu Trúc Project

```
server/
├── src/
│   ├── api/                    # API routes và controllers
│   │   └── auth/              # Authentication module
│   ├── config/                # Cấu hình
│   │   ├── data-source.ts     # TypeORM DataSource
│   │   └── swagger.ts         # Swagger config
│   ├── middlewares/           # Middlewares
│   ├── migrations/            # 📦 Database migrations
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utilities
│   ├── app.ts                 # Express app
│   └── server.ts              # Server entry point
├── ormconfig.ts               # TypeORM CLI config
├── MIGRATION.md               # Migration guide
└── package.json
```

## 🔧 Scripts Có Sẵn

```bash
npm run dev              # Chạy development server
npm run build            # Build TypeScript sang JavaScript
npm start                # Chạy production server
npm run migration:run    # Chạy migrations
npm run migration:show   # Xem trạng thái migrations
npm run migration:create # Tạo migration mới
npm run migration:revert # Rollback migration
npm run docker:pull      # Pull Docker images cho code execution
```

## 📚 Thư viện sử dụng

- **Express** - Web framework
- **TypeORM** - ORM và migrations
- **MySQL2** - MySQL driver
- **BullMQ** - Job queue (for async code judging)
- **Redis** - Queue storage
- **Docker** - Code execution sandbox
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email service
- **Swagger** - API documentation
- **TypeScript** - Type safety

## ⚠️ Lưu Ý Quan Trọng

### 🐳 Docker Desktop
- **BẮT BUỘC** phải cài Docker Desktop và **đang chạy**
- Code được chạy trong Docker containers để đảm bảo an toàn
- Nếu không có Docker, submissions sẽ báo lỗi

### 📡 Redis
- **BẮT BUỘC** để chạy job queue chấm bài
- Nếu Redis không chạy, submissions sẽ được xử lý synchronously (chậm hơn)

### Migration Tự Động
- Khi chạy `npm run dev`, migrations sẽ **tự động chạy**
- Chỉ migrations **chưa chạy** mới được thực thi
- Database được tạo tự động, không cần import file SQL

### Database Schema
- **KHÔNG** sử dụng file `codery.sql` nữa
- Tất cả schema được quản lý qua migrations trong `src/migrations/`
- Mọi thay đổi database phải tạo migration mới

## 🆘 Troubleshooting

### Redis không kết nối được
```bash
# Kiểm tra Redis đang chạy
redis-cli ping
# Nếu trả về PONG là OK

# Nếu không, khởi động Redis
# Docker:
docker start redis
# hoặc
docker run -d --name redis -p 6379:6379 redis
```

### Docker không chạy được code
```bash
# Kiểm tra Docker
docker --version
docker ps

# Pull lại images
npm run docker:pull
```

### Lỗi migrations
```bash
# Xem trạng thái migrations
npm run migration:show

# Nếu cần reset database
DROP DATABASE Codery;
CREATE DATABASE Codery;
npm run dev
```

---

## 📁 Cấu Trúc Project (Updated)

```
server/
├── src/
│   ├── api/                        # API modules
│   │   ├── auth/                   # Authentication
│   │   ├── problem/                # Problems & Test Cases
│   │   ├── submission/             # Submissions & Judging
│   │   │   └── services/           # Judge services
│   │   │       ├── docker-runner.service.ts
│   │   │       ├── judge.service.ts
│   │   │       └── queue.service.ts
│   │   ├── tag/                    # Tags system
│   │   ├── category/               # Categories
│   │   ├── lesson/                 # Lessons
│   │   └── profile/                # User profiles
│   ├── config/                     # Configuration
│   ├── middlewares/                # Middlewares
│   ├── migrations/                 # Database migrations
│   ├── utils/                      # Utilities
│   ├── app.ts                      # Express app
│   ├── server.ts                   # Server entry point
│   └── worker.ts                   # Judge worker (standalone)
├── migrations/                     # SQL migration scripts (backup)
├── .env                            # Environment variables (create this)
├── package.json
└── README.md
```

---

**Happy Coding! 🎉**