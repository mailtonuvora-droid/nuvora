import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    console.log("API: Dodo Subscription Create Request Received");

    const apiKey = process.env.DODO_API_KEY;
    if (!apiKey) {
        console.error("API Error: DODO_API_KEY is missing");
        return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
    }

    let body;
    try {
        body = await request.json();
    } catch (e) {
        console.error("API Error: Failed to parse JSON body");
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { email, planId } = body;
    console.log(`API: Processing subscription regarding ${email} for plan ${planId}`);

    if (!email || !planId) {
        console.error("API Error: Missing email or planId", { email, planId });
        return NextResponse.json({ error: 'Missing email or planId' }, { status: 400 });
    }

    const payload = {
        product_cart: [
            {
                product_id: planId,
                quantity: 1
            }
        ],
        billing_address: {
            country: 'IN', // Defaulting to India as per user context or generic default
        },
        customer: {
            email: email,
        },
        payment_link: true, // Generate a link
        return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
    };

    try {
        const response = await fetch('https://live.dodopayments.com/checkouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error from Dodo:", errorText);

            let errorMessage = `Payment provider error: ${response.statusText}`;
            try {
                const errorJson = JSON.parse(errorText);
                // Dodo usually returns { code: string, message: string }
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch (e) {
                // If parsing fails, use the raw text or default message
            }

            return NextResponse.json({ error: errorMessage, details: errorText }, { status: response.status });
        }

        const data = await response.json();
        // The checking session API returns 'url' or 'payment_link' or 'checkout_url'? 
        // Based on search it returns 'checkout_url' or similar. 
        // If the previous code expected 'checkout_url', I'll map whatever Dodo returns.
        // Usually checkout sessions return { url: '...' } or { checkout_url: '...' }
        const checkoutUrl = data.url || data.checkout_url || data.payment_link;

        console.log("API: Success, received checkout URL", checkoutUrl);
        return NextResponse.json({ checkoutUrl });

    } catch (error) {
        console.error("API Error: Fetch failed", error);
        return NextResponse.json({ error: 'Internal server error connecting to payment provider' }, { status: 500 });
    }
}
