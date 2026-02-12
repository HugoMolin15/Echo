'use client'

import React, { useState } from 'react'
import { StarTrailCanvas } from '@/components/ui/star-trail-background'
import { Loader2, KeyRound } from 'lucide-react'
import { updatePassword } from './actions'

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [confirmPassword, setConfirmPassword] = useState('')

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        const formData = new FormData(event.currentTarget)
        const password = formData.get('password') as string
        const confirm = formData.get('confirm_password') as string

        if (password !== confirm) {
            setError("Passwords do not match.")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }

        setIsLoading(true)
        const result = await updatePassword(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex items-center justify-center">
            <StarTrailCanvas enableTrail={false} />

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="bg-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-none shadow-none">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-white/60" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-center mb-2">Set New Password</h2>
                    <p className="text-white/40 text-center text-sm mb-8">
                        Please enter your new password below.
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">New Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="Min. 6 characters"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Confirm New Password</label>
                            <input
                                name="confirm_password"
                                type="password"
                                placeholder="Confirm your password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                            />
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-white text-black font-bold py-3.5 rounded-full transition-all mt-2 cursor-pointer border border-transparent hover:bg-white/5 hover:text-white hover:border-purple-500/50 hover:backdrop-blur-sm flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
