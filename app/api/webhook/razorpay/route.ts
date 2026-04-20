import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/webhook/razorpay
 *
 * Handles Razorpay webhook events.
 * Configure in Razorpay Dashboard → Settings → Webhooks:
 *   URL: https://yourdomain.com/api/webhook/razorpay
 *   Events: payment.captured, payment.failed, order.paid
 *   Secret: set RAZORPAY_WEBHOOK_SECRET in your .env
 *
 * This is the most reliable way to confirm UPI / QR payments
 * because the browser handler() callback is NOT guaranteed to fire
 * for async payment methods.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // ── Verify webhook signature ──────────────────────────────────────────────
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error('RAZORPAY_WEBHOOK_SECRET not set');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log('📨 Razorpay webhook event:', event.event);

    // ── Handle payment.captured (UPI QR, cards, netbanking, wallets) ──────────
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;

      console.log('💰 Payment captured:', {
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount / 100,
        method: payment.method,
      });

      // Update existing payment record marked as success
      // Record was created during checkout via savePayment Redux action
      await prisma.paymentDetails.updateMany({
        where: { orderId: payment.order_id },
        data: {
          paymentStatus: 'success',
          transactionId: payment.id,
        },
      });

      console.log('✅ Payment record saved for order:', payment.order_id);
    }

    // ── Handle payment.failed ─────────────────────────────────────────────────
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;

      console.warn('❌ Payment failed:', {
        paymentId: payment.id,
        orderId: payment.order_id,
        errorCode: payment.error_code,
        errorDescription: payment.error_description,
      });

      // Update existing record to mark as failed
      await prisma.paymentDetails.updateMany({
        where: { orderId: payment.order_id },
        data: { paymentStatus: 'failed' },
      });
    }

    // ── Handle order.paid (fires after all payments for an order succeed) ─────
    if (event.event === 'order.paid') {
      const order = event.payload.order.entity;
      const payment = event.payload.payment.entity;

      console.log('🎉 Order fully paid:', order.id);

      // Update existing record to mark as success
      await prisma.paymentDetails.updateMany({
        where: { orderId: order.id },
        data: {
          paymentStatus: 'success',
          transactionId: payment.id,
        },
      });
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 so Razorpay doesn't keep retrying on our bugs
    return NextResponse.json({ received: true, error: 'Internal processing error' }, { status: 200 });
  }
}
