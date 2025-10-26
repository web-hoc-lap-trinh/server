import db from '../../config/db.js'; 
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../../utils/sendEmail.js'; 
import 'dotenv/config'; 

const JWT_SECRET = process.env.JWT_SECRET as string; 

export const registerUser = async ({ email, password, full_name }: { email: string, password: string, full_name: string }) => {
  const [users]: [any[], any] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (users.length > 0) {
    throw new Error("Email đã tồn tại");
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  const [result]: [any, any] = await db.query(
    "INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, 'student')",
    [email, hashedPassword, full_name]
  );

  const [newUser]: [any[], any] = await db.query(
    "SELECT user_id, email, full_name, role FROM users WHERE user_id = ?",
    [result.insertId]
  );

  return newUser[0];
};

export const loginUser = async ({ email, password }: { email: string, password: string }) => {
  const [users]: [any[], any] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (users.length === 0) {
    throw new Error("Email không tồn tại");
  }

  const user = users[0];
  const isMatch = await bcryptjs.compare(password, user.password_hash);
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

export const forgotPassword = async (email: string) => {
    const [users]: [any[], any] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
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

export const resetPassword = async ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) => {
    const [users]: [any[], any] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
        throw new Error("Email không tồn tại");
    }

    const user = users[0];
    if (user.reset_otp !== otp || new Date(user.reset_otp_expires) < new Date()) {
        throw new Error("OTP không hợp lệ hoặc đã hết hạn");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?",
      [hashedPassword, email]
    );
    
    const [updatedUser]: [any[], any] = await db.query(
      "SELECT user_id, email, full_name, role FROM users WHERE email = ?",
      [email]
    );

    return updatedUser[0];
};

