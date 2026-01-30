import { ApiResponse } from "./apiresponse";
import { transporter } from "./nodemailer";

export async function sendCancelEmail(
  name: string,
  otp: string,
  email: string
): Promise<ApiResponse> {
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
        <title>Cancel Order Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            padding: 20px;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
          }
          .header h2 {
            margin: 0;
            font-size: 20px;
            color: #059669;
          }
          .content {
            margin: 20px 0;
            font-size: 14px;
            color: #333;
          }
          .code {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 4px;
            padding: 10px;
            border: 2px dashed #059669;
            border-radius: 6px;
            margin: 20px 0;
            background: #f9f9f9;
          }
          .expiry {
            text-align: center;
            color: #b45309;
            background: #fff3cd;
            padding: 10px;
            border-radius: 6px;
            font-size: 13px;
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Order Cancellation Verification</h2>
          </div>

          <div class="content">
            <p>Hello <strong>${name || "Valued Customer"}</strong>,</p>
            <p>We received a request to cancel your order. Please use the verification code below to confirm.</p>

            <div class="code">${otp || "123456"}</div>

            <div class="expiry">
              ⏰ This code expires in <strong>10 minutes</strong>
            </div>

            <p>If you did not request this cancellation, please ignore this email and your order will remain active.</p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Company Name</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: '"Kudos" <yt781703@gmail.com>',
      to: email,
      subject: "Order Cancellation Verification Code",
      html: htmlContent,
      text: `Hello ${name}, Your verification code is: ${otp}`,
    });

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error in sendCancelEmail:", error);
    return {
      success: false,
      message: `An error occurred while sending the verification email: ${
        (error as Error).message
      }`,
    };
  }
}
