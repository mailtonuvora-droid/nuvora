
import { prisma } from '@/lib/db/prisma';
import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

export async function generateAndSendOTP(email: string, type: 'VERIFICATION' | 'RESET') {
    // 1. Generate 6-digit OTP
    const otp = randomInt(100000, 999999).toString();
    const expires = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 minutes

    // 2. Store in DB (Delete existing tokens for this email first)
    await prisma.verificationToken.deleteMany({
        where: { identifier: email },
    });

    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token: otp,
            expires,
        },
    });

    // 3. Send Email
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const subject = type === 'VERIFICATION'
        ? 'Verify your email - Price Tracker AI'
        : 'Reset your password - Price Tracker AI';

    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h1 style="color: #6366f1;">${otp}</h1>
            <p>Use this code to ${type === 'VERIFICATION' ? 'verify your account' : 'reset your password'}.</p>
            <p>This code will expire in 10 minutes.</p>
        </div>
    `;

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject,
        html,
    });

    return { success: true };
}
