import { motion } from 'framer-motion';
import { ShoppingBag, Truck, Check, Shield, Lock, CreditCard, Wallet, Banknote } from 'lucide-react';

interface Product {
  name: string;
  category: string;
  price: number;
  imageUrl: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  desc: string;
  icon: typeof CreditCard;
}

interface OrderSummaryProps {
  product: Product;
  subtotal: number;
  total: number;
  selectedPaymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onPayment: () => void;
  isProcessing?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'razorpay', name: 'Razorpay', desc: 'UPI, Cards, Net Banking & Wallets', icon: Wallet },
  { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: Banknote },
];

const features = [
  { icon: Check, text: '30-day hassle-free returns' },
  { icon: Check, text: '100% satisfaction guarantee' },
  { icon: Shield, text: 'Secure & encrypted checkout' },
];

export function OrderSummary({
  product,
  subtotal,
  total,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onPayment,
  isProcessing = false,
}: OrderSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="lg:sticky lg:top-8 space-y-6"
    >
      {/* Order Summary Card */}
      <div className="backdrop-blur-xl bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/50">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
          <div className="flex items-center gap-3 text-white">
            <ShoppingBag className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Order Summary</h2>
              <p className="text-sm text-emerald-100">1 item in your cart</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Item */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex gap-4 pb-6 border-b border-slate-700/50"
          >
            <div className="w-24 h-24 bg-slate-700/30 rounded-xl overflow-hidden flex-shrink-0 border border-slate-600/50">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-100 text-sm mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs text-slate-400 mb-3">{product.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-md">
                  Qty: 1
                </span>
                <span className="font-bold text-emerald-400 text-lg">
                  ₹{product.price.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-slate-100 font-semibold">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipping
              </span>
              <span className="text-emerald-400 font-semibold">FREE</span>
            </div>
            <div className="border-t border-slate-700/50 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-100 font-semibold text-lg">Total</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-slate-700/50 pt-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Payment Method
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onPaymentMethodChange(method.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${selectedPaymentMethod === method.id
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                      : 'border-slate-600 bg-slate-700/30 hover:border-emerald-500/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                        ${selectedPaymentMethod === method.id
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-500'
                        }`}
                    >
                      {selectedPaymentMethod === method.id && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <method.icon
                      className={`w-5 h-5 ${selectedPaymentMethod === method.id ? 'text-emerald-400' : 'text-slate-400'}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-100">{method.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{method.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-slate-900/50 rounded-xl p-4 space-y-3 border border-slate-700/30">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <feature.icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-4 h-4" />
              <span>SSL Secure</span>
            </div>
            <div className="w-px h-4 bg-slate-600" />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4" />
              <span>PCI Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="backdrop-blur-xl bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/50"
      >
        <div className="p-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="text-lg font-bold text-slate-100">
              {selectedPaymentMethod === 'razorpay' ? 'Secure Payment' : 'Cash on Delivery'}
            </span>
          </div>

          <p className="text-sm text-slate-400 text-center mb-5">
            {selectedPaymentMethod === 'razorpay'
              ? 'Pay securely via UPI, Cards, Net Banking & Wallets'
              : 'Pay in cash when your order is delivered'}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPayment}
            disabled={isProcessing}
            className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 px-6 rounded-xl 
                     transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50
                     text-lg tracking-wide ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : selectedPaymentMethod === 'razorpay'
              ? `Pay ₹${total.toLocaleString()} Securely`
              : `Place Order • ₹${total.toLocaleString()}`}
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 mt-5"
          >
            <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedPaymentMethod === 'razorpay'
                ? '256-bit SSL encrypted. Your payment information is completely secure.'
                : 'Your order is secure. Pay only when you receive your product.'}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
