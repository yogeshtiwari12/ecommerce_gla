"use client";
import { X, CheckCircle2, Clock, Package } from 'lucide-react';
import { useState, useEffect } from 'react';

interface OrderDetails {
  paymentId?: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  timeline: Array<{step: string, time: string, status: string}>;
  productName: string;
  productImage: string;
}

interface OrderSuccessModalProps {
  show: boolean;
  orderDetails: OrderDetails | null;
  onClose: () => void;
}

export default function OrderSuccessModal({ show, orderDetails, onClose }: OrderSuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (show) {
      setTimeout(() => setIsVisible(true), 10);
      // Animate progress line
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setIsVisible(false);
      setProgress(0);
    }
  }, [show]);

  if (!show || !orderDetails) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
<div className={`bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md transform transition-all duration-500 ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}`}>
        
        {/* Compact Header */}
        <div className="relative bg-gradient-to-r from-success/10 to-muted p-6 text-center rounded-t-2xl border-b border-border">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-success/20">
            <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-1">
            Order Confirmed!
          </h2>
          <p className="text-sm text-muted-foreground">
            Your order is being processed
          </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          
          {/* Product Info - Compact */}
            <div className="bg-muted rounded-xl p-3 border border-border">
            <div className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={orderDetails.productImage}
                  alt={orderDetails.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate mb-1">{orderDetails.productName}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Amount:</span>
                  <span className="text-lg font-bold text-success">₹{orderDetails.amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details Grid - Compact */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                <Package className="w-3 h-3" />
                Order ID
              </p>
              <p className="text-xs font-mono text-foreground truncate">{orderDetails.orderId}</p>
            </div>
            
            {orderDetails.paymentId && (
              <div className="bg-muted rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">Payment ID</p>
                <p className="text-xs font-mono text-foreground truncate">{orderDetails.paymentId}</p>
              </div>
            )}
            
            <div className={`bg-muted rounded-lg p-3 border border-border ${!orderDetails.paymentId ? 'col-span-2' : ''}`}>
              <p className="text-xs text-muted-foreground mb-0.5">Payment Method</p>
              <p className="text-sm font-semibold text-warning">{orderDetails.paymentMethod}</p>
            </div>
          </div>

          {/* Timeline - Compact */}
            <div className="bg-muted rounded-lg p-3 border border-border">
              <h4 className="text-xs font-semibold text-success mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Order Timeline
            </h4>
            <div className="relative space-y-2">
              {/* Vertical progress line */}
              <div className="absolute left-2.5 top-0 w-0.5 h-full bg-border -z-0">
                <div 
                  className="w-full bg-gradient-to-b from-success to-success transition-all duration-300 ease-out"
                  style={{ height: `${progress}%` }}
                />
              </div>
              
              {orderDetails.timeline.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-2 relative z-10">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    entry.status === '✅' ? 'bg-success/10 border border-success/30 text-success' : 'bg-muted border border-border text-muted-foreground'
                  }`}>
                    <span className="text-xs">{entry.status}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground font-medium leading-tight">{entry.step}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => window.location.href = '/profile'}
              className="flex-1 bg-success hover:bg-success/90 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200"
            >
              View Orders
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-muted hover:bg-muted text-foreground text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200"
            >
              Continue
            </button>
          </div>

          {/* Success Note */}
          <div className="bg-success/5 border border-success/20 rounded-lg p-3 text-center">
            <p className="text-xs text-success leading-relaxed">
              🎉 Thank you! We'll send order updates via email
            </p>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

