import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
    console.log("Webhook: Received Dodo Event");

    try {
        const payload = await request.json();
        console.log("Webhook Payload:", JSON.stringify(payload, null, 2));

        // Dodo Payments typically sends 'payment.succeeded' or 'subscription.active'
        // Adjust based on the actual event type sent by Dodo for checkout sessions
        const { type, data } = payload;

        // Handle checkout session completion or payment success
        if (type === 'payment.succeeded' || type === 'checkout.session.completed') {
            const customerEmail = data.customer_email || data.customer?.email;

            if (customerEmail) {
                console.log(`Webhook: Upgrading user ${customerEmail} to premium`);

                const now = new Date();
                const oneMonthFromNow = new Date(now);
                oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

                await prisma.user.update({
                    where: { email: customerEmail },
                    data: {
                        subscriptionTier: 'premium',
                        subscriptionStatus: 'active',
                        subscriptionStartDate: now,
                        subscriptionEndDate: oneMonthFromNow
                    },
                });

                console.log(`Webhook: Successfully upgraded ${customerEmail}`);
                return NextResponse.json({ received: true });
            } else {
                console.error("Webhook Error: No email found in payload");
                return NextResponse.json({ error: 'No email in payload' }, { status: 400 });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
