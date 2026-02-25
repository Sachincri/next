'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone, User, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useRegisterMutation, useVerifyEmailOtpMutation } from "@/redux/api/userApi";
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { RootState } from '@/redux/store';
import toast from 'react-hot-toast';

/* -------------------- ZOD SCHEMA -------------------- */
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  otp: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  referralCode: z.string().optional(),
})

type SignupFormData = z.infer<typeof signupSchema>

/* -------------------- COMPONENT -------------------- */
export default function Signup() {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.user)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const [registerServer, { isLoading: registerLoading }] = useRegisterMutation();
  const [verifyOtpServer, { isLoading: verifyLoading }] = useVerifyEmailOtpMutation();

  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isLoading = registerLoading || verifyLoading;
  const [countdown, setCountdown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const startCountdown = () => {
    setCountdown(30)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }
  const onSubmit = async (data: SignupFormData) => {
    try {
      if (!otpSent) {
        // STEP 1: Register + Send OTP
        const res = await registerServer(data).unwrap();
        setOtpSent(true);
        startCountdown();
        toast.success(res?.message || "OTP sent to your email");
      } else {
        // STEP 2: Verify OTP
        if (!data.otp) {
          toast.error("Please enter the verification code");
          return;
        }
        const res = await verifyOtpServer({ email: data.email, otp: data.otp }).unwrap();
        toast.success(res?.message || "Account verified successfully");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };
  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-8 border border-transparent dark:border-slate-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-600 dark:text-slate-400">Join us and start shopping today!</p>
        </div>

        {/* OTP Success Message */}
        {otpSent && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                OTP sent successfully!
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Please check your phone for the verification code
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                {...register('name')}
                placeholder="John Doe"
                disabled={otpSent}
                className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-slate-700 dark:text-white dark:border-slate-600 ${errors.name ? 'border-red-500' : 'border-gray-300'
                  } ${otpSent ? 'bg-gray-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                <span className="font-medium">⚠</span> {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                disabled={otpSent}
                className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-slate-700 dark:text-white dark:border-slate-600 ${errors.email ? 'border-red-500' : 'border-gray-300'
                  } ${otpSent ? 'bg-gray-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                <span className="font-medium">⚠</span> {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                {...register('phone')}
                placeholder="10-digit mobile number"
                disabled={otpSent}
                maxLength={10}
                className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-slate-700 dark:text-white dark:border-slate-600 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                  } ${otpSent ? 'bg-gray-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                <span className="font-medium">⚠</span> {errors.phone.message}
              </p>
            )}
          </div>

          {/* Referral Code Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Referral Code <span className="text-gray-400 dark:text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                {...register('referralCode')}
                placeholder="Referral Code"
                disabled={otpSent}
                className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-slate-700 dark:text-white dark:border-slate-600 border-gray-300 ${otpSent ? 'bg-gray-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                disabled={otpSent}
                className={`w-full border rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-slate-700 dark:text-white dark:border-slate-600 ${errors.password ? 'border-red-500' : 'border-gray-300'
                  } ${otpSent ? 'bg-gray-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                disabled={otpSent}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                <span className="font-medium">⚠</span> {errors.password.message}
              </p>
            )}
          </div>

          {/* OTP Field */}
          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Verification Code
              </label>
              <input
                {...register('otp')}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-3 text-center text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {countdown > 0 ? (
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-2 text-center">
                  Resend OTP in {countdown}s
                </p>
              ) : (
                <button
                  type="button"
                  // onClick={handleResendOtp}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-2 font-medium block mx-auto"
                >
                  Resend OTP
                </button>
              )}
            </div>
          )}

          {/* Terms & Conditions */}
          {!otpSent && (
            <div className="flex items-start gap-2">
              <input
                {...register('terms')}
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-slate-400">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>
          )}
          {errors.terms && (
            <p className="text-red-500 dark:text-red-400 text-xs flex items-center gap-1">
              <span className="font-medium">⚠</span> {errors.terms.message}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0d0e26] text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : otpSent ? (
              'Verify & Create Account'
            ) : (
              'Send OTP'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}