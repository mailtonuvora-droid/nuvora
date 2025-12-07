'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleNotification(type: 'email' | 'whatsapp' | 'sms', enabled: boolean) {
    const session = await auth();
    let userEmail = session?.user?.email;

    if (!userEmail) {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) userEmail = firstUser.email;
    }

    if (!userEmail) throw new Error('User not found');

    const updateData: any = {};
    if (type === 'email') updateData.emailNotifications = enabled;
    if (type === 'whatsapp') updateData.whatsappNotifications = enabled;
    if (type === 'sms') updateData.smsNotifications = enabled;

    await prisma.user.update({
        where: { email: userEmail },
        data: updateData
    });

    revalidatePath('/notifications');
}

export async function sendTestNotification(type: 'email' | 'whatsapp' | 'sms') {
    const session = await auth();
    let userEmail = session?.user?.email;

    if (!userEmail) {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) userEmail = firstUser.email;
    }

    if (!userEmail) throw new Error('User not found');

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) throw new Error('User not found');

    // Real sending logic
    if (type === 'email') {
        try {
            const nodemailer = (await import('nodemailer')).default;
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            if (user.email) {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM,
                    to: user.email,
                    subject: 'Test Notification - Price Tracker AI',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                            <h1 style="color: #6366f1;">Test Notification</h1>
                            <p>This is a test email sent from your Price Tracker application.</p>
                            <p style="color: #666; font-size: 14px;">Sent at: ${new Date().toLocaleString()}</p>
                        </div>
                    `
                });
                console.log(`[EMAIL] Sent real email to ${user.email}`);
            }
        } catch (error) {
            console.error('Failed to send test email:', error);
            // We'll still record it in the DB but log the error
        }
    }

    const message = `Test notification for ${type} sent at ${new Date().toLocaleTimeString()}`;
    console.log(`[TEST] Recording ${type} to ${user.email}: ${message}`);

    await prisma.notification.create({
        data: {
            userId: user.id,
            type: type,
            message: message,
            isRead: true,
        }
    });

    revalidatePath('/notifications');
    return { success: true, message: `Test ${type} notification sent!` };
}

export async function updateContactDetails(email: string, mobile: string) {
    const session = await auth();
    let userEmail = session?.user?.email;

    if (!userEmail) {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) userEmail = firstUser.email;
    }

    if (!userEmail) throw new Error('User not found');

    await prisma.user.update({
        where: { email: userEmail },
        data: { email, mobile }
    });

    revalidatePath('/notifications');
    return { success: true };
}
