"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StarTrailCanvas } from '@/components/ui/star-trail-background';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from 'next/link';
import { login, signup, signInWithGoogle, signInWithApple } from './actions';

function SignupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    async function handleGoogleLogin() {
        setIsSocialLoading('google');
        setError(null);
        const result = await signInWithGoogle();
        if (result?.error) {
            setError(result.error);
            setIsSocialLoading(null);
        }
    }

    async function handleAppleLogin() {
        setIsSocialLoading('apple');
        setError(null);
        const result = await signInWithApple();
        if (result?.error) {
            setError(result.error);
            setIsSocialLoading(null);
        }
    }

    useEffect(() => {
        if (searchParams.get('mode') === 'login') {
            setIsLogin(true);
        }
        const msg = searchParams.get('message');
        if (msg) {
            setMessage(msg);
        }
    }, [searchParams]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData(event.currentTarget);

        if (isLogin) {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
            }
        } else {
            const result = await signup(formData);
            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
            } else if (result?.success) {
                setMessage("Success! Please check your email to confirm your account.");
                setIsLoading(false);
            }
        }
    }

    return (
        <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex items-center justify-center">
            {/* Background */}
            <StarTrailCanvas enableTrail={false} />

            {/* Content w/ Glassmorphism Card */}
            <div className="relative z-10 w-full max-w-md p-8">
                {/* Back Button on top of card */}
                <div className="mb-6 flex justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-all text-sm font-medium backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="bg-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-none shadow-none">

                    {/* Toggle */}
                    <div className="flex bg-white/5 rounded-full p-1 mb-8 relative">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-full transition-all duration-300 ease-out ${isLogin ? 'translate-x-full' : 'translate-x-0'}`}
                        ></div>
                        <button
                            onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors cursor-pointer ${!isLogin ? 'text-white' : 'text-white/40'}`}
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors cursor-pointer ${isLogin ? 'text-white' : 'text-white/40'}`}
                        >
                            Login
                        </button>
                    </div>

                    <h2 className="text-3xl font-bold text-center mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-white/40 text-center text-sm mb-8">
                        {isLogin ? 'Enter your details to access your account' : 'Join the spatial audio revolution today'}
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

                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>

                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Full Name</label>
                                <input
                                    name="full_name"
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                                />
                            </div>
                        )}

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

                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm pr-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {isLogin && (
                                <div className="mt-2 flex justify-end">
                                    <Link
                                        href="/forgot-password"
                                        className="text-[10px] text-white/40 hover:text-purple-400 transition-colors uppercase tracking-wider font-medium"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-white text-black font-bold py-3.5 rounded-full transition-all mt-2 cursor-pointer border border-transparent hover:bg-white/5 hover:text-white hover:border-purple-500/50 hover:backdrop-blur-sm flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>

                    </form>

                    <div className="flex items-center gap-4 my-8">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span className="text-white/40 text-xs uppercase">Or continue with</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={!!isSocialLoading}
                            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-3 transition-colors text-white cursor-pointer disabled:opacity-50"
                        >
                            {isSocialLoading === 'google' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <FcGoogle className="w-5 h-5" />
                            )}
                            <span className="text-sm font-medium">
                                {isSocialLoading === 'google' ? 'Connecting...' : 'Sign in with Google'}
                            </span>
                        </button>
                        <button
                            onClick={handleAppleLogin}
                            disabled={!!isSocialLoading}
                            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-3 transition-colors text-white cursor-pointer disabled:opacity-50"
                        >
                            {isSocialLoading === 'apple' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <FaApple className="w-5 h-5" />
                            )}
                            <span className="text-sm font-medium">
                                {isSocialLoading === 'apple' ? 'Connecting...' : 'Sign in with Apple'}
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SignupContent />
        </React.Suspense>
    );
}
