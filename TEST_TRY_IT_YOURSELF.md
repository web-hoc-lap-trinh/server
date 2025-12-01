# Test API: Lesson với Try It Yourself (C++)

## 1. Tạo Lesson với Try It Yourself

### Endpoint: POST /api/lessons

### Headers:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Request Body:
```json
{
  "category_id": 1,
  "title": "Giới thiệu về C++ - Hello World",
  "description": "Bài học đầu tiên về ngôn ngữ lập trình C++. Học cách viết chương trình Hello World và hiểu cấu trúc cơ bản của một chương trình C++.",
  "content": "<h1>Giới thiệu về C++</h1><p>C++ là một ngôn ngữ lập trình bậc cao được phát triển bởi Bjarne Stroustrup vào năm 1979 tại Bell Labs. C++ là phần mở rộng của ngôn ngữ C, thêm vào các tính năng hướng đối tượng (OOP).</p><h2>Chương trình Hello World</h2><p>Đây là chương trình đầu tiên mà mọi lập trình viên học khi bắt đầu với C++:</p><pre><code>#include &lt;iostream&gt;\nusing namespace std;\n\nint main() {\n    cout &lt;&lt; \"Hello, World!\" &lt;&lt; endl;\n    return 0;\n}</code></pre><h3>Giải thích:</h3><ul><li><code>#include &lt;iostream&gt;</code>: Thư viện chuẩn cho input/output</li><li><code>using namespace std;</code>: Sử dụng namespace std để không cần viết std:: trước cout, cin</li><li><code>int main()</code>: Hàm chính, điểm bắt đầu của chương trình</li><li><code>cout &lt;&lt;</code>: In ra màn hình</li><li><code>endl</code>: Xuống dòng</li><li><code>return 0;</code>: Trả về 0 (chương trình kết thúc thành công)</li></ul><h2>Thực hành</h2><p>Hãy thử viết chương trình in ra tên của bạn bằng cách sử dụng <strong>Try It Yourself</strong> ở bên dưới!</p>",
  "difficulty_level": "BEGINNER",
  "order_index": 1,
  "try_it_yourself": {
    "language_code": "cpp",
    "example_code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Thay đổi dòng bên dưới để in ra tên của bạn\n    cout << \"Hello, World!\" << endl;\n    \n    // Bạn cũng có thể thử in nhiều dòng\n    // cout << \"Xin chào!\" << endl;\n    // cout << \"Tôi đang học C++\" << endl;\n    \n    return 0;\n}"
  }
}
```

### Expected Response (201):
```json
{
  "success": true,
  "message": "Tạo Bài học thành công",
  "data": {
    "lesson_id": 1,
    "category_id": 1,
    "title": "Giới thiệu về C++ - Hello World",
    "description": "Bài học đầu tiên về ngôn ngữ lập trình C++...",
    "content": "...",
    "difficulty_level": "BEGINNER",
    "order_index": 1,
    "is_published": false,
    "view_count": 0,
    "created_by": 1,
    "created_at": "...",
    "updated_at": "...",
    "tryItYourself": {
      "try_it_yourself_id": 1,
      "lesson_id": 1,
      "language_id": 1,
      "example_code": "...",
      "language": {
        "language_id": 1,
        "name": "C++",
        "code": "cpp",
        "version": "17"
      }
    }
  }
}
```

---

## 2. Publish Lesson

### Endpoint: PUT /api/lessons/{lessonId}

### Request Body:
```json
{
  "is_published": true
}
```

---

## 3. Lấy Try It Yourself của Lesson

### Endpoint: GET /api/lessons/{lessonId}/try-it-yourself

