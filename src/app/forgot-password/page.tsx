'use client'

import React, { useState } from 'react'
import { StarTrailCanvas } from '@/components/ui/star-trail-background'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { forgotPassword } from './actions'

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)
        setMessage(null)

        const formData = new FormData(event.currentTarget)
        const result = await forgotPassword(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        } else if (result?.success) {
            setMessage("Check your email for the password reset link.")
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex items-center justify-center">
            <StarTrailCanvas enableTrail={false} />

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="mb-6 flex justify-center">
                    <Link
                        href="/signup?mode=login"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-all text-sm font-medium backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>

                <div className="bg-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-none shadow-none">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                            <Mail className="w-6 h-6 text-white/60" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-center mb-2">Reset Password</h2>
                    <p className="text-white/40 text-center text-sm mb-8">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs p-3 rounded-xl mb-6 text-center">
                            {message}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                            />
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-white text-black font-bold py-3.5 rounded-full transition-all mt-2 cursor-pointer border border-transparent hover:bg-white/5 hover:text-white hover:border-purple-500/50 hover:backdrop-blur-sm flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Send Reset Link
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
