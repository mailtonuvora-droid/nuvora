'use server';

import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { generateAndSendOTP } from '@/lib/mail/send-otp';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// 1. Register Initial User (Unverified)
export async function registerUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const mobile = formData.get('mobile') as string;

    if (!email || !password) return { error: 'Missing fields' };

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        // If user exists but unverified, resend OTP? Or just say exists.
        // For simplicity, if verified, error. If unverified, maybe update?
        if (existingUser.emailVerified) {
            return { error: 'User already exists' };
        }
        // If unverified, we update the password/details and resend OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { email },
            data: { name, password: hashedPassword, mobile }
        });
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                mobile,
            },
        });
    }

    // Send OTP
    await generateAndSendOTP(email, 'VERIFICATION');
    return { success: true, email };
}

// 2. Verify OTP and Login
export async function verifyOtpAndLogin(email: string, otp: string, password?: string) {
    const token = await prisma.verificationToken.findFirst({
        where: {
            identifier: email,
            token: otp,
            expires: { gt: new Date() }
        }
    });

    if (!token) return { error: 'Invalid or expired OTP' };

    // Mark user verified
    await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() }
    });

    // Clean up token
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token: otp } } });

    // Attempt Login
    // Note: We can't use signIn credentials directly here easily because it expects form data or redirects.
    // Ideally the UI handles the sign in call after verification success.
    return { success: true };
}

// 3. Initiate Password Reset
export async function sendPasswordResetOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: 'User not found' }; // Or silent fail for security

    await generateAndSendOTP(email, 'RESET');
    return { success: true };
}

// 4. Reset Password with OTP
export async function resetPassword(email: string, otp: string, newPassword: string) {
    const token = await prisma.verificationToken.findFirst({
        where: {
            identifier: email,
            token: otp,
            expires: { gt: new Date() }
        }
    });

    if (!token) return { error: 'Invalid or expired OTP' };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    // Clean up
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token: otp } } });

    return { success: true };
}
