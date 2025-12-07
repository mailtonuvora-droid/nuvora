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
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            });

            if (user.email) {
                await transporter.sendMail({
                    from: process.env.SMTP_EMAIL,
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

export async function generateTelegramConnectToken() {
    try {
        const session = await auth();
        let userEmail = session?.user?.email;
        if (!userEmail) return { error: "User not found" };

        const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code

        await prisma.user.update({
            where: { email: userEmail },
            data: { telegramConnectToken: token }
        });

        return { token };
    } catch (e: any) {
        console.error("Telegram Token Generation Error:", e);
        return { error: `Server Error: ${e.message}` };
    }
}

export async function verifyTelegramConnection() {
    const session = await auth();
    let userEmail = session?.user?.email;
    if (!userEmail) return { error: "User not found" };

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user || !user.telegramConnectToken) return { error: "No connection token found. Click 'Connect' again." };

    const tokenToFind = user.telegramConnectToken;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) return { error: "Server Error: Bot token missing" };

    try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
        const data = await res.json();

        if (!data.ok) return { error: "Failed to fetch updates from Telegram" };

        const match = data.result.find((update: any) =>
            update.message && update.message.text && update.message.text.includes(tokenToFind)
        );

        if (match) {
            const chatId = match.message.chat.id.toString();

            await prisma.user.update({
                where: { email: userEmail },
                data: {
                    telegramChatId: chatId,
                    telegramConnectToken: null, // Clear token after success
                    emailNotifications: true // Enable by default or keep as is
                }
            });

            // Send confirmation message
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: "✅ Connected! You will now receive price alerts here."
                })
            });

            revalidatePath('/notifications');
            return { success: true };
        } else {
            return { error: "Message not found. Please send the code to the bot and try again." };
        }

    } catch (e) {
        console.error(e);
        return { error: "Failed to verify connection" };
    }
}

export async function unlinkTelegram() {
    const session = await auth();
    if (!session?.user?.email) return;

    await prisma.user.update({
        where: { email: session.user.email },
        data: { telegramChatId: null }
    });
    revalidatePath('/notifications');
}
