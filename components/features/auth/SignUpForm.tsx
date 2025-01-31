'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface SignUpFormProps {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SignUpForm({ onSubmit, onCancel, isLoading = false }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5 p-6 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.05]"
      onSubmit={handleSubmit}
    >
      <h3 className="text-lg font-bold text-center bg-gradient-to-r from-primary/90 to-primary-light/90 bg-clip-text text-transparent mb-6">
        التسجيل للتصويت
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">
            الاسم الأول
          </label>
          <input
            type="text"
            required
            placeholder="عبد العزيز"
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-gray-100 placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm transition-colors"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">
            اسم العائلة
          </label>
          <input
            type="text"
            required
            placeholder="حجي"
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-gray-100 placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm transition-colors"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">
          رقم الهاتف
        </label>
        <input
          type="tel"
          required
          placeholder="+212604996802"
          disabled={isLoading}
          inputMode="numeric"
          pattern="[+0-9]*"
          dir="ltr"
          className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-gray-100 placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm transition-colors text-left"
          value={formData.phone}
          onChange={(e) => {
            // Only allow numbers and plus sign
            const value = e.target.value.replace(/[^\d+]/g, '');
            setFormData({ ...formData, phone: value });
          }}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">
          البريد الإلكتروني
        </label>
        <input
          type="email"
          required
          placeholder="nadevo.contact@gmail.com"
          disabled={isLoading}
          className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-gray-100 placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm transition-colors"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary/80 hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm backdrop-blur-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري التسجيل...
            </>
          ) : (
            'تسجيل'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-white/[0.08] hover:bg-white/[0.12] text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm backdrop-blur-sm"
        >
          إلغاء
        </button>
      </div>
    </motion.form>
  );
} 