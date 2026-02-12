"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { StarTrailCanvas } from '@/components/ui/star-trail-background';
import { ArrowLeft } from 'lucide-react';
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from 'next/link';

export default function SignupPage() {
    const searchParams = useSearchParams();
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        if (searchParams.get('mode') === 'login') {
            setIsLogin(true);
        }
    }, [searchParams]);

    return (
        <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex items-center justify-center">
            {/* Background */}
            <StarTrailCanvas enableTrail={false} />

            {/* Back Button */}
            <div className="absolute top-8 left-8 z-50">
                <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-lg font-medium">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>

            {/* Content w/ Glassmorphism Card */}
            <div className="relative z-10 w-full max-w-md p-8">

                <div className="bg-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-none shadow-none">

                    {/* Toggle */}
                    <div className="flex bg-white/5 rounded-full p-1 mb-8 relative">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-full transition-all duration-300 ease-out ${isLogin ? 'translate-x-full' : 'translate-x-0'}`}
                        ></div>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors cursor-pointer ${!isLogin ? 'text-white' : 'text-white/40'}`}
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={() => setIsLogin(true)}
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

                    {/* Form */}
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>

                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                            />
                        </div>

                        <button className="w-full bg-white text-black font-bold py-3.5 rounded-full transition-all mt-2 cursor-pointer border border-transparent hover:bg-white/5 hover:text-white hover:border-purple-500/50 hover:backdrop-blur-sm">
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>

                    </form>

                    <div className="flex items-center gap-4 my-8">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span className="text-white/40 text-xs uppercase">Or continue with</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-3 transition-colors text-white cursor-pointer">
                            <FcGoogle className="w-5 h-5" />
                            <span className="text-sm font-medium">Sign in with Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-3 transition-colors text-white cursor-pointer">
                            <FaApple className="w-5 h-5" />
                            <span className="text-sm font-medium">Sign in with Apple</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
