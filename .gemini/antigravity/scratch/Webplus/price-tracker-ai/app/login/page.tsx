'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { Facebook, Mail, Lock, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            aria-disabled={pending}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold text-lg shadow-md hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
        >
            {pending ? 'Logging in...' : (
                <>
                    LOGIN <ArrowRight className="w-5 h-5" />
                </>
            )}
        </button>
    );
}

export default function LoginPage() {
    const [errorMessage, setErrorMessage] = useState('');

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-5xl h-[600px] bg-white rounded-2xl overflow-hidden flex shadow-2xl border border-slate-100">

                {/* Left Side - Blue Branding */}
                <div className="hidden md:flex w-1/2 bg-blue-600 relative flex-col items-center justify-between p-12 text-white overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                        </svg>
                    </div>

                    <div className="z-10 text-center">
                        <h1 className="text-4xl font-bold mb-4 tracking-tight">Price Tracker AI</h1>
                        <p className="text-blue-100 text-lg">Track prices, get alerts, and save money efficiently.</p>
                    </div>

                    <div className="z-10 w-full">
                        <blockquote className="italic text-blue-100 border-l-4 border-white/30 pl-4 mb-4">
                            "This tool has saved me hundreds on my online shopping. Highly recommended!"
                        </blockquote>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-400"></div>
                            <span className="text-sm font-medium">Verified User</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center relative bg-white">

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Please enter your details to sign in.</p>
                    </div>

                    <form action={async (formData) => {
                        const res = await authenticate(undefined, formData);
                        if (res) setErrorMessage(res);
                    }} className="w-full max-w-sm space-y-5">

                        <div className="space-y-1">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    required
                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-slate-600">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        {errorMessage && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {errorMessage}
                            </div>
                        )}

                        <LoginButton />

                    </form>

                    <div className="mt-8 text-center">
                        <span className="text-slate-500 text-sm">Don't have an account? </span>
                        <Link href="/signup" className="text-blue-600 font-semibold text-sm hover:underline">
                            Sign up
                        </Link>
                    </div>

                    {/* Socials - Simple Icons */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center gap-4">
                        <button className="p-2 rounded-full bg-slate-100 hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-600 hover:text-blue-600">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /></svg>
                        </button>
                        <button className="p-2 rounded-full bg-slate-100 hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-600 hover:text-blue-800">
                            <Facebook className="w-5 h-5" fill="currentColor" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
