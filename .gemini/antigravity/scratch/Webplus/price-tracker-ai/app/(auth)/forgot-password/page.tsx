'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { sendPasswordResetOtp, resetPassword } from '@/app/actions/auth-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'EMAIL' | 'RESET'>('EMAIL');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const router = useRouter();

    async function handleSendOtp(formData: FormData) {
        setLoading(true);
        const emailInput = formData.get('email') as string;
        const res = await sendPasswordResetOtp(emailInput);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            setEmail(emailInput);
            setStep('RESET');
            toast.success('OTP sent to your email!');
        }
    }

    async function handleReset(formData: FormData) {
        setLoading(true);
        const otp = formData.get('otp') as string;
        const password = formData.get('password') as string;

        const res = await resetPassword(email, otp, password);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Password reset successfully! Please login.');
            router.push('/login');
        }
    }

    return (
        <main className="flex items-center justify-center md:h-screen p-4">
            <Card className="w-full max-w-[400px]">
                <CardHeader>
                    <CardTitle>{step === 'EMAIL' ? 'Forgot Password' : 'Reset Password'}</CardTitle>
                    <CardDescription>
                        {step === 'EMAIL'
                            ? 'Enter your email to receive a reset code'
                            : `Enter the code sent to ${email}`}
                    </CardDescription>
                </CardHeader>

                {step === 'EMAIL' ? (
                    <form action={handleSendOtp}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                            <div className="text-center text-sm">
                                <Link href="/login" className="underline">Back to Login</Link>
                            </div>
                        </CardFooter>
                    </form>
                ) : (
                    <form action={handleReset}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Enter OTP</Label>
                                <Input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    placeholder="123456"
                                    required
                                    maxLength={6}
                                    className="text-center text-2xl tracking-widest"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input id="password" name="password" type="password" required minLength={6} placeholder="******" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full" disabled={loading}>
                                {loading ? 'Resetting...' : 'Update Password'}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep('EMAIL')}
                                className="text-sm underline text-zinc-500"
                            >
                                Change Email
                            </button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </main>
    );
}
