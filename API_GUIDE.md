# 📘 API Response & Exception Handling Guide

## 🎯 Tổng quan

Hệ thống sử dụng format response chuẩn hóa để đảm bảo tính nhất quán trong toàn bộ API.

---

## 📦 Response Format

### ✅ Success Response

```typescript
{
  "code": 200,
  "message": "Đăng nhập thành công",
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "email": "user@gmail.com",
      "full_name": "Nguyễn Văn A",
      "role": "student",
      "avatar_url": "https://...",
      "total_score": 150
    }
  }
}
```

**Các trường:**
- `code`: HTTP status code (200, 201, 204, etc.)
- `message`: Thông báo mô tả kết quả
- `result`: Dữ liệu trả về (có thể là object hoặc array)

### ❌ Error Response

```typescript
{
  "code": 401,
  "message": "Sai mật khẩu",
  "error": {
    "details": {
      "field": "password",
      "reason": "incorrect"
    }
  },
}
```

**Các trường:**
- `code`: HTTP status code (400, 401, 403, 404, 409, 422, 500)
- `message`: Thông báo lỗi
- `error`: Chi tiết lỗi (optional)
  - `details`: Thông tin bổ sung về lỗi

---

## 🔧 Sử dụng trong Code

### Backend - Controller

```typescript
import { successResponse, errorResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

// Success response
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  
  // Trả về success response
  successResponse(res, 'Đăng nhập thành công', result);
  // code: 200, message: 'Đăng nhập thành công', result: {...}
});

// Created response (201)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  
  createdResponse(res, 'Đăng ký thành công');
  // code: 201, message: 'Đăng ký thành công'
});
```

### Backend - Service (Throw Errors)

```typescript
import { 
  BadRequestError, 
  UnauthorizedError, 
  NotFoundError,
  ConflictError,
  ForbiddenError 
} from '../../utils/apiResponse';

// Ví dụ 1: Email không tồn tại
const user = await userRepository.findOne({ where: { email } });
if (!user) {
  throw new NotFoundError('Email không tồn tại');
}

// Ví dụ 2: Sai mật khẩu
const isMatch = await bcryptjs.compare(password, user.password_hash);
if (!isMatch) {
  throw new UnauthorizedError('Sai mật khẩu');
}

// Ví dụ 3: Email đã tồn tại
const existingUser = await userRepository.findOne({ where: { email } });
if (existingUser) {
  throw new ConflictError('Email đã tồn tại');
}

// Ví dụ 4: Tài khoản chưa verify
if (!user.is_verified) {
  throw new ForbiddenError('Tài khoản chưa được xác thực');
}

// Ví dụ 5: Dữ liệu không hợp lệ
if (!otp || otp.length !== 4) {
  throw new BadRequestError('OTP không hợp lệ');
}
```

---

## 🎨 Custom Error Classes

| Class | Status Code | Khi nào dùng |
|-------|-------------|--------------|
| `BadRequestError` | 400 | Dữ liệu request không hợp lệ |
| `UnauthorizedError` | 401 | Sai mật khẩu, token không hợp lệ |
| `ForbiddenError` | 403 | Không có quyền truy cập |
| `NotFoundError` | 404 | Không tìm thấy resource |
| `ConflictError` | 409 | Conflict (email đã tồn tại) |
| `ValidationError` | 422 | Lỗi validation phức tạp |
| `InternalServerError` | 500 | Lỗi server |

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Đăng ký tài khoản |
| POST | `/verify-account` | Xác thực OTP |
| POST | `/resend-otp` | Gửi lại OTP |
| POST | `/login` | Đăng nhập (student/admin) |
| POST | `/forgot-password` | Quên mật khẩu |
| POST | `/reset-password` | Reset mật khẩu |

### Profile (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Lấy thông tin user | ✅ |
| PUT | `/profile` | Cập nhật profile | ✅ |
| POST | `/profile/change-password` | Đổi mật khẩu | ✅ |

---

## 💡 Ví dụ Response

### 1. Login Success

**Request:**
```bash
POST /api/auth/login
{
  "email": "user@gmail.com",
  "password": "string"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Đăng nhập thành công",
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "email": "user@gmail.com",
      "full_name": "Nguyễn Văn User",
      "role": "student",
      "avatar_url": "https://ui-avatars.com/api/?name=Nguyen+Van+User",
      "total_score": 150,
      "solved_problems": 12
    }
  }
}
```

### 2. Get Profile

**Request:**
```bash
GET /api/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Lấy thông tin profile thành công",
  "result": {
    "user": {
      "user_id": 1,
      "email": "user@gmail.com",
      "full_name": "Nguyễn Văn User",
      "role": "student",
      "avatar_url": "https://...",
      "total_score": 150,
      "solved_problems": 12,
      "current_streak": 5,
      "max_streak": 8
    }
  }
}
```

### 3. Error - Email không tồn tại

