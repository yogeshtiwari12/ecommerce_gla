import { motion } from 'framer-motion';
import { ShoppingBag, Check, Lock } from 'lucide-react';

const steps = [
  { id: 1, name: 'Cart', completed: true },
  { id: 2, name: 'Checkout', completed: false, active: true },
  { id: 3, name: 'Complete', completed: false },
];

export function CheckoutHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/95 border-b border-slate-700/50 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShoppingBag className="w-7 h-7 text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Secure Checkout</h1>
              <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                <Lock className="w-3 h-3" />
                SSL Encrypted & Protected
              </p>
            </div>
          </div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">Secure Payment Gateway</span>
          </motion.div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center sm:justify-start gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`relative w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300
                    ${step.completed
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/40'
                      : step.active
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/50 glow-effect'
                        : 'bg-slate-800/80 text-slate-500 border border-slate-700/50'
                    }`}
                >
                  {step.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Check className="w-6 h-6" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    step.id
                  )}
                  
                  {step.active && (
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-30 blur"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                
                <span
                  className={`font-semibold hidden sm:inline text-sm transition-colors
                    ${step.completed || step.active ? 'gradient-text' : 'text-slate-500'}`}
                >
                  {step.name}
                </span>
              </motion.div>
              
              {index < steps.length - 1 && (
                <div className="relative mx-3 sm:mx-4">
                  <div className="w-16 sm:w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${step.completed ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-700'}`}
                      initial={{ width: 0 }}
                      animate={{ width: step.completed ? '100%' : '0%' }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.header>
  );
}
