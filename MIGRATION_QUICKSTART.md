# 🚀 Quick Start Guide - TypeORM Migrations

## Cài Đặt Lần Đầu

```bash
# 1. Cài đặt dependencies
npm install

# 2. Tạo file .env (nếu chưa có)
cp .env.example .env

# 3. Cấu hình database trong .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=codery

# 4. Chạy server (migrations tự động chạy)
npm run dev
```

## 📋 Các Lệnh Migration

```bash
# Chạy migrations (tự động khi start server)
npm run dev

# Xem trạng thái migrations
npm run migration:show

# Chạy migrations thủ công
npm run migration:run

# Tạo migration mới
npm run migration:create src/migrations/TenMigration

# Quay lại migration trước
npm run migration:revert
```

## 📖 Tài Liệu Chi Tiết

Xem file [MIGRATION.md](./MIGRATION.md) để biết:
- Cách tạo migration mới
- Ví dụ thêm bảng, thêm cột, foreign key
- Best practices
- Troubleshooting

## ⚡ Ưu Điểm So Với File SQL

| Trước (SQL File)           | Sau (Migrations)              |
|---------------------------|-------------------------------|
| ❌ Phải import thủ công   | ✅ Tự động khi start server   |
| ❌ Khó sync team          | ✅ Sync qua Git               |
| ❌ Không theo dõi phiên bản| ✅ Theo dõi trong database    |
| ❌ Khó rollback           | ✅ Rollback dễ dàng           |
| ❌ Chạy lại gây duplicate | ✅ Chỉ chạy migrations mới    |

## 🎯 Workflow

1. **Developer tạo migration mới:**
   ```bash
   npm run migration:create src/migrations/AddLanguagesTable
   ```

2. **Viết code trong file migration**

3. **Commit và push:**
   ```bash
   git add src/migrations/
   git commit -m "Add languages table"
   git push
   ```

4. **Team members pull:**
   ```bash
   git pull
   npm run dev  # Migrations tự chạy
   ```

## 🔧 Cấu Trúc Project

```
server/
├── src/
│   ├── migrations/              # 📂 Folder chứa migrations
│   │   └── 1700000000000-InitialSchema.ts
│   ├── config/
│   │   └── data-source.ts       # Config TypeORM
│   └── server.ts                # Auto-run migrations
├── ormconfig.ts                 # Config cho TypeORM CLI
├── MIGRATION.md                 # 📖 Hướng dẫn chi tiết
└── package.json                 # Migration scripts
```

---

**✨ Tip:** Luôn xem [MIGRATION.md](./MIGRATION.md) để biết cách sử dụng chi tiết!
