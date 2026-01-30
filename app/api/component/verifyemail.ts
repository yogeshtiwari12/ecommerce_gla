import { ApiResponse } from "./apiresponse";
import { transporter } from "./nodemailer";


export async function sendVerificationEmail(
  name: string,
  otp: string,
  email: string
): Promise<ApiResponse>{
  try {
    if (!email || !email.includes("@") || !email.includes(".")) {
      console.error("Invalid email format:", email);
      return {
        success: false,
        message: "Invalid email address format",
      };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          .code {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            letter-spacing: 5px;
            color: #4F46E5;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            text-align: center;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Email Verification</h2>
          </div>
          <p>Hello ${name},</p>
          <p>Thank you for signing up. Please use the verification code below to complete your registration:</p>
          <div class="code">${otp}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;


  await transporter.sendMail({
      from: '"kudos" <yt781703@gmail.com>',
      to: email,
      subject: "Your Verification Code",
      html: htmlContent,
      text: `Hello r ${name}, Your verification code is: ${otp}`,
    });


    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error);
    return {
      success: false,
      message: `An error occurred while sending the verification email: ${
        (error as Error).message
      }`,
    };
  }
}