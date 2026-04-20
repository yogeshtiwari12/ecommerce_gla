import { NextResponse } from 'next/server';
import crypto from 'crypto';

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

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    console.log('Payment Verification Debug:', {
      body,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      receivedSignature: razorpay_signature,
      expectedSignature: expectedSignature,
      match: expectedSignature === razorpay_signature,
    });

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    // Signature is valid
    return NextResponse.json({
      success: true,
      message: 'Payment signature verified successfully',
      razorpay_order_id,
      razorpay_payment_id,
    });

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