### Expected Response:
```json
{
  "success": true,
  "message": "Try It Yourself fetched successfully",
  "data": {
    "try_it_yourself_id": 1,
    "lesson_id": 1,
    "language": {
      "language_id": 1,
      "name": "C++",
      "code": "cpp",
      "version": "17"
    },
    "example_code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    return 0;\n}",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

## 4. Chạy Code trong Try It Yourself

### Endpoint: POST /api/lessons/{lessonId}/try-it-yourself/run

### Request Body (Hello World):
```json
{
  "source_code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    return 0;\n}"
}
```

### Expected Response:
```json
{
  "success": true,
  "message": "Code executed successfully",
  "data": {
    "success": true,
    "output": "Hello, World!",
    "execution_time": 15,
    "status": "success"
  }
}
```

### Request Body (với Input):
```json
{
  "source_code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << \"Tong: \" << a + b << endl;\n    return 0;\n}",
  "input": "5 3"
}
```

### Expected Response:
```json
{
  "success": true,
  "message": "Code executed successfully",
  "data": {
    "success": true,
    "output": "Tong: 8",
    "execution_time": 12,
    "status": "success"
  }
}
```

---

## 5. Test Compile Error

### Request Body:
```json
{
  "source_code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello\" << endl\n    return 0;\n}"
}
```

### Expected Response:
```json
{
  "success": true,
  "message": "Code executed successfully",
  "data": {
    "success": false,
    "output": "",
    "error": "solution.cpp: In function 'int main()':\nsolution.cpp:5:27: error: expected ';' before 'return'",
    "execution_time": 0,
    "status": "compile_error"
  }
}
```

---

## 6. Chạy Code Trực Tiếp (Playground)

### Endpoint: POST /api/lessons/try-it-yourself/run

### Request Body:
```json
{
  "language_code": "cpp",
  "source_code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    for(int i = 1; i <= 5; i++) {\n        cout << \"Number: \" << i << endl;\n    }\n    return 0;\n}"
}
```

### Expected Response:
```json
{
  "success": true,
  "message": "Code executed successfully",
  "data": {
    "success": true,
    "output": "Number: 1\nNumber: 2\nNumber: 3\nNumber: 4\nNumber: 5",
    "execution_time": 14,
    "status": "success"
  }
}
```

---

## 7. Lấy Danh Sách Ngôn Ngữ Hỗ Trợ

### Endpoint: GET /api/lessons/try-it-yourself/languages

### Expected Response:
```json
{
  "success": true,
  "message": "Supported languages fetched successfully",
  "data": [
    {
      "language_id": 1,
      "name": "C++",
      "code": "cpp",
      "version": "17"
    },
    {
      "language_id": 2,
      "name": "C",
      "code": "c",
      "version": "11"
    },
    {
      "language_id": 3,
      "name": "Python",
      "code": "python",
      "version": "3.11"
    },
    {
      "language_id": 4,
      "name": "JavaScript",
      "code": "javascript",
      "version": "ES2022"
    },
    {
      "language_id": 5,
      "name": "Java",
      "code": "java",
      "version": "17"
    }
  ]
}
```

---

## 8. Tạo Try It Yourself riêng cho Lesson đã tồn tại

### Endpoint: POST /api/lessons/{lessonId}/try-it-yourself

### Headers:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Request Body:
```json
{
  "language_code": "cpp",
  "example_code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Viết code của bạn ở đây\n    \n    return 0;\n}"
}
```

---

## 9. Cập nhật Try It Yourself

### Endpoint: PUT /api/lessons/{lessonId}/try-it-yourself

### Request Body:
```json
{
  "language_code": "python",
  "example_code": "# Viết code Python của bạn ở đây\nprint('Hello, World!')"
}
```

---

## 10. Xóa Try It Yourself

### Endpoint: DELETE /api/lessons/{lessonId}/try-it-yourself

### Expected Response:
```json
{
  "success": true,
  "message": "Try It Yourself deleted successfully"
}
```

---

## Lưu ý:
1. Đảm bảo Docker đang chạy để có thể execute code
2. Các ngôn ngữ hỗ trợ: `cpp`, `c`, `python`, `javascript`, `java`
3. Time limit: 5 giây
4. Memory limit: 256MB
5. Mỗi lesson chỉ có thể có tối đa 1 Try It Yourself
