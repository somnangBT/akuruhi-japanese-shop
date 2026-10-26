import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  AlertCircle,
  MapPin,
  Send,
  UserPlus,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithCredentials,
    registerCustomer,
    settings,
  } = useStore();

  const [authPortal, setAuthPortal] = useState<'customer' | 'admin'>('customer');
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');

  // Form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [telegram, setTelegram] = useState('');

  // Admin login specific
  const [adminGmail, setAdminGmail] = useState('limbunterm213@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');

  // Error display state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = loginWithCredentials(identifier, password, 'customer');
    if (!result.success) {
      setErrorMessage(result.error || 'Access denied.');
    }
  };

  const handleCustomerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = registerCustomer({
      name,
      identifier,
      password,
      phone: phone || (identifier.replace(/[^0-9]/g, '').length >= 8 ? identifier : undefined),
      address,
      telegram,
    });
    if (!result.success) {
      setErrorMessage(result.error || 'Registration failed.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = loginWithCredentials(adminGmail, adminPassword, 'admin');
    if (!result.success) {
      setErrorMessage(result.error || 'Access denied.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white dark:bg-[#12151c] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-5 my-8 text-slate-900 dark:text-neutral-100"
        >
          {/* Close */}
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setErrorMessage(null);
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Clear Distinction: Top Portal Switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-neutral-900 p-1 border border-slate-200 dark:border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthPortal('customer');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authPortal === 'customer'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Account</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthPortal('admin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authPortal === 'admin'
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                  : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Administrator Portal</span>
            </button>
          </div>

          {/* Portal Header */}
          <div className="text-center">
            {authPortal === 'admin' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                  Administrator Login
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                  Requires authorized Administrator Gmail address and corresponding password.
                </p>
              </>
            ) : (
              <>
                <div
                  style={{ backgroundColor: `${settings.brandColor || '#e11d48'}15` }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-rose-600 dark:text-rose-400"
                >
                  {customerMode === 'register' ? (
                    <UserPlus className="w-6 h-6" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                  {customerMode === 'register' ? 'Register Customer Account' : 'Customer Sign In'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  {customerMode === 'register'
                    ? 'Register using your Gmail address or phone number.'
                    : 'Sign in with your registered Gmail or phone number and password.'}
                </p>
              </>
            )}
          </div>

          {/* Error Notice Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">{errorMessage}</span>
                {errorMessage.includes('register first') && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode('register');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-rose-600 dark:text-rose-200 underline hover:text-rose-800 dark:hover:text-white font-medium cursor-pointer"
                  >
                    Click here to register your account now →
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* CUSTOMER PORTAL */}
          {authPortal === 'customer' && (
            <div>
              {/* Customer Sign In / Register sub-toggle */}
              <div className="flex border-b border-slate-200 dark:border-neutral-800 text-xs mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 pb-2 font-medium border-b-2 transition-all cursor-pointer ${
                    customerMode === 'login'
                      ? 'border-rose-600 text-slate-900 dark:border-rose-500 dark:text-white font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  Existing Customer Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('register');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 pb-2 font-medium border-b-2 transition-all cursor-pointer ${
                    customerMode === 'register'
                      ? 'border-rose-600 text-slate-900 dark:border-rose-500 dark:text-white font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  New Customer Registration
                </button>
              </div>

              {/* Customer Sign In Form */}
              {customerMode === 'login' && (
                <form onSubmit={handleCustomerLogin} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-neutral-300 mb-1 font-medium">
                      Registered Gmail or Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. sophia.sokha@gmail.com or 0971234567"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-neutral-300 mb-1 font-medium">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm font-mono shadow-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                    className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 shadow-md shadow-rose-950/20 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Customer Registration Form */}
              {customerMode === 'register' && (
                <form onSubmit={handleCustomerRegister} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-neutral-300 mb-1 font-medium">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Liam Sovann"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-neutral-300 mb-1 font-medium">
                      Gmail Address or Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                      <input
                        type="text"
                        required
                        placeholder="yourname@gmail.com or 012888999"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-neutral-300 mb-1 font-medium">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                      <input
                        type="password"
                        required
                        minLength={5}
                        placeholder="At least 5 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm font-mono shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-neutral-300 mb-1 font-medium">
                      Delivery Address <span className="text-slate-400 dark:text-neutral-500 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                      <input
                        type="text"
                        placeholder="e.g. Street 51, BKK1, Phnom Penh"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-neutral-300 mb-1 font-medium">
                      Telegram Username <span className="text-slate-400 dark:text-neutral-500 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Send className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                      <input
                        type="text"
                        placeholder="@username"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm font-mono shadow-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                    className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 shadow-md shadow-rose-950/20 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Register Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ADMINISTRATOR PORTAL */}
          {authPortal === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                <span className="font-bold block text-amber-900 dark:text-amber-200">RESTRICTED MANAGEMENT PORTAL</span>
                Access will be denied if the Gmail address and password do not match authorized management credentials.
              </div>

              <div>
                <label className="block text-slate-700 dark:text-neutral-300 mb-1 font-medium">
                  Administrator Gmail Address <span className="text-amber-600 dark:text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-amber-500" />
                  <input
                    type="email"
                    required
                    placeholder="limbunterm213@gmail.com"
                    value={adminGmail}
                    onChange={(e) => setAdminGmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm font-mono shadow-xs"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 mt-1 block">
                  Must be an authorized Gmail address ending in @gmail.com.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-neutral-300 mb-1 font-medium">
                  Administrator Password <span className="text-amber-600 dark:text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-amber-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm font-mono shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition-colors shadow-md shadow-amber-950/20 mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Enter Administrator Console</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
