"use client";
import { ShoppingBag, CreditCard, Lock, ChevronRight, MapPin, Phone, Check, Shield, Package } from 'lucide-react';
import { useState } from 'react';

export default function DesignPage() {
  // Mock cart items - replace with actual cart data
  const [cartItems] = useState([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      category: "Electronics",
      price: 299.99,
      quantity: 2,
      image: "https://images.pexels.com/photos/335257/pexels-photo-335257.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      name: "Classic Leather Watch",
      category: "Accessories",
      price: 189.99,
      quantity: 1,
      image: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 12.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleRazorpayPayment = () => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(total * 100), // Convert to paise
      currency: "INR",
      name: "Premium Store",
      description: `Order Payment - ${totalItems} item${totalItems > 1 ? 's' : ''}`,
      image: "/logo.png",
      handler: function (response: any) {
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: "",
        email: "",
        contact: ""
      },
      theme: {
        color: "#059669"
      }
    };

    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen mt-16 bg-gradient-to-br from-slate-900 via-black to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/50">
              ✓
            </span>
            <span className="text-emerald-400">Cart</span>
            <ChevronRight className="w-4 h-4" />
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-semibold">
              2
            </span>
            <span className="text-slate-200 font-medium">Checkout</span>
            <ChevronRight className="w-4 h-4" />
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-400 text-xs font-semibold">
              3
            </span>
            <span>Confirmation</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Secure Checkout</h1>
          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>256-bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Secure Payment Processing</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/30">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Shipping Address</h2>
                  <p className="text-xs text-slate-400">Where should we deliver your order?</p>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none placeholder-slate-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none placeholder-slate-500"
                    placeholder="123 Main Street, Suite 100"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none placeholder-slate-500"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none placeholder-slate-500"
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none placeholder-slate-500"
                      placeholder="400001"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/30">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Payment Method</h2>
                  <p className="text-xs text-slate-400">Secure payment powered by Razorpay</p>
                </div>
              </div>

              <div className="bg-slate-900 to-teal-500/10 border border-emerald-500/30 rounded-xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-emerald-400" />
                    <span className="text-xl font-bold text-slate-100">Razorpay</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 text-center mb-6">
                  Pay securely using UPI, Cards, Net Banking, and Wallets
                </p>

                <div className="grid grid-cols-4 gap-2 mb-6">
                  <div className="bg-slate-700/50 rounded-lg p-2 border border-slate-600 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-300">UPI</span>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 border border-slate-600 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-300">Card</span>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 border border-slate-600 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-300">Banking</span>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2 border border-slate-600 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-300">Wallet</span>
                  </div>
                </div>

                <button 
                  onClick={handleRazorpayPayment}
                  className="w-full bg-gradient-to-r from-emerald-900 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200  hover:shadow-emerald-500/40"
                >
                  Pay ₹{total.toFixed(2)} with Razorpay
                </button>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex gap-3 mt-4">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-300 mb-1">PCI DSS Compliant & Secure</p>
                  <p className="text-xs text-slate-400">
                    Your payment information is encrypted and secure. Razorpay ensures industry-standard security.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/30">
                    <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">Order Summary</h2>
                    <p className="text-xs text-slate-400">
                      {totalItems} item{totalItems > 1 ? 's' : ''} in your cart
                    </p>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-700/50 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-slate-700/50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-600">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-200 text-sm mb-0.5 truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 mb-2">{item.category}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                          <span className="font-semibold text-emerald-400 text-sm">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 mb-6 pb-6 border-b border-slate-700/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-slate-200 font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Shipping</span>
                    <span className="text-emerald-400 font-medium">₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tax (8%)</span>
                    <span className="text-slate-200 font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-slate-300 font-medium">Total</span>
                  <span className="text-3xl font-bold text-emerald-400">₹{total.toFixed(2)}</span>
                </div>

                {/* Security Features */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-400">Free returns within 30 days</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-400">Satisfaction guarantee</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-400">Secure checkout encryption</span>
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
