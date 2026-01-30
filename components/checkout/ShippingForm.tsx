import { motion } from 'framer-motion';
import { MapPin, Phone, Building2, Map, Hash, MapPinned } from 'lucide-react';

interface FormData {
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface ShippingFormProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const inputVariants = {
  focus: { scale: 1.01, y: -2, transition: { duration: 0.2 } },
  blur: { scale: 1, y: 0, transition: { duration: 0.2 } },
};

export function ShippingForm({ formData, onChange }: ShippingFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-emerald-500/5" />

      <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-emerald-900/40 border-b border-slate-700/50 px-6 py-5 relative">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 backdrop-blur-sm"
          >
            <MapPin className="w-6 h-6 text-emerald-400" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Shipping Address</h2>
            <p className="text-sm text-slate-400">Enter your delivery details</p>
          </div>
        </div>
      </div>

      <div className="p-8 relative">
        <div className="space-y-6">
          {/* Phone Number */}
          <motion.div
            variants={inputVariants}
            whileFocus="focus"
            className="relative"
          >
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="relative group">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-all duration-300 z-10" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                required
                className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-slate-700/50 bg-slate-800/50 text-slate-100 
                         focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none 
                         placeholder:text-slate-500 hover:border-slate-600 backdrop-blur-sm font-medium text-base"
                placeholder="+91 98765 43210"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur" />
            </div>
          </motion.div>

          {/* Street Address */}
          <motion.div
            variants={inputVariants}
            whileFocus="focus"
            className="relative"
          >
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Street Address <span className="text-red-400">*</span>
            </label>
            <div className="relative group">
              <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-all duration-300 z-10" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={onChange}
                required
                className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-slate-700/50 bg-slate-800/50 text-slate-100 
                         focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none 
                         placeholder:text-slate-500 hover:border-slate-600 backdrop-blur-sm font-medium text-base"
                placeholder="123 Main Street, Apartment 4B"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur" />
            </div>
          </motion.div>

          {/* City, State, PIN Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="relative"
            >
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                City <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <Map className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-all duration-300 z-10" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={onChange}
                  required
                  className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-slate-700/50 bg-slate-800/50 text-slate-100 
                           focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none 
                           placeholder:text-slate-500 hover:border-slate-600 backdrop-blur-sm font-medium text-base"
                  placeholder="Mumbai"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur" />
              </div>
            </motion.div>

            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="relative"
            >
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                State <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <MapPinned className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-all duration-300 z-10" />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={onChange}
                  required
                  className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-slate-700/50 bg-slate-800/50 text-slate-100 
                           focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none 
                           placeholder:text-slate-500 hover:border-slate-600 backdrop-blur-sm font-medium text-base"
                  placeholder="Maharashtra"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur" />
              </div>
            </motion.div>

            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="relative"
            >
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                PIN Code <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-all duration-300 z-10" />
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={onChange}
                  required
                  maxLength={6}
                  className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-slate-700/50 bg-slate-800/50 text-slate-100 
                           focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none 
                           placeholder:text-slate-500 hover:border-slate-600 backdrop-blur-sm font-medium text-base"
                  placeholder="400001"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur" />
              </div>
            </motion.div>
          </div>

          {/* Info Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30"
          >
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
            <p className="text-sm text-slate-300">
              We'll use this address for delivery. Make sure all details are correct.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
