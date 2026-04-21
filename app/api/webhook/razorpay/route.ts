import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/webhook/razorpay
 * Canonical Razorpay webhook endpoint for production.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error('RAZORPAY_WEBHOOK_SECRET not set');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (!signature || signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log('Razorpay webhook event:', event.event);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      // Exact orderId row can safely carry real Razorpay payment id.
      await prisma.paymentDetails.updateMany({
        where: { orderId },
        data: {
          paymentStatus: 'success',
          transactionId: payment.id,
        },
      });

      // Multi-item records are often stored as <orderId>_<index>.
      // Keep existing transactionId values (unique constraint) and only mark success.
      await prisma.paymentDetails.updateMany({
        where: {
          orderId: {
            startsWith: `${orderId}_`,
          },
        },
        data: {
          paymentStatus: 'success',
        },
      });
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      await prisma.paymentDetails.updateMany({
        where: {
          OR: [
            { orderId },
            {
              orderId: {
                startsWith: `${orderId}_`,
              },
            },
          ],
        },
        data: {
          paymentStatus: 'failed',
        },
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Keep 200 to avoid aggressive retries for transient app issues.
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
