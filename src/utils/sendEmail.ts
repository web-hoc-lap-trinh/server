import { createTransport } from "nodemailer";
import 'dotenv/config';

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  },
});

/**
 * Hàm gửi email
 * @param to Địa chỉ email người nhận (hoặc một mảng email)
 * @param subject Chủ đề email
 * @param text Nội dung email (dạng text thuần)
 */
async function sendEmail(
  to: string | string[],
  subject: string,
  text: string
): Promise<void> { 
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER as string,
    to,
    subject,
    text,
  });
}

export default sendEmail;