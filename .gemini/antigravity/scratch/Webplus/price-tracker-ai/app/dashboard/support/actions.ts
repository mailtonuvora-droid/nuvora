'use server';

import { auth } from '@/auth';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const supportSchema = z.object({
    subject: z.string().min(3, "Subject is required"),
    message: z.string().min(10, "Message must be at least 10 characters long"),
});

export async function sendSupportMessage(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: "You must be logged in to send a support message." };
    }

    const validatedFields = supportSchema.safeParse({
        subject: formData.get('subject'),
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { subject, message } = validatedFields.data;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL, // frompricetrackerai@gmail.com
            to: 'saravanavenkatachalam@gmail.com', // Admin email (hidden from user)
            replyTo: session.user.email, // So admin can reply directly to user
            subject: `[Support] ${subject}`,
            text: `Message from user: ${session.user.email}\n\n${message}`,
            html: `
                <h3>New Support Message</h3>
                <p><strong>From:</strong> ${session.user.email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr/>
                <p>${message.replace(/\n/g, '<br/>')}</p>
            `,
        });

        return { success: true, message: "Message sent! We'll get back to you soon." };
    } catch (error) {
        console.error('Support email error:', error);
        return { error: "Failed to send message. Please try again later." };
    }
}