**Request:**
```bash
POST /api/auth/login
{
  "email": "notfound@gmail.com",
  "password": "string"
}
```

**Response:**
```json
{
  "code": 404,
  "message": "Email không tồn tại",
}
```

### 4. Error - Sai mật khẩu

**Response:**
```json
{
  "code": 401,
  "message": "Sai mật khẩu",
}
```

### 5. Error - Token hết hạn

**Response:**
```json
{
  "code": 401,
  "message": "Token đã hết hạn",
}
```

---

## 🔑 Sample Accounts

Để test API, sử dụng các tài khoản mẫu:

| Email | Password | Role |
|-------|----------|------|
| `user@gmail.com` | `string` | student |
| `admin@gmail.com` | `string` | admin |

---

## ⚠️ Lưu ý quan trọng

1. **Không cần try-catch trong controller** - `asyncHandler` tự động bắt lỗi
2. **Throw error trong service** - Dùng custom error classes
3. **Response format nhất quán** - Luôn dùng `successResponse()` và `errorResponse()`
4. **HTTP status code chính xác** - Mỗi error class có status code riêng
5. **Token trong header** - `Authorization: Bearer <token>`

---

## 📚 Tài liệu thêm

- Swagger UI: `http://localhost:4000/api-docs`
- Source code: `src/utils/apiResponse.ts`
- Error handler: `src/middlewares/errorHandler.middleware.ts`

---

## 🛠️ Khi thêm 1 API mới — Sử dụng Response & ErrorHandler như thế nào

Khi bạn thêm một API mới, hãy tuân theo các bước và ví dụ bên dưới để đảm bảo consistency trong toàn bộ dự án.

- Bước 1 — Service: Viết logic trong service và **throw** các lỗi bằng các custom error classes (ví dụ `BadRequestError`, `NotFoundError`, ...).
- Bước 2 — Controller: Không dùng try/catch; dùng `asyncHandler` để bọc handler và trả response bằng các helper `successResponse`, `createdResponse`, `noContentResponse`.
- Bước 3 — Route & Swagger: Đăng ký route trong file route tương ứng và cập nhật Swagger doc.
- Bước 4 — Tests & Docs: Thêm unit/integration test cho flow và cập nhật `API_GUIDE.md` / Swagger examples.

Ví dụ cụ thể:

1) Service (`src/api/widgets/widgets.service.ts`)

```typescript
import { BadRequestError, NotFoundError } from '../../utils/apiResponse';

export const createWidget = async (payload: any) => {
  if (!payload.name) throw new BadRequestError('Tên widget là bắt buộc');

  // business logic, DB calls
  const widget = await widgetRepository.save({ name: payload.name });
  return widget;
};

export const getWidgetById = async (id: number) => {
  const widget = await widgetRepository.findOne({ where: { id } });
  if (!widget) throw new NotFoundError('Widget không tồn tại');
  return widget;
};
```

2) Controller (`src/api/widgets/widgets.controller.ts`)

```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';
import { createdResponse, successResponse } from '../../utils/apiResponse';
import * as widgetService from './widgets.service';

export const createWidget = asyncHandler(async (req: Request, res: Response) => {
  const widget = await widgetService.createWidget(req.body);
  // Trả về 201 và payload theo chuẩn { code, message, result }
  createdResponse(res, 'Tạo widget thành công', widget);
});

export const getWidget = asyncHandler(async (req: Request, res: Response) => {
  const widget = await widgetService.getWidgetById(Number(req.params.id));
  successResponse(res, 'Lấy widget thành công', widget);
});
```

Chú ý:
- Dùng `createdResponse` cho tài nguyên được tạo (201).
- Dùng `noContentResponse` nếu endpoint không trả body (204).

## 🧰 Khi muốn bắt 1 lỗi mới (thêm custom error class)

Nếu bạn cần một loại lỗi HTTP mà hiện tại chưa có trong `src/utils/apiResponse.ts`, thêm 1 class mới kế thừa `AppError`.

Ví dụ: thêm `TooManyRequestsError` (429)

```typescript
// src/utils/apiResponse.ts (hoặc file mới import/export từ đây)
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too Many Requests', details?: any) {
    super(message, 429, details);
  }
}
```

Sau đó trong service bạn có thể `throw new TooManyRequestsError('Rate limit exceeded')`.

Vì `errorHandler` đã map tất cả `AppError` (thông qua `instanceof`) sang `errorResponse`, bạn **không cần** sửa middleware để hỗ trợ lỗi mới này.

Nếu lỗi phát sinh từ thư viện bên ngoài (ví dụ `RateLimit` lib) và không phải `AppError`, bạn có thể:

- Convert error đó thành AppError trong service (ví dụ `throw new TooManyRequestsError(...)`).
- Hoặc mở rộng `errorHandler` để nhận diện `err.name` hoặc `err.code` của thư viện và chuyển thành `errorResponse` tương ứng.

