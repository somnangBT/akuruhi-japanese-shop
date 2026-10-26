import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
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
  Sparkles,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AuthGate: React.FC = () => {
  const {
    loginWithCredentials,
    registerCustomer,
    settings,
    theme,
    toggleTheme,
  } = useStore();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin'>('login');

  // Customer Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [telegram, setTelegram] = useState('');

  // Admin Form State (strictly password masked)
  const [adminGmail, setAdminGmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Error State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    const result = loginWithCredentials(identifier, password, 'customer');
    setIsSubmitting(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Access denied. Please check your credentials.');
    }
  };

  const handleCustomerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Standard Validation: Confirm Password match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password. / លេខសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long. / លេខសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ។');
      return;
    }

    setIsSubmitting(true);
    const result = registerCustomer({
      name,
      identifier,
      password,
      phone: phone || (identifier.replace(/[^0-9]/g, '').length >= 8 ? identifier : undefined),
      address,
      telegram,
    });
    setIsSubmitting(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Registration failed.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    const result = loginWithCredentials(adminGmail, adminPassword, 'admin');
    setIsSubmitting(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Access denied. Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-[#080a0e] text-slate-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-200">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[250px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Floating Theme Mode Toggle in Top Right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-850 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-750 shadow-md backdrop-blur-md text-xs font-medium transition-all active:scale-95 cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Store Brand Wordmark */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-[11px] font-medium text-rose-600 dark:text-rose-400 mb-2 shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>Phnom Penh Wholesale & Retail</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={`${settings.storeName} Logo`}
                className="w-12 h-12 rounded-xl object-contain bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-neutral-700/60 p-1 shadow-xs"
              />
            ) : (
              <div
                style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-extrabold text-white text-xl shadow-lg shadow-rose-950/40"
              >
                {settings.logoText || '旭'}
              </div>
            )}
            <div className="text-left">
              <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                {settings.storeName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {settings.tagline || 'Japanese Food & Beverage Supply · Since 1998'}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-sm mx-auto pt-1 leading-relaxed">
            Please register a new account or sign in with your credentials to access the store catalog and place orders.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 dark:bg-[#11141c]/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-7 shadow-xl dark:shadow-2xl space-y-5">
          {/* Portal Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 dark:bg-neutral-950 p-1 border border-slate-200 dark:border-neutral-850 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 px-2 rounded-lg font-medium transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="truncate">Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 px-2 rounded-lg font-medium transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs dark:bg-rose-600/20 dark:text-rose-300 dark:border-rose-500/30'
                  : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="truncate">Register</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('admin');
                setErrorMessage(null);
              }}
              className={`py-2 px-2 rounded-lg font-medium transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                authMode === 'admin'
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                  : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="truncate">Admin</span>
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">{errorMessage}</span>
                {errorMessage.includes('register first') && authMode !== 'register' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
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

          {/* TAB 1: CUSTOMER LOGIN */}
          {authMode === 'login' && (
            <form onSubmit={handleCustomerLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                  Email ឬ លេខទូរស័ព្ទ / Email or Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3.5 text-slate-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="e.g. sophia.sokha@gmail.com or 012888999"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm shadow-xs"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 mt-1 block">
                  បញ្ចូល Email ឬលេខទូរស័ព្ទដែលបានចុះឈ្មោះ / Enter your registered email or phone number.
                </span>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                  លេខសម្ងាត់ / Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3.5 text-slate-400 dark:text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm font-mono shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 shadow-md shadow-rose-950/20 mt-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>កំពុងផ្ទៀងផ្ទាត់... / Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>ចូលគណនី / Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-600 dark:text-neutral-400">
                មិនទាន់មានគណនី? (New customer?){' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                >
                  ចុះឈ្មោះគណនីថ្មី / Register
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CUSTOMER REGISTRATION */}
          {authMode === 'register' && (
            <form onSubmit={handleCustomerRegister} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                  ឈ្មោះពេញ / Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Liam Sovann"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                  Email ឬ លេខទូរស័ព្ទ / Email or Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    required
                    autoComplete="email tel"
                    placeholder="yourname@gmail.com or 012888999"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm shadow-xs"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5 block">
                  ប្រើសម្រាប់ Login ចូលប្រព័ន្ធ / Used as your primary login identifier.
                </span>
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                  លេខសម្ងាត់ / Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="យ៉ាងហោច ៦ តួអក្សរ (Min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm font-mono shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Standard Safety Verification) */}
              <div>
                <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                  បញ្ជាក់លេខសម្ងាត់ / Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="វាយលេខសម្ងាត់ម្តងទៀត"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm font-mono shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-medium">
                  អាសយដ្ឋានដឹកជញ្ជូន / Delivery Address <span className="text-slate-400 dark:text-neutral-500 text-[10px] font-normal">(ស្រេចចិត្ត / Optional)</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    autoComplete="street-address"
                    placeholder="e.g. Street 51, BKK1, Phnom Penh"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-medium">
                  Telegram Username <span className="text-slate-400 dark:text-neutral-500 text-[10px] font-normal">(ស្រេចចិត្ត / Optional)</span>
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
                disabled={isSubmitting}
                style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 shadow-md shadow-rose-950/20 mt-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>កំពុងចុះឈ្មោះ... / Registering...</span>
                  </>
                ) : (
                  <>
                    <span>ចុះឈ្មោះចូលទិញទំនិញ / Register & Enter Store</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-600 dark:text-neutral-400">
                មានគណនីរួចហើយ? (Already registered?){' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                >
                  ចូលគណនី / Sign In
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ADMINISTRATOR PORTAL */}
          {authMode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
                <span className="font-bold block text-amber-900 dark:text-amber-100">🔐 RESTRICTED ADMINISTRATOR ACCESS</span>
                ផ្ទាំងនេះសម្រាប់តែគណនីអ្នកគ្រប់គ្រងហាងដែលមានការអនុញ្ញាតប៉ុណ្ណោះ។
              </div>

              <div>
                <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                  Administrator Gmail Address <span className="text-amber-600 dark:text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3.5 text-amber-500" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="admin@gmail.com"
                    value={adminGmail}
                    onChange={(e) => setAdminGmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm font-mono shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                  Administrator Password <span className="text-amber-600 dark:text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3.5 text-amber-500" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm font-mono shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                    title={showAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition-colors shadow-md shadow-amber-950/20 mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>កំពុងផ្ទៀងផ្ទាត់សិទ្ធិ...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>ផ្ទៀងផ្ទាត់ & ចូល Admin Console</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer quiet tag */}
        <div className="text-center text-[11px] text-slate-500 dark:text-neutral-500">
          Akuruhi Japan Food & Beverage Supply (Cambodia) Co., Ltd.
        </div>
      </div>
    </div>
  );
};
