import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * GET /api/payment-status?orderId=<razorpay_order_id>
 *
 * Priority:
 *  1. Check our DB for a confirmed payment
 *  2. Fetch the order status directly from Razorpay API
 *
 * The old "30-second timeout" trick has been removed — it was marking
 * failed / abandoned payments as successful.
 */
export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking payment status for orderId:', orderId);

    // ── 1. Check our own database first ────────────────────────────────────────
    const payment = await prisma.paymentDetails.findFirst({
      where: {
        paymentStatus: 'success',
        OR: [
          { orderId: orderId },
          {
            orderId: {
              startsWith: `${orderId}_`,
            },
          },
        ],
      },
      select: {
        id: true,
        orderId: true,
        transactionId: true,
        amount: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    if (payment) {
      console.log('✅ Payment found in DB for order:', orderId);
      return NextResponse.json({
        success: true,
        paymentCompleted: true,
        source: 'database',
        payment: {
          id: payment.transactionId,
          orderId: payment.orderId,
          amount: payment.amount,
          status: payment.paymentStatus,
        },
      });
    }

    // ── 2. Not in DB yet — ask Razorpay directly ────────────────────────────────
    // This handles async UPI / QR where order.status may remain 'attempted'
    // briefly even though a payment has already been captured.
    try {
      console.log('📡 Fetching order status from Razorpay for:', orderId);
      const razorpayOrder = await razorpay.orders.fetch(orderId);

      console.log('📋 Razorpay order status:', razorpayOrder.status);

      const payments = await razorpay.orders.fetchPayments(orderId);
      const successfulPayment = (payments.items as any[]).find(
        (p: any) => p.status === 'captured' || p.status === 'authorized'
      );

      if (successfulPayment) {
        const normalizedStatus = successfulPayment.status === 'authorized' ? 'authorized' : 'success';

        // Update existing records only; savepayment creates records.
        await prisma.paymentDetails.updateMany({
          where: { orderId: orderId },
          data: {
            paymentStatus: normalizedStatus,
            transactionId: successfulPayment.id,
          },
        });

        await prisma.paymentDetails.updateMany({
          where: {
            orderId: {
              startsWith: `${orderId}_`,
            },
          },
          data: {
            paymentStatus: normalizedStatus,
          },
        });

        console.log('✅ Payment confirmed via Razorpay payments API:', successfulPayment.status);
        return NextResponse.json({
          success: true,
          paymentCompleted: true,
          source: 'razorpay-payments',
          payment: {
            id: successfulPayment.id,
            orderId: orderId,
            status: successfulPayment.status,
          },
        });
      }

      if (razorpayOrder.status === 'paid') {
        let confirmedPaymentId: string | undefined;

        // Payment confirmed by Razorpay order state. Fetch captured payment ID.
        try {
          const capturedPayment = (payments.items as any[]).find((p: any) => p.status === 'captured');

          if (capturedPayment) {
            confirmedPaymentId = capturedPayment.id;

            // Only update existing records, don't create
            await prisma.paymentDetails.updateMany({
              where: { orderId: orderId },
              data: {
                paymentStatus: 'success',
                transactionId: capturedPayment.id,
              },
            });

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
            console.log('✅ Payment record updated from Razorpay fetch');
          }
        } catch (upsertErr) {
          // Non-fatal — we still return paymentCompleted: true
          console.warn('Could not update payment record:', upsertErr);
        }

        return NextResponse.json({
          success: true,
          paymentCompleted: true,
          source: 'razorpay',
          payment: {
            id: confirmedPaymentId,
            orderId: orderId,
            status: razorpayOrder.status,
          },
        });
      }

      // Order exists but not yet paid (created / attempted)
      return NextResponse.json({
        success: true,
        paymentCompleted: false,
        razorpayStatus: razorpayOrder.status,
        message: 'Payment not yet completed',
      });

    } catch (razorpayErr: any) {
      // Razorpay API error (bad key, network, etc.)
      console.error('Razorpay fetch error:', razorpayErr?.error || razorpayErr);

      return NextResponse.json({
        success: false,
        paymentCompleted: false,
        error: 'Could not fetch order status from payment gateway',
      });
    }

  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check payment status',
        paymentCompleted: false,
      },
      { status: 500 }
    );
  }
}