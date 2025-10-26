"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = require("nodemailer");
require("dotenv/config");
const transporter = (0, nodemailer_1.createTransport)({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
/**
 * Hàm gửi email
 * @param to Địa chỉ email người nhận (hoặc một mảng email)
 * @param subject Chủ đề email
 * @param text Nội dung email (dạng text thuần)
 */
async function sendEmail(to, subject, text) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    });
}
exports.default = sendEmail;
