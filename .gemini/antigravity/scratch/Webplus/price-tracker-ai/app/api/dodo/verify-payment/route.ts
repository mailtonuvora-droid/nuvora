import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import getConfig from 'next/config';

// Helper to interact with Dodo API
async function dodoFetch(endpoint: string, apiKey: string) {
    const response = await fetch(`https://live.dodopayments.com${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error(`Dodo API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const apiKey = process.env.DODO_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        console.log(`Verify: Checking payments for ${email}`);

        // 1. Find Customer by Email
        // Dodo API: GET /customers?email=...
        const customersData = await dodoFetch(`/customers?email=${encodeURIComponent(email)}`, apiKey);

        // Response format is likely { items: [...] } or just [...] depending on pagination. 
        // SDK says it's a paginated list. Let's assume 'items' or 'data' or just an array.
        // If the SDK uses DefaultPageNumberPagination, usually it returns the list directly or wrapped.
        // Let's iterate whatever array we find.
        const customers = Array.isArray(customersData) ? customersData : (customersData.items || customersData.data || []);

        if (customers.length === 0) {
            console.log("Verify: No customer found with this email.");
            // Fallback: If no customer found, maybe payment exists but customer indexing is slow?
            // Unlikely. Return false.
            return NextResponse.json({ verified: false, message: 'No customer record found' });
        }

        const customerId = customers[0].customer_id;
        console.log(`Verify: Found customer ID ${customerId}`);

        // 2. Find Successful Payments for Customer
        // Dodo API: GET /payments?customer_id=...&status=succeeded
        const paymentsData = await dodoFetch(`/payments?customer_id=${customerId}&status=succeeded`, apiKey);
        const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData.items || paymentsData.data || []);

        if (payments.length > 0) {
            console.log(`Verify: Found ${payments.length} successful payments.`);

            // 3. Update Database
            const now = new Date();
            const oneMonthFromNow = new Date(now);
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

            await prisma.user.update({
                where: { email: email },
                data: {
                    subscriptionTier: 'premium',
                    subscriptionStatus: 'active',
                    subscriptionStartDate: now,
                    subscriptionEndDate: oneMonthFromNow
                },
            });

            return NextResponse.json({ verified: true });
        } else {
            console.log("Verify: Customer found but no successful payments.");
            return NextResponse.json({ verified: false, message: 'No successful payment found' });
        }

    } catch (error: any) {
        console.error("Verify Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
