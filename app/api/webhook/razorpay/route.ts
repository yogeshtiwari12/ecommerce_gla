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

    const paymentEntity = event?.payload?.payment?.entity;
    const orderEntity = event?.payload?.order?.entity;
    const webhookOrderId = paymentEntity?.order_id || orderEntity?.id;

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = paymentEntity;
      const orderId = webhookOrderId;

      if (!orderId) {
        console.warn('Webhook success event missing orderId:', event.event);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      if (!payment?.id) {
        console.warn('Webhook success event missing payment.id for orderId:', orderId);
      }

      // Exact orderId row can safely carry real Razorpay payment id.
      const exactUpdated = await prisma.paymentDetails.updateMany({
        where: { orderId },
        data: {
          paymentStatus: 'success',
          transactionId: payment?.id,
        },
      });

      // Multi-item records are often stored as <orderId>_<index>.
      // Keep existing transactionId values (unique constraint) and only mark success.
      const indexedUpdated = await prisma.paymentDetails.updateMany({
        where: {
          orderId: {
            startsWith: `${orderId}_`,
          },
        },
        data: {
          paymentStatus: 'success',
        },
      });

      console.log('Webhook success update counts:', {
        orderId,
        event: event.event,
        exactUpdated: exactUpdated.count,
        indexedUpdated: indexedUpdated.count,
      });
    }

    if (event.event === 'payment.failed') {
      const orderId = webhookOrderId;
      const payment = paymentEntity;

      if (!orderId) {
        console.warn('Webhook failure event missing orderId:', event.event);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const failedUpdated = await prisma.paymentDetails.updateMany({
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

      console.log('Webhook failure update count:', {
        orderId,
        event: event.event,
        updated: failedUpdated.count,
      });

      console.log('Razorpay failure details:', {
        orderId,
        paymentId: payment?.id,
        status: payment?.status,
        method: payment?.method,
        amount: payment?.amount,
        errorCode: payment?.error_code,
        errorDescription: payment?.error_description,
        errorReason: payment?.error_reason,
        errorStep: payment?.error_step,
        errorSource: payment?.error_source,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Keep 200 to avoid aggressive retries for transient app issues.
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
