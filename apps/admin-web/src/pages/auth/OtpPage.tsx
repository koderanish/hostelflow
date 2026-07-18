import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, type OtpFormData } from '../../schemas/auth.schema';
import { authService } from '../../services/auth.service';
import { useNotify } from '../../context/NotificationContext';
import { Building2, ShieldCheck } from 'lucide-react';

export function OtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useNotify();
  const email = searchParams.get('email') || '';
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const { handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const handleDigitChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[idx] = value.slice(-1);
    setOtpDigits(newOtp);
    setValue('otp', newOtp.join(''), { shouldValidate: true });
    if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const onSubmit = async (_data: OtpFormData) => {
    const code = otpDigits.join('');
    const res = await authService.verifyOtp(email, code);
    if (res.success) {
      addToast('OTP verified successfully', 'success');
      navigate(`/reset-password?token=${res.data?.token}`);
    } else {
      addToast(res.error || 'Invalid OTP', 'error');
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    setCountdown(30);
    await authService.sendOtp(email);
    addToast('OTP resent to your email', 'success');
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); setResendDisabled(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-dvh bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="w-full max-w-md relative animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl mb-5 shadow-lg shadow-brand-500/25 animate-bounce-gentle">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">HostelFlow</h1>
        </div>

        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-full bg-brand-50 dark:bg-brand-900/30 mb-3">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verify OTP</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Code sent to {email || 'your email'}</p>
          </div>

          {errors.otp && (
            <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">{errors.otp.message}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-center gap-2 mb-6" id="otp-inputs">
              {otpDigits.map((digit, idx) => (
                <input key={idx} ref={(el: HTMLInputElement | null) => { inputRefs.current[idx] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleDigitChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  className="w-12 h-12 text-center text-lg font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
              ))}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="relative w-full overflow-hidden group mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-600 rounded-xl" />
              <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-semibold">
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </div>
            </button>

            <p className="text-center text-xs text-slate-400">
              Didn't receive code?{' '}
              <button type="button" onClick={handleResend} disabled={resendDisabled}
                className="text-brand-600 hover:text-brand-700 font-medium disabled:text-slate-500">
                {resendDisabled ? `Resend in ${countdown}s` : 'Resend'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
