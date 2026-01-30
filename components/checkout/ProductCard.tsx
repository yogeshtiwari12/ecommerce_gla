import { motion } from 'framer-motion';
import { Package, Sparkles } from 'lucide-react';

interface Product {
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  reason?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="backdrop-blur-xl bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/50"
    >
      <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Order Details</h2>
            <p className="text-sm text-slate-400">Review your selection</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="w-full lg:w-72 h-72 bg-slate-700/30 rounded-2xl overflow-hidden flex-shrink-0 relative group"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          <div className="flex-1 space-y-4">
            <div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3"
              >
                <Sparkles className="w-3 h-3" />
                {product.category}
              </motion.span>
              <h3 className="text-2xl font-bold text-slate-100 mb-3">{product.name}</h3>
              <p className="text-slate-300 leading-relaxed">{product.description}</p>
            </div>

            {product.reason && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
              >
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">💡 Why this product:</span> {product.reason}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <div className="backdrop-blur-xl bg-slate-700/30 rounded-xl px-6 py-4 inline-block border border-slate-600">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Total Price</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  ₹{product.price.toLocaleString()}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
