# Hướng Dẫn Sử Dụng TypeORM Migrations

## 📚 Mục Lục
1. [Giới Thiệu](#giới-thiệu)
2. [Cấu Trúc Migration](#cấu-trúc-migration)
3. [Cách Migration Hoạt Động](#cách-migration-hoạt-động)
4. [Các Lệnh Migration](#các-lệnh-migration)
5. [Tạo Migration Mới](#tạo-migration-mới)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Giới Thiệu

Migration là cách quản lý phiên bản database một cách có tổ chức. Thay vì chạy file SQL thủ công, migrations cho phép:

- ✅ **Tự động hóa**: Migrations tự động chạy khi start server
- ✅ **Theo dõi phiên bản**: Biết migration nào đã chạy, chưa chạy
- ✅ **Rollback**: Có thể quay lại phiên bản cũ nếu có lỗi
- ✅ **Chia sẻ dễ dàng**: Team members có cùng cấu trúc database
- ✅ **Version Control**: Lưu trữ lịch sử thay đổi database trong Git

---

## 📁 Cấu Trúc Migration

```
server/
├── src/
│   └── migrations/
│       └── 1700000000000-InitialSchema.ts  # Migration đầu tiên
├── ormconfig.ts                            # Config cho TypeORM CLI
└── package.json                            # Scripts cho migration
```

### Bảng Migrations trong Database

TypeORM tạo bảng `migrations` để theo dõi:

| Column      | Mô tả                                    |
|-------------|------------------------------------------|
| id          | ID tự tăng                               |
| timestamp   | Timestamp của migration (từ tên file)    |
| name        | Tên của migration class                  |

---

## ⚙️ Cách Migration Hoạt Động

### 1. **Khi Start Server**

```typescript
// src/server.ts
const startServer = async () => {
  // Kết nối database
  await AppDataSource.initialize();
  
  // Kiểm tra migrations chưa chạy
  const pendingMigrations = await AppDataSource.showMigrations();
  
  if (pendingMigrations) {
    // Tự động chạy migrations mới
    await AppDataSource.runMigrations();
  }
  
  // Start server...
};
```

### 2. **Quy Trình Chạy Migration**

1. TypeORM kiểm tra bảng `migrations`
2. So sánh với các file trong `src/migrations/`
3. Chỉ chạy migrations **chưa có** trong bảng
4. Thực thi method `up()` của migration
5. Lưu record vào bảng `migrations`

### 3. **Trường Hợp Không Chạy Lại**

- ✅ Migration đã có trong bảng `migrations` → **KHÔNG** chạy lại
- ✅ Database đã có data → Migration vẫn chạy nếu chưa được ghi nhận
- ✅ Chỉ chạy migrations mới (timestamp cao hơn)

---

## 🔧 Các Lệnh Migration

### 1. **Chạy Migrations** ⚡

```bash
# Tự động chạy khi start server
npm run dev

# Hoặc chạy thủ công
npm run migration:run
```

**Kết quả:**
```
📦 Running pending migrations...
query: SELECT * FROM `migrations` `migrations`
query: CREATE TABLE IF NOT EXISTS `users` (...)
query: CREATE TABLE IF NOT EXISTS `categories` (...)
✅ Migrations executed successfully
```

### 2. **Xem Trạng Thái Migrations** 👀

```bash
npm run migration:show
```

**Kết quả:**
```
 [X] InitialSchema1700000000000  # Đã chạy
 [ ] AddUserRole1700000000001    # Chưa chạy
```

### 3. **Revert Migration (Quay Lại)** ↩️

```bash
npm run migration:revert
```

Chạy method `down()` của migration gần nhất và xóa record khỏi bảng `migrations`.

### 4. **Tạo Migration Mới (Rỗng)** 📝

```bash
npm run migration:create src/migrations/AddNewTable
```

Tạo file migration trống để bạn tự viết code.

### 5. **Generate Migration Tự Động** 🤖

```bash
npm run migration:generate src/migrations/UpdateUserTable
```

TypeORM tự động so sánh Entity với Database và tạo migration.

---

## 🆕 Tạo Migration Mới

### Ví Dụ 1: Thêm Bảng Mới

```bash
npm run migration:create src/migrations/AddLanguagesTable
```

**File tạo ra:** `src/migrations/1731376800000-AddLanguagesTable.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLanguagesTable1731376800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`languages\` (
        \`language_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`name\` varchar(50) NOT NULL,
        \`code\` varchar(10) NOT NULL,
        \`version\` varchar(20) DEFAULT NULL,
        \`is_active\` tinyint(1) DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`language_id\`),
        UNIQUE KEY \`code\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`languages\``);
  }
}
```

### Ví Dụ 2: Thêm Cột Vào Bảng Có Sẵn

```bash
npm run migration:create src/migrations/AddPhoneToUsers
```

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneToUsers1731376900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\` 
      ADD COLUMN \`phone\` varchar(20) DEFAULT NULL AFTER \`email\`;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\` 
      DROP COLUMN \`phone\`;
    `);
  }
}
```

### Ví Dụ 3: Thêm Foreign Key

```bash
npm run migration:create src/migrations/AddSubmissionLanguageFK
```

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmissionLanguageFK1731377000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm foreign key constraint
    await queryRunner.query(`
      ALTER TABLE \`submissions\` 
      ADD CONSTRAINT \`submissions_language_fk\` 
      FOREIGN KEY (\`language_id\`) 
      REFERENCES \`languages\` (\`language_id\`)
      ON DELETE RESTRICT 
      ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`submissions\` 
      DROP FOREIGN KEY \`submissions_language_fk\`;
    `);
  }
}
```

### Ví Dụ 4: Insert Data Mẫu

```bash
npm run migration:create src/migrations/SeedLanguages
```

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedLanguages1731377100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO \`languages\` (\`name\`, \`code\`, \`version\`) VALUES
      ('JavaScript', 'javascript', 'ES6'),
      ('Python', 'python', '3.11'),
      ('Java', 'java', '17'),
      ('C++', 'cpp', 'C++17'),
      ('Go', 'go', '1.21');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`languages\` 
      WHERE \`code\` IN ('javascript', 'python', 'java', 'cpp', 'go');
    `);
  }
}
```

---

## 📋 Best Practices

### ✅ DO's (Nên Làm)

1. **Đặt Tên Migration Rõ Ràng**
   ```bash
   # ❌ Bad
   npm run migration:create src/migrations/Update
   
   # ✅ Good
   npm run migration:create src/migrations/AddEmailVerificationToUsers
   ```

2. **Luôn Viết Cả `up()` và `down()`**
   - `up()`: Thực hiện thay đổi
   - `down()`: Quay lại trạng thái trước đó

3. **Test Migration Trước Khi Deploy**
   ```bash
   # Chạy migration
   npm run migration:run
   
   # Test app
   npm run dev
   
   # Nếu có lỗi, revert
   npm run migration:revert
   ```

4. **Sử dụng `IF NOT EXISTS` / `IF EXISTS`**
   ```sql
   CREATE TABLE IF NOT EXISTS `users` (...)
   DROP TABLE IF EXISTS `users`
   ```

5. **Migration Nhỏ và Tập Trung**
   - Mỗi migration nên làm **1 việc** cụ thể
   - Dễ debug và revert

6. **Commit Migration Cùng Code**
   ```bash
   git add src/migrations/
   git commit -m "Add languages table migration"
   ```

### ❌ DON'Ts (Không Nên)

1. **KHÔNG sửa migration đã chạy**
   - ❌ Sửa file migration cũ
   - ✅ Tạo migration mới để fix

2. **KHÔNG xóa migration đã chạy**
   - Có thể gây lỗi cho team members

3. **KHÔNG hard-code data quan trọng**
   - Dùng environment variables

4. **KHÔNG chạy SQL nguy hiểm không có backup**
   ```sql
   -- ❌ Nguy hiểm
   DROP TABLE users;
   
   -- ✅ An toàn hơn
   DROP TABLE IF EXISTS users;
   ```

---

## 🔄 Workflow Thực Tế

### Scenario 1: Developer Mới Join Project

```bash
# 1. Clone project
git clone <repo-url>
cd server

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env
cp .env.example .env

