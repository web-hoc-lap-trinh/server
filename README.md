# Server - Codery Platform

## ✨ Recent Updates (November 2024)

### 🎯 API Standardization & Advanced Exception Handling
- ✅ **Standardized API Response Format** - All endpoints return consistent JSON structure
- ✅ **Advanced Exception Handling** - Centralized error handling with custom error classes
- ✅ **Simplified Routes** - Removed `/auth` prefix from all endpoints
- ✅ **Unified Login** - Single `/api/login` endpoint for both students and admins
- ✅ **Password Change without OTP** - Change password using old password verification
- ✅ **Full TypeScript Support** - Type-safe error handling and responses

📖 **Documentation:**
- [API_STANDARDIZATION.md](./API_STANDARDIZATION.md) - Complete API standardization guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick API reference
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing guide with examples
- [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) - Summary of all changes

---

## 🚀 Cài Đặt và Chạy Project

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` trong thư mục project:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=codery
DB_USER=root
DB_PASSWORD=
EMAIL_USER=hoanghaiyencbm@gmail.com
EMAIL_PASS=pasg luny ewru rmwq
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=dvfukrnu5
CLOUDINARY_API_KEY=924876963489893
CLOUDINARY_API_SECRET=w_Oeq8u24WZ7fc5fAeXH3US6of0
```

### 3. Chạy project

```bash
# Development mode (migrations tự động chạy)
npm run dev

# Production mode
npm run build
npm start
```

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
```

## 📚 Thư viện sử dụng

- **Express** - Web framework
- **TypeORM** - ORM và migrations
- **MySQL2** - MySQL driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email service
- **Swagger** - API documentation
- **TypeScript** - Type safety

## ⚠️ Lưu Ý Quan Trọng

### Migration Tự Động
- Khi chạy `npm run dev`, migrations sẽ **tự động chạy**
- Chỉ migrations **chưa chạy** mới được thực thi
- Database được tạo tự động, không cần import file SQL

### Database Schema
- **KHÔNG** sử dụng file `codery.sql` nữa
- Tất cả schema được quản lý qua migrations trong `src/migrations/`
- Mọi thay đổi database phải tạo migration mới

## 🆘 Troubleshooting

Nếu gặp lỗi khi chạy migrations, xem:
- [MIGRATION.md - Troubleshooting](./MIGRATION.md#troubleshooting)

Hoặc chạy lại từ đầu:
```bash
# Xóa database cũ
DROP DATABASE codery;
CREATE DATABASE codery;

# Chạy lại server
npm run dev
```

---

**Happy Coding! 🎉**
