import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const VerifyOtp = () => {
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const email = location.state?.email;

  // Guard — redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  // Countdown for resend cooldown
  useEffect(() => {
    if (countdown === 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste entire OTP at once
  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    digits.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/verify-otp', { email, otp: code });
      login(res.data);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await API.post('/auth/resend-otp', { email });
      setSuccess('New OTP sent! Check your inbox.');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-lime-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-2xl shadow-2xl z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-lime-500/10 mb-4">
            <ShieldCheck className="text-lime-400 w-8 h-8" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Verify Email</h2>
          <p className="text-gray-400 mt-2 text-sm">We sent a 6-digit code to</p>
          <p className="text-lime-400 font-bold text-sm mt-1 break-all">{email}</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-2xl mb-6 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-lime-500/10 border border-lime-500/20 text-lime-400 text-sm p-4 rounded-2xl mb-6 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 6 OTP boxes */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-2xl font-black bg-white/5 border-2 border-white/10 rounded-2xl text-white outline-none focus:border-lime-500 focus:bg-lime-500/5 transition-all caret-lime-400"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-gradient-to-r from-lime-500 to-yellow-500 hover:from-lime-400 hover:to-yellow-400 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader2 className="animate-spin" size={20} />
              : 'VERIFY & CREATE ACCOUNT'
            }
          </button>
        </form>

        {/* Resend + Back */}
        <div className="mt-8 space-y-4 text-center">
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="flex items-center justify-center gap-2 mx-auto text-sm font-bold text-gray-500 hover:text-lime-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend OTP'}
          </button>

          <Link
            to="/register"
            className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
