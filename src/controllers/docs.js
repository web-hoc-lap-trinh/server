// routes/docs.js
module.exports = (req, res) => {
  const html = `
  <html>
    <head>
      <title>Auth API Docs</title>
      <style>
        body {
          font-family: monospace;
          background: #f6f8fa;
          padding: 20px;
        }
        h1 {
          color: #111;
        }
        h2 {
          color: #333;
          margin-top: 30px;
        }
        .block {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px dashed #ccc;
        }
        pre {
          background: #fff;
          border: 1px solid #ccc;
          padding: 10px;
          overflow: auto;
        }
      </style>
    </head>
    <body>
      <h1>🚀 Auth API Documentation</h1>

      <div class="block">
        <h2>1. Register</h2>
        <strong>POST</strong> http://localhost:4000/auth/register
        <pre>{
  "email": "student@example.com",
  "password": "123456",
  "full_name": "Nguyen Van A"
}</pre>
        <strong>Response:</strong>
        <pre>{
  "message": "Đăng ký thành công",
  "user": {
    "user_id": 1,
    "email": "student@example.com",
    "full_name": "Nguyen Van A",
    "role": "student"
  }
}</pre>
      </div>

      <div class="block">
        <h2>2. Login</h2>
        <strong>POST</strong> http://localhost:4000/auth/login
        <pre>{
  "email": "student@example.com",
  "password": "123456"
}</pre>
        <strong>Response:</strong>
        <pre>{
  "message": "Đăng nhập thành công",
  "token": "jwt_token_here",
  "user": {
    "user_id": 1,
    "email": "student@example.com",
    "full_name": "Nguyen Van A",
    "role": "student"
  }
}</pre>
      </div>

      <div class="block">
        <h2>3. Forgot Password (Send OTP)</h2>
        <strong>POST</strong> http://localhost:4000/auth/forgot-password
        <pre>{
  "email": "student@example.com"
}</pre>
        <strong>Response:</strong>
        <pre>{
  "message": "OTP đã được gửi tới email"
}</pre>
      </div>

      <div class="block">
        <h2>4. Reset Password (Verify OTP)</h2>
        <strong>POST</strong> http://localhost:4000/auth/reset-password
        <pre>{
  "email": "student@example.com",
  "otp": "1234",
  "newPassword": "newpass123"
}</pre>
        <strong>Response:</strong>
        <pre>{
  "message": "Đặt lại mật khẩu thành công",
  "user": {
    "user_id": 1,
    "email": "student@example.com",
    "full_name": "Nguyen Van A",
    "role": "student"
  }
}</pre>
      </div>
    </body>
  </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
};
