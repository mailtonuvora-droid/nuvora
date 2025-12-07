import { prisma } from '@/lib/db/prisma';
import { scrapeProduct } from '@/lib/scraping/playwright-scraper';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function checkPrices() {
    const now = new Date();

    // Find products due for check
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { nextCheckAt: { lte: now } },
                { nextCheckAt: null }
            ]
        },
        include: { user: true }
    });

    console.log(`Checking ${products.length} products...`);

    const results = [];

    for (const product of products) {
        try {
            const scrapedData = await scrapeProduct(product.url);

            if (scrapedData) {
                const oldPrice = Number(product.currentPrice);
                const newPrice = scrapedData.price;

                // Update product
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        title: scrapedData.title || product.title,
                        imageUrl: scrapedData.imageUrl || product.imageUrl,
                        currentPrice: newPrice,
                        isAvailable: scrapedData.isAvailable,
                        lastCheckedAt: now,
                        nextCheckAt: new Date(now.getTime() + product.checkInterval * 1000),
                        priceHistory: {
                            create: {
                                price: newPrice,
                                isAvailable: scrapedData.isAvailable
                            }
                        }
                    }
                });

                // Check alerts
                // Trigger if:
                // 1. Any Drop is enabled AND price dropped (new < old)
                // 2. OR Target Price is set AND price is below target AND price dropped
                const isPriceDrop = newPrice < oldPrice;
                const matchesTarget = product.alertThreshold ? newPrice <= Number(product.alertThreshold) : false;

                if (product.alertEnabled && isPriceDrop && (product.notifyAnyDrop || matchesTarget)) {
                    const message = `Price dropped for ${product.title} from ₹${oldPrice} to ₹${newPrice}`;

                    // 1. Email Notification
                    if (product.user.emailNotifications && product.user.email) {
                        try {
                            await transporter.sendMail({
                                from: process.env.SMTP_FROM,
                                to: product.user.email,
                                subject: `Price Drop Alert: ${product.title}`,
                                html: `
                                    <h1>Price Drop!</h1>
                                    <p>The price for <strong>${product.title}</strong> has dropped!</p>
                                    <p>Old Price: ₹${oldPrice}</p>
                                    <p>New Price: <strong>₹${newPrice}</strong></p>
                                    <a href="${product.url}">View Product</a>
                                `
                            });
                            console.log(`Email sent to ${product.user.email}`);
                        } catch (e) {
                            console.error('Failed to send email:', e);
                        }
                    }

                    // 2. WhatsApp Notification (Premium Only)
                    if (product.user.whatsappNotifications && product.user.subscriptionTier === 'premium') {
                        console.log(`[WhatsApp] Sending to ${product.user.mobile || 'User'}: ${message}`);
                        // In reality, call Twilio/Meta API here
                    }

                    // 3. SMS Notification (Premium Only)
                    if (product.user.smsNotifications && product.user.subscriptionTier === 'premium') {
                        console.log(`[SMS] Sending to ${product.user.mobile || 'User'}: ${message}`);
                    }

                    // Log notification to DB
                    await prisma.notification.create({
                        data: {
                            userId: product.userId,
                            productId: product.id,
                            type: 'price_drop',
                            message: `Price dropped from ₹${oldPrice} to ₹${newPrice}`,
                            isRead: false
                        }
                    });
                }

                results.push({ id: product.id, status: 'updated', oldPrice, newPrice });
            } else {
                results.push({ id: product.id, status: 'failed' });
            }
        } catch (err) {
            console.error(`Error checking product ${product.id}:`, err);
            results.push({ id: product.id, status: 'error' });
        }
    }

    return { message: `Checked ${products.length} products`, checked: products.length, results };
}

export async function GET(req: Request) {
    try {
        const result = await checkPrices();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Monitor error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const result = await checkPrices();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Monitor error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
