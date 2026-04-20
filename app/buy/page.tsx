"use client";
import { ShoppingBag, CreditCard, Lock, MapPin, Phone, Check, Shield, Package, Truck, Wallet, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { buy_data, createOrder, verifyPayment, savePayment, createUserProduct } from '@/app/redux/product';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import OrderSuccessModal from '@/app/components/OrderSuccessModal';

export default function CheckoutPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { buyData, loading } = useSelector((state: RootState) => state.product);
  
  const searchParams = useSearchParams();
  const isCartCheckout = searchParams.get('cart') === 'true';
  const pid = searchParams.get('pid') || '';

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setIsRazorpayLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isCartCheckout) {
      // Fetch cart items
      fetchCartItems();
    } else if (pid) {
      dispatch(buy_data(pid));
    }
  }, [dispatch, pid, isCartCheckout]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (data.success) {
        const items = data.user_shop_data?.filter((item: any) => item.cartItem === true) || [];
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  // Add helper to check if product already exists as order
  const checkIfProductOrdered = async (productId: string, userId: string) => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (data.success) {
        const orderedProduct = data.user_shop_data?.find((item: any) => 
          item.productId === productId && 
          item.isorderConfirmbyUser === true &&
          item.userId === userId
        );
        return orderedProduct || null;
      }
      return null;
    } catch (error) {
      console.error('Error checking product:', error);
      return null;
    }
  };

  const product = isCartCheckout ? null : buyData?.buy_data;
  const subtotal = isCartCheckout 
    ? cartItems.reduce((acc, item) => acc + (item.user_product_price * item.user_product_cart_count), 0)
    : (product?.price || 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const saveShippingAddress = async () => {
    try {
      const productIds = isCartCheckout 
        ? cartItems.map(item => item.id || item._id)
        : [pid];

      console.log('Saving address for product IDs:', productIds);

      const response = await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formData.phone,
          streetAddress: formData.address,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pincode,
          product_ids: productIds
        })
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Address API Error:', data);
        throw new Error(data.error || 'Failed to save address');
      }
      
      console.log('Addresses saved successfully:', data);
      return data.data;
    } catch (error: any) {
      console.error('Address save error:', error);
      alert(`Failed to save address: ${error.message}`);
      throw error;
    }
  };

  const createBulkUserProduct = async () => {
    try {
      const response = await fetch('/api/user-product', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cartItems.map(item => ({
            product_name: item.product_name,
            user_product_description: item.user_product_description,
            user_product_price: item.user_product_price,
            user_product_category: item.user_product_category,
            user_product_item_id: item.user_product_item_id,
            user_product_imageUrl: item.user_product_imageUrl,
            user_product_cart_count: item.user_product_cart_count,
            id: item.id,
          })),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to create bulk order');
      }
      return data;
    } catch (error) {
      console.error('Error creating bulk order:', error);
      throw error;
    }
  };

  const {data:session} = useSession();    

  const handleRazorpayPayment = async (userId: string) => {
    let paymentTimeout: NodeJS.Timeout | null = null;
    
    try {
      if (!isRazorpayLoaded) {
        alert('Payment gateway is loading. Please try again in a moment.');
        setIsProcessing(false);
        return;
      }

      const log: Array<{step: string, time: string, status: string}> = [];
      
      // Step 1: Create Order
      const step1Time = new Date().toLocaleTimeString();
      log.push({step: 'Creating Razorpay Order', time: step1Time, status: '⏳'});

      // Get all product IDs for cart or single product
      const itemProductIds = isCartCheckout 
        ? cartItems.map(item => item.id || item._id)
        : [pid];

      const orderAction = await dispatch(createOrder({
        userId,
        amount: total,
        paymentMethod: 'razorpay',
        item_product_ids: itemProductIds,
        cartItems: isCartCheckout ? cartItems : undefined
      }));

      if (createOrder.rejected.match(orderAction)) {
        throw new Error(orderAction.error.message || 'Failed to create payment order');
      }
      const orderData = orderAction.payload;

      const step1EndTime = new Date().toLocaleTimeString();
      log[0].status = '✅';
      log.push({step: 'Opening Payment Gateway', time: step1EndTime, status: '✅'});

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Premium Store",
        description: isCartCheckout 
          ? `Cart Checkout - ${cartItems.length} items` 
          : `Order Payment - ${product?.name || 'Product'}`,
        order_id: orderData.orderId,
        timeout: 600,
        upi: {
          flow: 'qr'
        },
        method: {
          upi: true,
          netbanking: true,
          card: true,
          wallet: true
        },
        
        handler: async function (response: any) {
          try {
            // Step 2: Payment Completed
            const step2Time = new Date().toLocaleTimeString();
            log.push({step: 'Payment Completed by User', time: step2Time, status: '✅'});
            log.push({step: 'Verifying Payment Signature', time: step2Time, status: '⏳'});

            // Step 3: Verify signature (with retry for network delays)
            let verifyAction;
            let verifyRetries = 0;
            
            while (verifyRetries < 3) {
              try {
                verifyAction = await dispatch(verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }));
                
                if (verifyPayment.fulfilled.match(verifyAction)) {
                  break; // Success
                } else {
                  verifyRetries++;
                  if (verifyRetries < 3) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Retry after 2s
                  }
                }
              } catch (error) {
                verifyRetries++;
                if (verifyRetries < 3) {
                  await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                  throw error;
                }
              }
            }

            if (!verifyPayment.fulfilled.match(verifyAction)) {
              throw new Error('Payment signature verification failed after retries');
            }

            log[log.length - 1].status = '✅';
            log.push({step: 'Saving Payment Details', time: step2Time, status: '⏳'});

            // Step 4: Save Payment
            const saveAction = await dispatch(savePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: orderData.userId,
              item_product_ids: itemProductIds,
              cartItems: isCartCheckout ? cartItems : undefined,
              amount: orderData.paymentAmount,
              paymentMethod: 'razorpay'
            }));

            const step3Time = new Date().toLocaleTimeString();
            
            if (savePayment.fulfilled.match(saveAction)) {
              log[log.length - 1].status = '✅';
              log.push({step: 'Creating Order Record', time: step3Time, status: '⏳'});

              if (isCartCheckout) {
                const bulkResult = await createBulkUserProduct();
                if (bulkResult.success) {
                  log[log.length - 1].status = '✅';
                  
                  setOrderDetails({
                    paymentId: response.razorpay_payment_id,
                    orderId: orderData.orderId,
                    amount: total,
                    paymentMethod: 'Razorpay',
                    timeline: log,
                    productName: `${cartItems.length} Items`,
                    productImage: undefined
                  });
                  setShowSuccessModal(true);
                  
                  // Redirect to profile after 2 seconds
                  setTimeout(() => {
                    window.location.href = '/profile';
                  }, 2000);
                } else {
                  throw new Error('Failed to create bulk order');
                }
              } else {
                // Check if product already ordered BEFORE calling createUserProduct
                const existingOrder = await checkIfProductOrdered(pid, userId);
                
                if (existingOrder) {
                  // Product already exists - just update count via API
                  const updateResponse = await fetch('/api/user-product', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      product_name: product?.name,
                      user_product_description: product?.description,
                      user_product_price: product?.price,
                      user_product_category: product?.category,
                      user_product_item_id: pid,
                      user_product_imageUrl: product?.imageUrl,
                    })
                  });
                  
                  const updateData = await updateResponse.json();
                  
                  if (updateData.success) {
                    log[log.length - 1].status = '✅';
                    console.log('✅ Product quantity updated (already ordered)');
                  }
                } else {
                  // Product doesn't exist - create new order
                  const productResult = await dispatch(createUserProduct({
                    product_name: product?.name,
                    user_product_description: product?.description,
                    user_product_price: product?.price,
                    user_product_category: product?.category,
                    user_product_item_id: pid,
                    user_product_imageUrl: product?.imageUrl,
                  }));
                  
                  if (createUserProduct.fulfilled.match(productResult)) {
                    log[log.length - 1].status = '✅';
                    console.log('✅ New order created');
                  } else {
                    throw new Error('Failed to create order');
                  }
                }
                
                setOrderDetails({
                  paymentId: response.razorpay_payment_id,
                  orderId: orderData.orderId,
                  amount: total,
                  paymentMethod: 'Razorpay',
                  timeline: log,
                  productName: product?.name,
                  productImage: product?.imageUrl
                });
                setShowSuccessModal(true);
              }
            } else {
              alert(`❌ Payment verification failed!\n\nIf amount was deducted, please contact support.`);
            }
          } catch (error) {
            console.error('Payment handler error:', error);
            alert(`❌ Error: ${error}`);
          } finally {
            if (paymentTimeout) clearTimeout(paymentTimeout);
            setIsProcessing(false);
          }
        },
        
        modal: {
          onclose: async function() {
            console.log('Payment modal closed - checking payment status');
            
            // Poll for payment status since webhook might be delayed
            let pollAttempts = 0;
            const maxPolls = 12; // Poll up to 60 seconds (5s interval)
            let paymentConfirmed = false;
            
            while (pollAttempts < maxPolls && !paymentConfirmed) {
              try {
                const response = await fetch(`/api/payment-status?orderId=${orderData.orderId}`);
                const data = await response.json();
                
                if (data.paymentCompleted) {
                  console.log('✅ Payment confirmed in database');
                  paymentConfirmed = true;
                  setShowSuccessModal(true);
                  setOrderDetails({
                    paymentId: 'pending_webhook',
                    orderId: orderData.orderId,
                    amount: total,
                    paymentMethod: 'Razorpay',
                    timeline: [],
                    productName: isCartCheckout ? `${cartItems.length} Items` : product?.name,
                    productImage: isCartCheckout ? undefined : product?.imageUrl
                  });
                  setTimeout(() => window.location.href = '/profile', 2000);
                  break;
                }
                
                pollAttempts++;
                if (pollAttempts < maxPolls) {
                  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before next poll
                }
              } catch (error) {
                console.error('Poll error:', error);
                pollAttempts++;
                if (pollAttempts < maxPolls) {
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              }
            }
            
            if (!paymentConfirmed) {
              console.warn('Payment status unclear after polling');
              alert('⏳ Payment processing...\n\nIf deducted, it will be confirmed shortly. Check your profile.');
            }
            
            if (paymentTimeout) clearTimeout(paymentTimeout);
            setIsProcessing(false);
          }
        },
      
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          contact: formData.phone
        },
        
        notes: {
          order_type: isCartCheckout ? 'cart' : 'single_product',
          products: isCartCheckout ? cartItems.length : 1
        }
      
      };

      // @ts-ignore
      if (typeof window.Razorpay !== 'undefined') {
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay SDK not loaded');
      }
    } catch (error) {
      if (paymentTimeout) clearTimeout(paymentTimeout);
      console.error('Razorpay payment error:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`❌ Payment failed: ${errorMessage}\n\nIf amount was deducted, please contact support.`);
      setIsProcessing(false);
    }
  };

  const handlepayment = async (userId: string) => {
    try {
      const log: Array<{step: string, time: string, status: string}> = [];
      
      // Step 1
      const step1Time = new Date().toLocaleTimeString();
      log.push({step: 'Creating COD Order', time: step1Time, status: '⏳'});

      // Get all product IDs for cart or single product
      const itemProductIds = isCartCheckout 
        ? cartItems.map(item => item.id || item._id)
        : [pid];

      const orderAction = await dispatch(createOrder({
        userId,
        amount: total,
        paymentMethod: 'cod',
        item_product_ids: itemProductIds,
        cartItems: isCartCheckout ? cartItems : undefined
      }));

      if (createOrder.rejected.match(orderAction)) {
        throw new Error(orderAction.error.message || 'Failed to create COD order');
      }
      const data = orderAction.payload;

      const step1EndTime = new Date().toLocaleTimeString();
      log[0].status = '✅';
      log.push({step: 'Saving Payment Details', time: step1EndTime, status: '⏳'});


      const saveAction = await dispatch(savePayment({
        paymentMethod: 'cod',
        payments: data.payments,
        userId: data.userId,
        item_product_ids: itemProductIds,
        cartItems: isCartCheckout ? cartItems : undefined,
        amount: data.paymentAmount
      }));

      const step2Time = new Date().toLocaleTimeString();
      
      if (savePayment.fulfilled.match(saveAction)) {
        log[log.length - 1].status = '✅';
        log.push({step: 'Creating Order Record', time: step2Time, status: '⏳'});

        if (isCartCheckout) {
          const bulkResult = await createBulkUserProduct();
          if (bulkResult.success) {
            log[log.length - 1].status = '✅';
            
            setOrderDetails({
              orderId: data.orderId,
              amount: total,
              paymentMethod: 'Cash on Delivery',
              timeline: log,
              productName: `${cartItems.length} Items`,
              productImage: undefined
            });
            setShowSuccessModal(true);
            
            setTimeout(() => {
              window.location.href = '/profile';
            }, 2000);
          } else {
            throw new Error('Failed to create bulk order');
          }
        } else {
          // Check if product already ordered BEFORE calling createUserProduct
          const existingOrder = await checkIfProductOrdered(pid, userId);
          
          if (existingOrder) {
            // Product already exists - just update count
            const updateResponse = await fetch('/api/user-product', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_name: product?.name,
                user_product_description: product?.description,
                user_product_price: product?.price,
                user_product_category: product?.category,
                user_product_item_id: pid,
                user_product_imageUrl: product?.imageUrl,
              })
            });
            
            const updateData = await updateResponse.json();
            
            if (updateData.success) {
              log[log.length - 1].status = '✅';
              console.log('✅ Product quantity updated (already ordered)');
            }
          } else {
            // Product doesn't exist - create new order
            const productResult = await dispatch(createUserProduct({
              product_name: product?.name,
              user_product_description: product?.description,
              user_product_price: product?.price,
              user_product_category: product?.category,
              user_product_item_id: pid,
              user_product_imageUrl: product?.imageUrl,
            }));
            
            if (createUserProduct.fulfilled.match(productResult)) {
              log[log.length - 1].status = '✅';
              console.log('✅ New order created');
            } else {
              throw new Error('Failed to create order');
            }
          }

          setOrderDetails({
            orderId: data.orderId,
            amount: total,
            paymentMethod: 'Cash on Delivery',
            timeline: log,
            productName: product?.name,
            productImage: product?.imageUrl
          });
          setShowSuccessModal(true);
        }
      } else {
        throw new Error('Failed to save payment');
      }
    } catch (error) {
      console.error('COD order error:', error);
      alert(`❌ ORDER FAILED\n\n${error}`);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      alert('Please fill in all required fields');
      return;
    }

    if (!session?.user?.id) {
      alert('Please login to continue');
      return;
    }

    if (selectedPaymentMethod === 'razorpay' && !isRazorpayLoaded) {
      alert('Payment gateway is still loading. Please wait a moment.');
      return;
    }

    setIsProcessing(true);

    try {
      await saveShippingAddress();
      const userId = session.user.id;

      if (selectedPaymentMethod === 'razorpay') {
        // Don't await - Razorpay handler manages the flow
        await handleRazorpayPayment(userId);
        // isProcessing is set to false in the handler/modal dismiss
      } else if (selectedPaymentMethod === 'cod') {
        await handlepayment(userId);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('An error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  if (loading && !isCartCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isCartCheckout && (!buyData || !product)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">No product data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Success Modal Component */}
      <OrderSuccessModal 
        show={showSuccessModal}
        orderDetails={orderDetails}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Header Section */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Secure Checkout</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-success font-medium hidden sm:inline">Cart</span>
            </div>
            <div className="w-12 h-0.5 bg-success"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center text-sm">
                2
              </div>
              <span className="text-foreground font-medium hidden sm:inline">Checkout</span>
            </div>
            <div className="w-12 h-0.5 bg-muted"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground font-semibold flex items-center justify-center text-sm">
                3
              </div>
              <span className="text-muted-foreground hidden sm:inline">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="bg-primary/10 border-b border-primary/30 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/30">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {isCartCheckout ? 'Cart Items' : 'Product Details'}
                    </h2>
                    <p className="text-sm text-muted-foreground">Review your order</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isCartCheckout ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id || item._id} className="flex gap-4 p-4 bg-muted rounded-lg border border-border">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {item.user_product_imageUrl ? (
                            <img
                              src={item.user_product_imageUrl}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                              {item.product_name?.charAt(0) || 'P'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{item.product_name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{item.user_product_category}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Qty: {item.user_product_cart_count}</span>
                            <span className="font-bold text-success">₹{(item.user_product_price * item.user_product_cart_count).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : product ? (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-64 h-64 bg-muted rounded-xl overflow-hidden flex-shrink-0 mx-auto md:mx-0 border border-border">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-2">
                          {product.category}
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                      </div>

                      {product.reason && (
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                          <p className="text-sm text-primary">
                            <span className="font-semibold">💡 Why this product:</span> {product.reason}
                          </p>
                        </div>
                      )}

                      <div className="pt-2">
                        <div className="bg-muted rounded-lg px-4 py-2 border border-border inline-block">
                          <p className="text-xs text-muted-foreground mb-1">Price</p>
                          <p className="text-2xl font-bold text-success">₹{product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="bg-primary/10 border-b border-primary/30 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/30">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Shipping Address</h2>
                    <p className="text-sm text-muted-foreground">Enter delivery details</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Phone Number <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder-muted-foreground"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Street Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder-muted-foreground"
                      placeholder="123 Main Street, Apartment 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        City <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder-muted-foreground"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        State <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder-muted-foreground"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        PIN Code <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder-muted-foreground"
                        placeholder="400001"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
                  <div className="flex items-center gap-3 text-primary-foreground">
                    <ShoppingBag className="w-6 h-6" />
                    <div>
                      <h2 className="text-lg font-semibold">Order Summary</h2>
                      <p className="text-sm text-primary-foreground/80">
                        {isCartCheckout ? `${cartItems.length} items` : '1 item'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Product Item(s) */}
                  {isCartCheckout ? (
                    <div className="space-y-3 pb-6 border-b border-border max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id || item._id} className="flex gap-3">
                          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border">
                            {item.user_product_imageUrl ? (
                              <img
                                src={item.user_product_imageUrl}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                {item.product_name?.charAt(0) || 'P'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
                              {item.product_name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Qty: {item.user_product_cart_count}</span>
                              <span className="font-bold text-success text-sm">
                                ₹{(item.user_product_price * item.user_product_cart_count).toLocaleString()
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : product ? (
                    <div className="flex gap-4 pb-6 border-b border-border">
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Qty: 1</span>
                          <span className="font-bold text-success">
                            ₹{product.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground font-semibold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Shipping
                      </span>
                      <span className="text-success font-semibold">FREE</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-foreground font-semibold text-lg">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          ₹{total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      Select Payment Method
                    </h3>
                    <div className="space-y-3">
                      { [
                        { id: 'razorpay', name: 'Razorpay', desc: 'UPI, Cards, Banking, Wallets', icon: Wallet },
                        { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when you receive', icon: Building2 }
                      ].map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedPaymentMethod === method.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                              selectedPaymentMethod === method.id
                                ? 'border-primary bg-primary'
                                : 'border-border'
                            }`}>
                              {selectedPaymentMethod === method.id && (
                                <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                              )}
                            </div>
                            <method.icon className={`w-5 h-5 ${selectedPaymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">{method.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{method.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span>SSL Secure</span>
                    </div>
                    <div className="w-px h-4 bg-muted"></div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span>PCI Compliant</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold text-foreground">
                      {selectedPaymentMethod === 'razorpay' ? 'Razorpay Payment' : 'Cash on Delivery'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center mb-4">
                    {selectedPaymentMethod === 'razorpay' 
                      ? 'Secure payment via UPI, Cards, Net Banking & Wallets'
                      : 'Pay in cash when your order is delivered'
                    }
                  </p>

                  <button 
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                      isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : selectedPaymentMethod === 'razorpay' 
                      ? `Pay ₹${total.toLocaleString()} Securely`
                      : `Place Order - ₹${total.toLocaleString()}`
                    }
                  </button>

                  <div className="bg-success/5 border border-success/20 rounded-lg p-3 flex gap-2 mt-4">
                    <Lock className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedPaymentMethod === 'razorpay'
                        ? '256-bit SSL encrypted. Your payment information is secure.'
                        : 'Your order is secure. Pay only when you receive your product.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