# 4. Chạy server (migrations tự động chạy)
npm run dev
```

**Kết quả:** Database được tạo tự động với đầy đủ bảng!

### Scenario 2: Thêm Feature Mới (Thêm Bảng Languages)

```bash
# 1. Tạo migration
npm run migration:create src/migrations/AddLanguagesTable

# 2. Viết code migration (xem ví dụ trên)

# 3. Test migration
npm run migration:run

# 4. Kiểm tra database
# MySQL: SHOW TABLES;

# 5. Commit
git add src/migrations/
git commit -m "Add languages table"
git push
```

### Scenario 3: Migration Bị Lỗi

```bash
# 1. Server báo lỗi khi chạy migration
❌ Error: Table 'users' already exists

# 2. Revert migration
npm run migration:revert

# 3. Sửa file migration
# Thêm IF NOT EXISTS vào CREATE TABLE

# 4. Chạy lại
npm run migration:run
```

---

## 🐛 Troubleshooting

### Vấn Đề 1: Migration Không Chạy

**Triệu chứng:**
```
✅ Database is up to date
```
Nhưng bảng chưa được tạo.

**Giải pháp:**
```bash
# Kiểm tra migrations đã chạy
npm run migration:show

# Nếu migration đã được đánh dấu nhưng chưa chạy thực sự
# Xóa record trong bảng migrations (cẩn thận!)
DELETE FROM migrations WHERE name = 'InitialSchema1700000000000';

