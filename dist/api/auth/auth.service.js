"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.loginUser = exports.registerUser = void 0;
const db_js_1 = __importDefault(require("../../config/db.js"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_js_1 = __importDefault(require("../../utils/sendEmail.js"));
require("dotenv/config");
const JWT_SECRET = process.env.JWT_SECRET;
const registerUser = async ({ email, password, full_name }) => {
    const [users] = await db_js_1.default.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length > 0) {
        throw new Error("Email đã tồn tại");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const [result] = await db_js_1.default.query("INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, 'student')", [email, hashedPassword, full_name]);
    const [newUser] = await db_js_1.default.query("SELECT user_id, email, full_name, role FROM users WHERE user_id = ?", [result.insertId]);
    return newUser[0];
};
exports.registerUser = registerUser;
const loginUser = async ({ email, password }) => {
    const [users] = await db_js_1.default.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
        throw new Error("Email không tồn tại");
    }
    const user = users[0];
    const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error("Sai mật khẩu");
    }
    const token = jsonwebtoken_1.default.sign({ user_id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
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
exports.loginUser = loginUser;
const forgotPassword = async (email) => {
    const [users] = await db_js_1.default.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
        throw new Error("Email không tồn tại");
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    await db_js_1.default.query("UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?", [otp, expires, email]);
    await (0, sendEmail_js_1.default)(email, "Reset mật khẩu", `Mã OTP của bạn là: ${otp}`);
    return { message: "OTP đã được gửi qua email" };
};
exports.forgotPassword = forgotPassword;
const resetPassword = async ({ email, otp, newPassword }) => {
    const [users] = await db_js_1.default.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
        throw new Error("Email không tồn tại");
    }
    const user = users[0];
    if (user.reset_otp !== otp || new Date(user.reset_otp_expires) < new Date()) {
        throw new Error("OTP không hợp lệ hoặc đã hết hạn");
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    await db_js_1.default.query("UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?", [hashedPassword, email]);
    const [updatedUser] = await db_js_1.default.query("SELECT user_id, email, full_name, role FROM users WHERE email = ?", [email]);
    return updatedUser[0];
};
exports.resetPassword = resetPassword;
