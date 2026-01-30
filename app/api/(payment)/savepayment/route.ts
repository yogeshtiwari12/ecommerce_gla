import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";    

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
    
    console.log('Payment PUT Request:', { razorpay_order_id, razorpay_payment_id, paymentMethod, userId, item_product_ids, cartItems });

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
    }

    // Razorpay payment verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    console.log('Signature verification:', { isAuthentic });

    if (isAuthentic) {
      // Create separate payment record for each product/cart item
      if (productIdsArray.length > 0) {
        const paymentPromises = productIdsArray.map(async (productId, index) => {
          return await prisma.paymentDetails.create({
            data: {
              userId: userId,
              orderId: `${razorpay_order_id}_${index}`,
              item_product_id: productId,
              amount: Math.floor(amount / productIdsArray.length),
              paymentMethod: 'razorpay',
              paymentStatus: 'success',
              transactionId: `${razorpay_payment_id}_${index}`,
            },
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
          return await prisma.paymentDetails.create({
            data: {
              userId: userId,
              orderId: `${razorpay_order_id}_${index}`,
              item_product_id: item.id,
              amount: Math.floor(item.user_product_price * item.user_product_cart_count),
              paymentMethod: 'razorpay',
              paymentStatus: 'success',
              transactionId: `${razorpay_payment_id}_${index}`,
            },
          });
        });

        const paymentDetails = await Promise.all(paymentPromises);

        return NextResponse.json({
          success: true,
          message: `${paymentDetails.length} payment(s) verified successfully`,
          paymentDetails,
        });
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

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