# Chạy lại
npm run migration:run
```

### Vấn Đề 2: Foreign Key Constraint Error

**Triệu chứng:**
```
Error: Cannot add foreign key constraint
```

**Nguyên nhân:** Bảng tham chiếu chưa tồn tại

**Giải pháp:** Đảm bảo thứ tự tạo bảng đúng
```typescript
// Tạo bảng cha trước
await queryRunner.query(`CREATE TABLE users (...)`);

// Tạo bảng con sau
await queryRunner.query(`CREATE TABLE submissions (...)`);
```

### Vấn Đề 3: Migration Chạy Lại Nhiều Lần

**Triệu chứng:**
```
Error: Table 'users' already exists
```

**Nguyên nhân:** Không dùng `IF NOT EXISTS`

**Giải pháp:**
```sql
-- Thêm IF NOT EXISTS
CREATE TABLE IF NOT EXISTS `users` (...)
```

### Vấn Đề 4: Không Tìm Thấy Migration Files

**Triệu chứng:**
```
No migrations found
```

**Giải pháp:**
```typescript
// Kiểm tra đường dẫn trong ormconfig.ts
migrations: [path.join(__dirname, 'src/migrations/**/*{.ts,.js}')],

// Hoặc trong data-source.ts
migrations: [path.join(__dirname, '../migrations/**/*{.ts,.js}')],
```

---

## 📊 So Sánh: Trước và Sau

### ❌ Trước (Dùng File SQL)

```bash
# Developer phải:
1. Tìm file codery.sql
2. Mở phpMyAdmin hoặc MySQL Workbench
3. Import thủ công
4. Nhớ chạy lại khi có thay đổi
5. Khó sync giữa team members
```

### ✅ Sau (Dùng Migrations)

```bash
# Chỉ cần:
npm run dev

# Done! 🎉
- Tự động tạo database
- Tự động chạy migrations mới
- Không chạy lại migrations cũ
- Sync hoàn hảo giữa team
```

---

## 🎓 Tổng Kết

### Lệnh Thường Dùng

| Lệnh                        | Mô tả                           |
|-----------------------------|---------------------------------|
| `npm run dev`               | Start server + auto migration   |
| `npm run migration:run`     | Chạy migrations thủ công        |
| `npm run migration:show`    | Xem trạng thái migrations       |
| `npm run migration:create`  | Tạo migration mới (rỗng)        |
| `npm run migration:revert`  | Quay lại migration trước        |

### Quy Trình Chuẩn

1. **Phát triển feature mới**
   - Tạo migration: `npm run migration:create`
   - Viết code `up()` và `down()`
   - Test: `npm run migration:run`

2. **Commit và push**
   ```bash
   git add src/migrations/
   git commit -m "Add feature X migration"
   git push
   ```

3. **Team members pull code**
   ```bash
   git pull
   npm run dev  # Migrations tự động chạy
   ```

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra [Troubleshooting](#troubleshooting)
2. Xem log chi tiết khi chạy migration
3. Kiểm tra bảng `migrations` trong database
4. Liên hệ team lead

---

**Lưu ý:** Luôn backup database trước khi chạy migration quan trọng! 🔒
