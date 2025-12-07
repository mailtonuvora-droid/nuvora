
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Price Tracker AI - Test Email',
            html: `
                <h1>It Works!</h1>
                <p>This is a test email from your Price Tracker application.</p>
                <p>If you are reading this, your Gmail SMTP configuration is correct!</p>
                <br>
                <p>Time: ${new Date().toLocaleString()}</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Test email sent:', info.messageId);

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully!',
            messageId: info.messageId,
            preview: 'Check your Gmail inbox'
        });

    } catch (error: any) {
        console.error('Test email failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
