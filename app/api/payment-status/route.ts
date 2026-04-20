import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * GET /api/payment-status
 * Check if a payment for an order has been completed
 * Query: orderId - The Razorpay order ID to check
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

    // Query for Razorpay payment
    const payment = await prisma.paymentDetails.findFirst({
      where: {
        orderId: orderId,
        paymentStatus: 'success'
      },
      select: {
        id: true,
        orderId: true,
        transactionId: true,
        amount: true,
        paymentStatus: true,
        createdAt: true
      }
    });

    // If payment record exists and is successful, payment was completed
    if (payment && payment.paymentStatus === 'success') {
      console.log('✅ Payment found for order:', orderId, payment);
      
      return NextResponse.json({
        success: true,
        paymentCompleted: true,
        payment: {
          id: payment.transactionId,
          orderId: orderId,
          amount: payment.amount,
          status: payment.paymentStatus
        }
      });
    }

    // Also check if any payment record exists (even if not marked success yet due to webhook delay)
    const pendingPayment = await prisma.paymentDetails.findFirst({
      where: {
        orderId: orderId
      },
      select: {
        id: true,
        orderId: true,
        paymentStatus: true,
        createdAt: true
      }
    });

    if (pendingPayment) {
      console.log('⏳ Pending/Processing payment for order:', orderId, pendingPayment);
      
      // If it's been more than 30 seconds, consider it completed
      const createdTime = new Date(pendingPayment.createdAt).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = (currentTime - createdTime) / 1000;

      if (elapsedSeconds > 30) {
        return NextResponse.json({
          success: true,
          paymentCompleted: true,
          payment: {
            orderId: orderId,
            status: pendingPayment.paymentStatus || 'completed'
          }
        });
      }
    }

    // No payment found
    console.log('⚠️ No payment found for order:', orderId);
    
    return NextResponse.json({
      success: true,
      paymentCompleted: false,
      message: 'Payment not yet recorded'
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check payment status',
        paymentCompleted: false
      },
      { status: 500 }
    );
  }
}
