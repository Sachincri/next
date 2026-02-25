'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useForgotPasswordMutation } from '@/redux/api/userApi'

/* -------------------- ZOD SCHEMA -------------------- */
const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/* -------------------- COMPONENT -------------------- */
export default function ForgotPassword() {
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
    const [emailSent, setEmailSent] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const res = await forgotPassword({ email: data.email }).unwrap()
            toast.success(res?.message || 'Password reset link sent to your email')
            setEmailSent(true)
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to send reset link')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-gray-600">
                        Enter your email and we'll send you a link to reset your password
                    </p>
                </div>

                {emailSent ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h3>
                        <p className="text-gray-600 mb-6">
                            We have sent a password reset link to your email address.
                        </p>
                        <Link
                            href="/login"
                            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="name@example.com"
                                    className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Sending link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <Link
                                href="/login"
                                className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
