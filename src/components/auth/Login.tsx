'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import {
  useLoginMutation,
  useSendLoginOtpMutation,
  useVerifyLoginOtpMutation,
} from '@/redux/api/userApi'
import { useAppSelector } from '@/redux/hooks'
import { RootState } from '@/redux/store'

/* -------------------- ZOD SCHEMA -------------------- */
const loginSchema = z
  .object({
    identifier: z.string().email('Enter a valid email'),
    password: z.string().optional(),
    otp: z.string().optional(),
    loginMethod: z.enum(['password', 'otp']),
    otpSent: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.loginMethod === 'password' && !data.password) {
      ctx.addIssue({
        path: ['password'],
        message: 'Password is required',
        code: z.ZodIssueCode.custom,
      })
    }

    if (data.loginMethod === 'otp' && data.otpSent && !data.otp) {
      ctx.addIssue({
        path: ['otp'],
        message: 'OTP is required',
        code: z.ZodIssueCode.custom,
      })
    }
  })

type LoginFormData = z.infer<typeof loginSchema>

/* -------------------- COMPONENT -------------------- */
export default function Login() {
  const router = useRouter()

  const { error, otpSent, isAuthenticated } = useAppSelector(
    (state: RootState) => state.user
  )

  // Separate mutation hooks for clarity
  const [loginWithPassword, { isLoading: isPasswordLoggingIn }] = useLoginMutation()
  const [sendLoginOtp, { isLoading: isSendingOtpMutation }] = useSendLoginOtpMutation()
  const [verifyLoginOtp, { isLoading: isVerifyLoggingIn }] = useVerifyLoginOtpMutation()

  /* -------------------- STATE -------------------- */
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>(otpSent ? 'otp' : 'password')
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  // Derived global loading state for the submit button
  const isLoggingIn = isPasswordLoggingIn || isVerifyLoggingIn

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      otp: '',
      loginMethod,
      otpSent,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setError,
    resetField,
    setValue,
  } = methods

  /* -------------------- EFFECTS -------------------- */

  // Redirect once authenticated
  useEffect(() => {
    if (isAuthenticated) router.push('/')
  }, [isAuthenticated, router])

  // OTP countdown timer — starts whenever otpSent flips to true
  useEffect(() => {
    if (!otpSent) return
    setLoginMethod('otp')
    setValue('otpSent', true)
    setCountdown(30)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [otpSent, setValue])

  /* -------------------- HANDLERS -------------------- */

  const handleSendOtp = async () => {
    const email = getValues('identifier')
    if (!email) {
      setError('identifier', { message: 'Email is required' })
      return
    }

    try {
      setIsSendingOtp(true)
      const res = await sendLoginOtp({ email }).unwrap()
      toast.success(res?.message || 'OTP sent to your email')
      // Note: Reducer handles setting otpSent=true
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send OTP')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (loginMethod === 'password') {
        const res = await loginWithPassword({
          email: data.identifier,
          password: data.password!,
        }).unwrap()

        toast.success(res?.message ?? 'Signed in successfully')
        return
      }

      if (!otpSent) {
        const res = await sendLoginOtp({ email: data.identifier }).unwrap()
        toast.success(res?.message || 'OTP sent to your email')
        return
      }

      const res = await verifyLoginOtp({
        email: data.identifier,
        otp: data.otp!,
      }).unwrap()

      toast.success(res?.message || 'Logged in successfully')
    } catch (err: any) {
      toast.error(err?.data?.message || 'Authentication failed')
    }
  }

  const handleMethodChange = (method: 'password' | 'otp') => {
    setLoginMethod(method)
    // Sync the hidden form field directly — no need for a separate useEffect
    setValue('loginMethod', method)
    if (method === 'password') resetField('otp')
    if (method === 'otp') resetField('password')
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-8 border border-transparent dark:border-slate-700">
        <h2 className="text-3xl font-bold text-center mb-2 dark:text-white text-gray-900">Welcome Back</h2>
        <p className="text-center text-gray-600 dark:text-slate-400 mb-6">
          Sign in to continue
        </p>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border dark:border-red-900/50">
            {error}
          </div>
        )}

        {/* METHOD TOGGLE */}
        <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => handleMethodChange('password')}
            className={`flex-1 py-2 rounded-md transition-all ${loginMethod === 'password'
              ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow'
              : 'text-gray-600 dark:text-slate-400'
              }`}
          >
            Password
          </button>

          <button
            type="button"
            onClick={() => handleMethodChange('otp')}
            className={`flex-1 py-2 rounded-md transition-all ${loginMethod === 'otp'
              ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow'
              : 'text-gray-600 dark:text-slate-400'
              }`}
          >
            OTP
          </button>
        </div>

        {otpSent && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg flex gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-300">
              OTP sent to your email
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit((formData) =>
            onSubmit({
              ...formData,
              loginMethod,
              otpSent,
            })
          )}
          className="space-y-5"
        >
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium dark:text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                {...register('identifier')}
                className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="name@example.com"
              />
            </div>
            {errors.identifier && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          {loginMethod === 'password' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium dark:text-slate-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-3.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {/* OTP */}
          {loginMethod === 'otp' && (
            <div>
              <label className="text-sm font-medium dark:text-slate-300">OTP Code</label>
              <input
                {...register('otp')}
                maxLength={6}
                autoFocus={otpSent}
                disabled={!otpSent}
                className="w-full py-3 text-center border rounded-lg tracking-[1em] text-lg font-bold dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800"
                placeholder="000000"
              />
              {errors.otp && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 text-center">
                  {errors.otp.message}
                </p>
              )}

              {otpSent &&
                (countdown > 0 ? (
                  <p className="text-xs text-center mt-2 dark:text-slate-400">
                    Resend OTP in {countdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={handleSendOtp}
                    className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 block mx-auto disabled:opacity-50"
                  >
                    {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                  </button>
                ))}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={
              isLoggingIn ||
              isSendingOtp ||
              (loginMethod === 'otp' && otpSent && !getValues('otp'))
            }
            className="w-full bg-[#0d0e26] text-white py-3 rounded-lg disabled:opacity-50"
          >
            {/* Logic for button text: 
                - If logging in (Verify/Password) -> "Processing..."
                - If sending OTP -> "Sending OTP..."
                - Else show static labels
            */}
            {isLoggingIn
              ? 'Processing...'
              : isSendingOtp
                ? 'Sending OTP...'
                : loginMethod === 'password'
                  ? 'Sign In'
                  : !otpSent
                    ? 'Send OTP'
                    : 'Verify & Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
