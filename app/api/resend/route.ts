import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

// HTML Email Template
const createEmailHTML = (customerName: string, orderNumber: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4F46E5; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmation</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">
              Hi <strong>${customerName}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for your order! Your order <strong>#${orderNumber}</strong> has been confirmed 
              and is being processed.
            </p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; font-size: 18px; margin-top: 0; margin-bottom: 16px;">
                Order Details
              </h2>
              <p style="color: #6b7280; margin: 10px 0;">
                Order Number: <strong style="color: #1f2937;">${orderNumber}</strong>
              </p>
              <p style="color: #6b7280; margin: 10px 0;">
                Date: <strong style="color: #1f2937;">${new Date().toLocaleDateString()}</strong>
              </p>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                💡 <strong>Tip:</strong> You'll receive another email once your order ships!
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              If you have any questions, feel free to reply to this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
              © 2024 Your Store. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toEmail, customerName, orderNumber } = body;

    // Validate input
    if (!toEmail) {
      return NextResponse.json(
        { error: 'Email recipient is required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Your Store <onboarding@resend.dev>',
      to: [toEmail],
      subject: `Order Confirmation - ${orderNumber || 'TEST-001'}`,
      html: createEmailHTML(
        customerName || 'Valued Customer',
        orderNumber || 'TEST-001'
      ),
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Email sent successfully!' 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Email API is running',
    instructions: {
      from: {
        testing: 'onboarding@resend.dev (default Resend domain)',
        production: 'orders@yourdomain.com (must verify domain in Resend)'
      },
      to: {
        testing: 'delivered@resend.dev (Resend test inbox)',
        production: 'customer@email.com (actual customer email)'
      },
      testRequest: {
        method: 'POST',
        body: {
          toEmail: 'delivered@resend.dev',
          customerName: 'John Doe',
          orderNumber: 'ORD-123456'
        }
      }
    }
  });
}