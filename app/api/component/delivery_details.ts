import { ApiResponse } from "./apiresponse";
import { transporter } from "./nodemailer";

interface DeliveryDetails {
  orderId: string;
  orderDate: string;
  estimatedDelivery?: string;
  customerName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pinCode: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  product_name?: string;
  user_product_category?: string;
  user_product_description?: string;
  user_product_imageUrl?: string;
  user_product_price?: string;
  user_name: string;
  user_email: string;
}

export async function sendDeliveryEmail(
  details: DeliveryDetails,
  email: string
): Promise<ApiResponse> {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, message: "Invalid email address" };
    }
  
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 3);
    const estimatedDeliveryStr = estimatedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const isMultipleItems = details.items && details.items.length > 1;
    
    // Fix: Parse price correctly from the formatted string
    const totalAmount = details.items.reduce((sum, item) => {
      const priceStr = item.price.replace('₹', '').replace(/,/g, '');
      const price = parseFloat(priceStr);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Out for Delivery</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #374151; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
          .header { background-color: #059669; padding: 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 30px; }
          .order-meta { display: block; margin-bottom: 25px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
          .order-meta span { display: block; margin-bottom: 6px; }
          .hero-image { width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
          .card { background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .card-title { font-weight: 700; color: #111827; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
          .address-line { margin: 4px 0; font-size: 14px; line-height: 1.5; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { text-align: left; font-size: 12px; color: #6b7280; padding: 10px; border-bottom: 2px solid #e5e7eb; }
          .items-table td { padding: 12px 10px; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
          .total-row { font-weight: 700; background: #f9fafb; }
          .btn { display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isMultipleItems ? 'Your Products are' : 'Your Product is'} on the way!</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Order #${details.orderId}</p>
          </div>

          <div class="content">
            <div class="order-meta flex">
              <span>Date: ${details.orderDate}</span>
              <span>Est. Delivery: ${estimatedDeliveryStr}</span>
            </div>

            <p>Hi <strong>${details.user_name || details.customerName || "Customer"}</strong>,</p>
            <p>Great news! Your ${isMultipleItems ? 'items have' : 'item has'} been shipped and ${isMultipleItems ? 'are' : 'is'} making ${isMultipleItems ? 'their' : 'its'} way to you.</p>

            ${!isMultipleItems && details.user_product_imageUrl ? 
              `<img src="${details.user_product_imageUrl}" class="hero-image" alt="Product Image">` : ''}

            <div class="card">
              <div class="card-title">Delivery Address</div>
              <div class="address-line"><strong>${details.user_name || details.customerName}</strong></div>
              <div class="address-line">${details.streetAddress}</div>
              <div class="address-line">${details.city}, ${details.state} ${details.pinCode}</div>
              <div class="address-line">📞 ${details.phoneNumber}</div>
            </div>

            <div class="card-title">Order Summary</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${details.items.map(item => `
                  <tr>
                    <td><strong>${item.name}</strong></td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${item.price}</td>
                  </tr>`).join('')}
                <tr class="total-row">
                  <td colspan="2" style="text-align: right;">Total:</td>
                  <td style="text-align: right;">₹${totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            ${!isMultipleItems && details.user_product_description ? `
            <p style="font-size: 13px; color: #6b7280; margin-top: 30px;">
                <strong>Note:</strong> ${details.user_product_description}
            </p>` : ''}
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Brand Name. All rights reserved.</p>
            <p>Need help? Contact our support team at support@yourbrand.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `Your order #${details.orderId} is on the way! Est Delivery: ${estimatedDeliveryStr}. Address: ${details.streetAddress}, ${details.city}.`;

    await transporter.sendMail({
      from: '"Kudos" <yt781703@gmail.com>',
      to: email,
      subject: `🚚 Update: Your Order #${details.orderId} has shipped!`,
      html: htmlContent,
      text: textContent,
    });

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, message: "Failed to send email" };
  }
}