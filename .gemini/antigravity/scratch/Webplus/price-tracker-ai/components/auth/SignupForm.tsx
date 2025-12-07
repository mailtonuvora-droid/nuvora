'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { registerUser, verifyOtpAndLogin } from '@/app/actions/auth-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SignupForm() {
    const [step, setStep] = useState<'REGISTER' | 'VERIFY'>('REGISTER');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Keep password to auto-login if verify works (?)
    // Actually, verifies just marks verified. We can redirect to login.

    const router = useRouter();

    async function handleRegister(formData: FormData) {
        setLoading(true);
        const res = await registerUser(formData);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else if (res.success && res.email) {
            setEmail(res.email);
            setStep('VERIFY');
            toast.success('OTP sent to your email!');
        }
    }

    async function handleVerify(formData: FormData) {
        setLoading(true);
        const otp = formData.get('otp') as string;
        const res = await verifyOtpAndLogin(email, otp);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Account verified! Please login.');
            router.push('/login');
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{step === 'REGISTER' ? 'Sign Up' : 'Verify Email'}</CardTitle>
                <CardDescription>
                    {step === 'REGISTER'
                        ? 'Create an account to start tracking prices'
                        : `Enter the 6-digit code sent to ${email}`}
                </CardDescription>
            </CardHeader>

            {step === 'REGISTER' ? (
                <form action={handleRegister}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile (Optional)</Label>
                            <Input id="mobile" name="mobile" type="tel" placeholder="+91 9876543210" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Sign Up'}
                        </Button>
                        <div className="text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="underline">
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            ) : (
                <form action={handleVerify}>
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
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Create Account'}
                        </Button>
                        <button
                            type="button"
                            onClick={() => setStep('REGISTER')}
                            className="text-sm underline text-zinc-500"
                        >
                            Change Email
                        </button>
                    </CardFooter>
                </form>
            )}
        </Card>
    );
}
