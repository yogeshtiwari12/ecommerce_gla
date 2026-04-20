import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/webhooks/razorpay
 * Webhook endpoint for Razorpay payment confirmations
 * This marks payments as successful in the database when webhook is received
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-razorpay-signature');

    console.log('🔔 Razorpay webhook received:', body.event);

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (generated_signature !== signature) {
      console.error('❌ Webhook signature verification failed');
      return NextResponse.json(
        { success: false, error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    // Handle payment authorized event
    if (body.event === 'payment.authorized') {
      const payment = body.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      console.log(`✅ Payment authorized for order: ${orderId}, Payment: ${paymentId}`);

      // Update payment status in database
      const updatedPayment = await prisma.paymentDetails.updateMany({
        where: {
          orderId: orderId
        },
        data: {
          paymentStatus: 'success',
          transactionId: paymentId,
          updatedAt: new Date()
        }
      });

      console.log(`📝 Updated ${updatedPayment.count} payment records for order: ${orderId}`);

      return NextResponse.json({ success: true, message: 'Payment recorded' }, { status: 200 });
    }

    // Handle payment failed event
    if (body.event === 'payment.failed') {
      const payment = body.payload.payment.entity;
      const orderId = payment.order_id;

      console.log(`❌ Payment failed for order: ${orderId}`);

      await prisma.paymentDetails.updateMany({
        where: {
          orderId: orderId
        },
        data: {
          paymentStatus: 'failed',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({ success: true, message: 'Payment failure recorded' }, { status: 200 });
    }

    // Acknowledge other webhook events
    return NextResponse.json({ success: true, message: 'Event received' }, { status: 200 });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
