import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment verified
            await prisma.user.update({
                where: { email: session.user.email! },
                data: {
                    subscriptionTier: 'premium',
                    razorpayCustomerId: razorpay_payment_id, // Storing payment ID as customer ID for simplicity
                },
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        console.error('Payment verification failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
