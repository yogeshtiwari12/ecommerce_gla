import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId, 
      item_product_ids, 
      cartItems,
      amount, 
      paymentMethod, 
      payments 
    } = data;

    // Handle both single item and multiple items
    const productIdsArray = Array.isArray(item_product_ids) 
      ? item_product_ids 
      : item_product_ids ? [item_product_ids] : [];

    const itemsArray = Array.isArray(cartItems) ? cartItems : [];

    if (paymentMethod === 'cod') {
      // For COD with multiple items
      if (Array.isArray(payments) && payments.length > 0) {
        const paymentPromises = payments.map(async (payment) => {
          return await prisma.paymentDetails.create({
            data: {
              userId: userId,
              orderId: payment.orderId,
              item_product_id: payment.item_product_id,
              amount: Math.floor(payment.amount || amount / payments.length),
              paymentMethod: 'cod',
              paymentStatus: 'success',
              transactionId: payment.transactionId,
            },
          });
        });

        const paymentDetails = await Promise.all(paymentPromises);

        return NextResponse.json({
          success: true,
          message: `${paymentDetails.length} COD order(s) confirmed successfully`,
          paymentDetails,
        });
      } else if (productIdsArray.length > 0) {
        // Create separate payment for each product
        const paymentPromises = productIdsArray.map(async (productId, index) => {
          const orderId = `cod_${Date.now()}_${index}`;
          const transactionId = `txn_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
          
          return await prisma.paymentDetails.create({
            data: {
              userId: userId,
              orderId: orderId,
              item_product_id: productId,
              amount: Math.floor(amount / productIdsArray.length),
              paymentMethod: 'cod',
              paymentStatus: 'success',
              transactionId: transactionId,
            },
          });
        });

        const paymentDetails = await Promise.all(paymentPromises);

        return NextResponse.json({
          success: true,
          message: `${paymentDetails.length} COD order(s) confirmed successfully`,
          paymentDetails,
        });
      } else if (itemsArray.length > 0) {
        // Create separate payment for each cart item
        const paymentPromises = itemsArray.map(async (item, index) => {
          const orderId = `cod_${Date.now()}_${index}`;
          const transactionId = `txn_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
          
          return await prisma.paymentDetails.create({
            data: {
              userId: userId,
              orderId: orderId,
              item_product_id: item.id,
              amount: Math.floor(item.user_product_price * item.user_product_cart_count),
              paymentMethod: 'cod',
              paymentStatus: 'success',
              transactionId: transactionId,
            },
          });
        });

        const paymentDetails = await Promise.all(paymentPromises);

        return NextResponse.json({
          success: true,
          message: `${paymentDetails.length} COD order(s) confirmed successfully`,
          paymentDetails,
        });
      }

      return NextResponse.json(
        { success: false, error: 'No valid product IDs or cart items provided for COD' },
        { status: 400 }
      );
    }

    let paymentStatus = 'captured';

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

      paymentStatus = payment.status;
    } catch (razorpayError) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 400 }
        );
      }
    }

    // Payment is verified — save payment records
    if (productIdsArray.length > 0) {
        const paymentPromises = productIdsArray.map(async (productId, index) => {
          return await prisma.paymentDetails.upsert({
            where: { orderId: `${razorpay_order_id}_${index}` },
            update: {
              paymentStatus: paymentStatus === 'authorized' ? 'authorized' : 'success',
              transactionId: `${razorpay_payment_id}_${index}`,
            },
            create: {
              userId: userId,
              orderId: `${razorpay_order_id}_${index}`,
              item_product_id: productId,
              amount: Math.floor(amount / productIdsArray.length),
              paymentMethod: 'razorpay',
              paymentStatus: paymentStatus === 'authorized' ? 'authorized' : 'success',
              transactionId: `${razorpay_payment_id}_${index}`,
            }
          });
        });

        const paymentDetails = await Promise.all(paymentPromises);

        return NextResponse.json({
          success: true,
          message: `${paymentDetails.length} payment(s) verified successfully`,
          paymentDetails,
        });
      } else if (itemsArray.length > 0) {
        const paymentPromises = itemsArray.map(async (item, index) => {
          return await prisma.paymentDetails.upsert({
            where: { orderId: `${razorpay_order_id}_${index}` },
            update: {
              paymentStatus: paymentStatus === 'authorized' ? 'authorized' : 'success',
              transactionId: `${razorpay_payment_id}_${index}`,
            },
            create: {
              userId: userId,
              orderId: `${razorpay_order_id}_${index}`,
              item_product_id: item.id,
              amount: Math.floor(item.user_product_price * item.user_product_cart_count),
              paymentMethod: 'razorpay',
              paymentStatus: paymentStatus === 'authorized' ? 'authorized' : 'success',
              transactionId: `${razorpay_payment_id}_${index}`,
            }
          });
        });

        const paymentDetails = await Promise.all(paymentPromises);

        return NextResponse.json({
          success: true,
          message: `${paymentDetails.length} payment(s) verified successfully`,
          paymentDetails,
        });
      }

      return NextResponse.json(
        { success: false, error: 'No valid product IDs or cart items provided for Razorpay payment' },
        { status: 400 }
      );

  } catch (error: any) {
    console.error('Payment PUT error:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    
    return NextResponse.json(
      { success: false, error: 'Payment verification failed', details: error?.message },
      { status: 500 }
    );
  }
}
