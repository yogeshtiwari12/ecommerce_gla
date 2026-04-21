import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    console.log('Received payment verification request:', {         
      razorpay_order_id,  
      razorpay_payment_id,  
      razorpay_signature, 
    }); 

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    // Check if secret exists
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('RAZORPAY_KEY_SECRET is not set');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    try {
      const paymentDetails = await razorpay.orders.fetchPayments(razorpay_order_id);
      const payment = paymentDetails.items.find(item => item.id === razorpay_payment_id);

      if (!payment) {
        return NextResponse.json(
          { success: false, error: 'Payment not found in Razorpay records' },
          { status: 400 }
        );
      }

      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        return NextResponse.json(
          {
            success: false,
            error: 'Payment verification failed',
            details: `Payment status is ${payment.status}`,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        razorpay_order_id,
        razorpay_payment_id,
        paymentStatus: payment.status,
      });
    } catch (razorpayError) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest('hex');

      const isValid = expectedSignature === razorpay_signature;

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Payment signature verification failed' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payment signature verified successfully',
        razorpay_order_id,
        razorpay_payment_id,
      });
    }

  } catch (error: any) {
    console.error('Payment verification error:', {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment verification failed',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

