const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const PORT = process.env.PORT || 3000;
  const BASE_URL = `http://localhost:${PORT}`;

  const html = `
  <html>
    <head>
      <title>API Docs</title>
      <style>
        body { font-family: monospace; background: #f6f8fa; padding: 20px; color: #333; }
        h1 { color: #111; }
        h2 { color: #0366d6; margin-top: 40px; }
        .block { margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px dashed #ccc; }
        pre { background: #fff; border: 1px solid #ddd; padding: 15px; overflow: auto; border-radius: 5px; font-size: 14px; }
        strong { font-size: 16px; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
        .post { background-color: #0366d6; }
        .get { background-color: #28a745; }
        .put { background-color: #6f42c1; }
        .delete { background-color: #dc3545; }
        .url { background-color: #eef; padding: 4px 8px; border-radius: 4px; }
        .note { background-color: #fffbdd; border-left: 4px solid #ffeb3b; padding: 10px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>🚀 API Documentation</h1>

      <div class="block">
        <h2>1. Register</h2>
        <span class="method post">POST</span> <span class="url">${BASE_URL}/api/auth/register</span>
        <pre>{
  "email": "student@example.com",
  "password": "123456",
  "full_name": "Nguyen Van A"
}</pre>
      </div>

      <div class="block">
        <h2>2. Login</h2>
        <span class="method post">POST</span> <span class="url">${BASE_URL}/api/auth/login</span>
        <pre>{
  "email": "student@example.com",
  "password": "123456"
}</pre>
      </div>
      
      <div class="block">
        <h2>3. Get My Profile</h2>
        <span class="method get">GET</span> <span class="url">${BASE_URL}/api/users/profile</span>
        <div class="note">Yêu cầu <b>Header</b>: <code>Authorization: Bearer [your_jwt_token]</code></div>
        <strong>Response:</strong>
        <pre>{
    "user_id": 1,
    "email": "student@example.com",
    "full_name": "Nguyen Van A",
    "role": "student",
    "avatar_url": "/uploads/avatars/avatar-1663...jpg",
    "created_at": "2023-10-26T10:00:00.000Z"
}</pre>
      </div>

      <div class="block">
        <h2>4. Update My Profile</h2>
        <span class="method put">PUT</span> <span class="url">${BASE_URL}/api/users/profile</span>
        <div class="note">
            Yêu cầu <b>Header</b>: <code>Authorization: Bearer [your_jwt_token]</code><br>
            Yêu cầu <b>Body</b>: Sử dụng <code>form-data</code> để có thể upload file.
        </div>
         <strong>Body (form-data):</strong>
        <pre>
full_name: (string, optional)
email: (string, optional)
password: (string, optional - mật khẩu mới)
avatar: (file, optional - file hình ảnh)
</pre>
      </div>

      <div class="block">
        <h2>5. Delete My Account</h2>
        <span class="method delete">DELETE</span> <span class="url">${BASE_URL}/api/users/profile</span>
        <div class="note">Yêu cầu <b>Header</b>: <code>Authorization: Bearer [your_jwt_token]</code></div>
        <strong>Response:</strong>
        <pre>{
  "message": "Tài khoản đã được xóa thành công"
}</pre>
      </div>

      <div class="block">
        <h2>6. Forgot Password</h2>
        <span class="method post">POST</span> <span class="url">${BASE_URL}/api/auth/forgot-password</span>
         <pre>{
  "email": "student@example.com"
}</pre>
      </div>

      <div class="block">
        <h2>7. Reset Password</h2>
        <span class="method post">POST</span> <span class="url">${BASE_URL}/api/auth/reset-password</span>
         <pre>{
  "email": "student@example.com",
  "otp": "1234",
  "newPassword": "newpass123"
}</pre>
      </div>

    </body>
  </html>
  `;
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

module.exports = router;

