import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { scrapeProduct } from '@/lib/scraping/playwright-scraper';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { url } = await req.json();

        // Check limits
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            include: { _count: { select: { products: true } } }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Check if product already exists for this user
        const existingProduct = await prisma.product.findFirst({
            where: { userId: user.id, url }
        });

        if (existingProduct) {
            return NextResponse.json({
                error: 'You are already tracking this product. Delete it first to re-add.'
            }, { status: 400 });
        }

        const isPremium = user.subscriptionTier === 'premium';
        const limit = isPremium ? 100 : 3;

        if (user._count.products >= limit) {
            return NextResponse.json({
                error: `Limit reached. You can only track ${limit} products on the ${user.subscriptionTier} plan.`
            }, { status: 403 });
        }

        // Scrape product
        const scrapedData = await scrapeProduct(url);

        if (!scrapedData) {
            return NextResponse.json({
                error: 'Failed to scrape product details. The website may be blocking automated requests.'
            }, { status: 400 });
        }

        // Check if scraper got blocked (CAPTCHA page)
        if (scrapedData.price === 0 && scrapedData.title?.toLowerCase().includes('robot')) {
            return NextResponse.json({
                error: 'This website is blocking automated requests. Try a different product or website.'
            }, { status: 400 });
        }

        if (scrapedData.price === 0) {
            return NextResponse.json({
                error: 'Could not extract price from this page. The website may have changed or be unsupported.'
            }, { status: 400 });
        }

        // Save to DB
        const product = await prisma.product.create({
            data: {
                userId: user.id,
                url,
                title: scrapedData.title,
                currentPrice: scrapedData.price,
                initialPrice: scrapedData.price,
                currency: scrapedData.currency,
                imageUrl: scrapedData.imageUrl,
                isAvailable: scrapedData.isAvailable,
                priceHistory: {
                    create: {
                        price: scrapedData.price,
                        isAvailable: scrapedData.isAvailable
                    }
                }
            }
        });

        return NextResponse.json({ product });

    } catch (error: any) {
        console.error('Add product error:', error);

        // Handle unique constraint violation specifically
        if (error?.code === 'P2002') {
            return NextResponse.json({
                error: 'You are already tracking this product.'
            }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
