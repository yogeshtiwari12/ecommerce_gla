import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, amount, paymentMethod, item_product_ids, cartItems } = data;

    console.log('Payment POST Request:', { userId, amount, paymentMethod, item_product_ids, cartItems });

    if (!userId || !amount) {
      return NextResponse.json(
        { success: false, error: 'User ID and amount are required' },
        { status: 400 }
      );
    }


    const productIdsArray = Array.isArray(item_product_ids) 
      ? item_product_ids 
      : item_product_ids ? [item_product_ids] : [];

    const itemsArray = Array.isArray(cartItems) ? cartItems : [];

    if (productIdsArray.length === 0 && itemsArray.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product IDs or cart items are required' },
        { status: 400 }
      );
    }

    if (paymentMethod === 'razorpay') {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('Razorpay credentials missing');
        return NextResponse.json(
          { success: false, error: 'Payment gateway not configured' },
          { status: 500 }
        );
      }
    }

    if (paymentMethod === 'cod') {
      const orderId = `cod_${Date.now()}`;
      const baseTransactionId = Date.now();
      
      // For multiple items, create array of transaction IDs
      const paymentData = productIdsArray.length > 0 
        ? productIdsArray.map((productId, index) => ({
            orderId: `${orderId}_${index}`,
            transactionId: `txn_${baseTransactionId}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            item_product_id: productId,
          }))
        : itemsArray.map((item, index) => ({
            orderId: `${orderId}_${index}`,
            transactionId: `txn_${baseTransactionId}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            item_product_id: item.id,
            amount: item.user_product_price * item.user_product_cart_count,
          }));

      return NextResponse.json({
        success: true,
        message: 'COD orders created',
        payments: paymentData,
        userId,
        paymentAmount: Math.floor(amount),
        paymentMethod: 'cod',
      });
    }

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    console.log('Creating Razorpay order:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);

    // For multiple items, prepare payment data array
    const paymentData = productIdsArray.length > 0 
      ? productIdsArray.map((productId) => ({ item_product_id: productId }))
      : itemsArray.map((item) => ({ 
          item_product_id: item.id,
          amount: item.user_product_price * item.user_product_cart_count,
        }));

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      userId,
      item_product_ids: productIdsArray,
      cartItems: itemsArray,
      paymentData,
      paymentAmount: Math.floor(amount),
    });

  } catch (error: any) {
    console.error('Payment POST error:', {
      message: error?.message,
      code: error?.code,
      description: error?.description,
      stack: error?.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to create payment order',
        details: error?.description || error?.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}