## ✅ Checklist nhanh khi thêm API mới

- [ ] Service throws AppError subclasses for expected error cases
- [ ] Controller uses `asyncHandler` and response helpers
- [ ] Route registered and Swagger updated
- [ ] Add unit/integration tests for success & error cases
- [ ] Update this guide / changelog if new error class was added

---

## 📝 Exercise API (Bài tập trắc nghiệm)

Hệ thống bài tập nhỏ sau mỗi lesson, tương tự W3School.

### Luồng hoạt động

1. Sau khi học xong một lesson, user có thể làm bài tập
2. Mỗi lesson có thể có 0, 1 hoặc nhiều câu hỏi trắc nghiệm
3. Hỗ trợ 2 loại: Multiple Choice (4 lựa chọn) và True/False (2 lựa chọn)
4. Khi trả lời, hệ thống trả về kết quả + giải thích + điều hướng câu tiếp theo

### API Endpoints

#### 1. Lấy danh sách bài tập của lesson

```http
GET /api/exercises/lesson/:lessonId
```

**Response:**
```json
{
  "code": 200,
  "message": "Lấy danh sách bài tập thành công",
  "result": {
    "lesson_id": 1,
    "total_questions": 5,
    "exercises": [
      {
        "exercise_id": 1,
        "question_preview": "Phương thức nào được sử dụng để lấy...",
        "exercise_type": "MULTIPLE_CHOICE",
        "order": 1
      }
    ]
  }
}
```

#### 2. Bắt đầu làm bài tập (lấy câu đầu tiên)

```http
GET /api/exercises/lesson/:lessonId/start
```

**Response:**
```json
{
  "code": 200,
  "message": "Lấy bài tập đầu tiên thành công",
  "result": {
    "has_exercises": true,
    "exercise": {
      "exercise_id": 1,
      "lesson_id": 1,
      "question": "Phương thức nào được sử dụng để lấy một phần tử HTML theo ID?",
      "exercise_type": "MULTIPLE_CHOICE",
      "options": [
        { "id": "A", "text": "document.getElementById()" },
        { "id": "B", "text": "document.getElementByClass()" },
        { "id": "C", "text": "document.querySelector()" },
        { "id": "D", "text": "document.findById()" }
      ],
      "order_index": 0
    },
    "navigation": {
      "current_index": 1,
      "total_questions": 5,
      "remaining_questions": 4,
      "is_first": true,
      "is_last": false,
      "next_exercise_id": 2,
      "prev_exercise_id": null
    }
  }
}
```

#### 3. Lấy một câu hỏi cụ thể

```http
GET /api/exercises/:exerciseId
```

#### 4. Nộp câu trả lời

```http
POST /api/exercises/:exerciseId/submit
Content-Type: application/json

{
  "answer": "A"
}
```

**Response (đúng):**
```json
{
  "code": 200,
  "message": "Chính xác! 🎉",
  "result": {
    "is_correct": true,
    "correct_answer": "A",
    "explanation": "document.getElementById() là phương thức chuẩn để lấy phần tử theo ID",
    "navigation": {
      "current_index": 1,
      "total_questions": 5,
      "remaining_questions": 4,
      "is_first": true,
      "is_last": false,
      "next_exercise_id": 2,
      "prev_exercise_id": null
    }
  }
}
```

**Response (sai):**
```json
{
  "code": 200,
  "message": "Sai rồi. Hãy thử lại!",
  "result": {
    "is_correct": false,
    "correct_answer": "A",
    "explanation": "...",
    "navigation": { ... }
  }
}
```

### Admin API

- `GET /api/exercises/admin/lesson/:lessonId` - Lấy tất cả bài tập (có đáp án)
- `GET /api/exercises/admin/:exerciseId` - Lấy chi tiết bài tập
- `POST /api/exercises` - Tạo bài tập mới
- `PUT /api/exercises/:exerciseId` - Cập nhật bài tập
- `DELETE /api/exercises/:exerciseId` - Xóa bài tập
- `PUT /api/exercises/admin/lesson/:lessonId/reorder` - Sắp xếp lại thứ tự

### Tạo bài tập mới (Admin)

```http
POST /api/exercises
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "lesson_id": 1,
  "question": "Câu hỏi của bạn?",
  "exercise_type": "MULTIPLE_CHOICE",
  "options": [
    { "id": "A", "text": "Đáp án A" },
    { "id": "B", "text": "Đáp án B" },
    { "id": "C", "text": "Đáp án C" },
    { "id": "D", "text": "Đáp án D" }
  ],
  "correct_answer": "A",
  "explanation": "Giải thích tại sao A đúng"
}
```

### Exercise Type

- `MULTIPLE_CHOICE`: 2-4 lựa chọn, answer là A/B/C/D
- `TRUE_FALSE`: 2 lựa chọn, answer là TRUE/FALSE

---
