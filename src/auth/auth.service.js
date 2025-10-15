const db = require("../config/db"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail"); 
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async ({ email, password, full_name }) => {
  const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (users.length > 0) {
    throw new Error("Email đã tồn tại");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    "INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, 'student')",
    [email, hashedPassword, full_name]
  );

  const [newUser] = await db.query(
    "SELECT user_id, email, full_name, role FROM users WHERE user_id = ?",
    [result.insertId]
  );

  return newUser[0];
};

const loginUser = async ({ email, password }) => {
  const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (users.length === 0) {
    throw new Error("Email không tồn tại");
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Sai mật khẩu");
  }

  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  };
};

const forgotPassword = async (email) => {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
        throw new Error("Email không tồn tại");
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); 

    await db.query(
      "UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?",
      [otp, expires, email]
    );

    await sendEmail(email, "Reset mật khẩu", `Mã OTP của bạn là: ${otp}`);
    return { message: "OTP đã được gửi qua email" };
};

const resetPassword = async ({ email, otp, newPassword }) => {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
        throw new Error("Email không tồn tại");
    }

    const user = users[0];
    if (user.reset_otp !== otp || new Date(user.reset_otp_expires) < new Date()) {
        throw new Error("OTP không hợp lệ hoặc đã hết hạn");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?",
      [hashedPassword, email]
    );
    
    const [updatedUser] = await db.query(
      "SELECT user_id, email, full_name, role FROM users WHERE email = ?",
      [email]
    );

    return updatedUser[0];
};


module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};