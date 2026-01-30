"use client";
import { ShoppingBag, CreditCard, Lock, MapPin, Phone, Check, Shield, Package, Truck, Wallet, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { buy_data, createOrder, savePayment, createUserProduct } from '@/app/redux/product';
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
        
        handler: async function (response: any) {
          try {
            // Step 2: Payment Completed
            const step2Time = new Date().toLocaleTimeString();
            log.push({step: 'Payment Completed by User', time: step2Time, status: '✅'});
            log.push({step: 'Verifying Payment Signature', time: step2Time, status: '⏳'});

            // Step 3: Verify & Save Payment
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
            setIsProcessing(false);
          }
        },
      
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          contact: formData.phone
        },
      
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
      console.error('Razorpay payment error:', error);
      alert(`❌ PAYMENT FAILED\n\n${error}`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Success Modal Component */}
      <OrderSuccessModal 
        show={showSuccessModal}
        orderDetails={orderDetails}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-green-600 font-medium hidden sm:inline">Cart</span>
            </div>
            <div className="w-12 h-0.5 bg-green-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm">
                2
              </div>
              <span className="text-gray-900 font-medium hidden sm:inline">Checkout</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 font-semibold flex items-center justify-center text-sm">
                3
              </div>
              <span className="text-gray-500 hidden sm:inline">Complete</span>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {isCartCheckout ? 'Cart Items' : 'Product Details'}
                    </h2>
                    <p className="text-sm text-gray-600">Review your order</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isCartCheckout ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id || item._id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.user_product_imageUrl ? (
                            <img
                              src={item.user_product_imageUrl}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                              {item.product_name?.charAt(0) || 'P'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.product_name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.user_product_category}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Qty: {item.user_product_cart_count}</span>
                            <span className="font-bold text-blue-600">₹{(item.user_product_price * item.user_product_cart_count).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : product ? (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-64 h-64 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 mx-auto md:mx-0 border border-gray-200">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                          {product.category}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                      </div>

                      {product.reason && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-700">
                            <span className="font-semibold">💡 Why this product:</span> {product.reason}
                          </p>
                        </div>
                      )}

                      <div className="pt-2">
                        <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 inline-block">
                          <p className="text-xs text-gray-600 mb-1">Price</p>
                          <p className="text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                    <p className="text-sm text-gray-600">Enter delivery details</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder-gray-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder-gray-500"
                      placeholder="123 Main Street, Apartment 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder-gray-500"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder-gray-500"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder-gray-500"
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
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                  <div className="flex items-center gap-3 text-white">
                    <ShoppingBag className="w-6 h-6" />
                    <div>
                      <h2 className="text-lg font-semibold">Order Summary</h2>
                      <p className="text-sm text-blue-100">
                        {isCartCheckout ? `${cartItems.length} items` : '1 item'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Product Item(s) */}
                  {isCartCheckout ? (
                    <div className="space-y-3 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id || item._id} className="flex gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            {item.user_product_imageUrl ? (
                              <img
                                src={item.user_product_imageUrl}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                {item.product_name?.charAt(0) || 'P'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                              {item.product_name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Qty: {item.user_product_cart_count}</span>
                              <span className="font-bold text-blue-600 text-sm">
                                ₹{(item.user_product_price * item.user_product_cart_count).toLocaleString()
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : product ? (
                    <div className="flex gap-4 pb-6 border-b border-gray-200">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">{product.category}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">Qty: 1</span>
                          <span className="font-bold text-blue-600">
                            ₹{product.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900 font-semibold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Shipping
                      </span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-semibold text-lg">Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
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
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                              selectedPaymentMethod === method.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedPaymentMethod === method.id && (
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              )}
                            </div>
                            <method.icon className={`w-5 h-5 ${selectedPaymentMethod === method.id ? 'text-blue-600' : 'text-gray-500'}`} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{method.name}</p>
                              <p className="text-xs text-gray-600 mt-1">{method.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Lock className="w-3 h-3" />
                      <span>SSL Secure</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Shield className="w-3 h-3" />
                      <span>PCI Compliant</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <span className="text-xl font-bold text-gray-900">
                      {selectedPaymentMethod === 'razorpay' ? 'Razorpay Payment' : 'Cash on Delivery'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 text-center mb-4">
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

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 mt-4">
                    <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 leading-relaxed">
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