// Dodo Payments Configuration
const DODO_CONFIG = {
    apiKey: 'irtDew7e00_ZgCFB.mrtfW5Jx7uqXm-mApM82TlPeYoqHnI9PCLoUOmta_7debTAe',
    productId: 'pdt_0NXAXk31D7GF7kqxdwf3Z',
    apiBaseUrl: window.location.hostname === 'localhost' ? 'https://live.dodopayments.com' : '/api/dodo'
};

// Create Dodo Payment Checkout
async function createDodoPaymentSession(orderData) {
    try {
        console.log('Creating Dodo payment checkout...', orderData);

        // Prepare payload matching Price Tracker format
        // For "Pay What You Want" (PWYW) set in Dashboard:
        // We pass quantity: 1 and use 'payment_amount' (or paymentAmount) to set the price programmatically.
        // Dodo expects amount in smallest currency unit (e.g. Cents/Paise).
        const amountInSmallestUnit = Math.round(orderData.total_amount * 100);

        const payload = {
            product_cart: [
                {
                    product_id: DODO_CONFIG.productId,
                    quantity: 1,
                    amount: amountInSmallestUnit,        // Try amount inside cart
                    payment_amount: amountInSmallestUnit // Try payment_amount inside cart
                }
            ],
            paymentAmount: amountInSmallestUnit, // Keep at top level just in case
            amount: amountInSmallestUnit,        // Keep at top level just in case
            total_amount: amountInSmallestUnit,  // Keep at top level just in case
            billing_address: {
                street: orderData.address || '',
                city: orderData.city || '',
                state: orderData.state || '',
                zipcode: orderData.pincode || '',   // Dodo's preferred
                zip_code: orderData.pincode || '',  // Common variation
                zip: orderData.pincode || '',       // Legacy attempt
                country: 'IN'
            },
            customer: {
                email: orderData.email || 'customer@example.com',
                name: `${orderData.first_name} ${orderData.last_name}`
            },
            payment_link: true, // Generate a payment link
            return_url: `${window.location.origin}/order-success.html?order_id=${orderData.order_id}`
        };

        console.log('Payment payload:', payload);

        const response = await fetch(`${DODO_CONFIG.apiBaseUrl}/checkouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DODO_CONFIG.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Dodo API Error Response:', errorText);

            let errorMessage = `Payment provider error: ${response.statusText}`;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch (e) {
                // Use default error message
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Payment checkout created:', data);

        // Extract checkout URL (can be 'url', 'checkout_url', or 'payment_link')
        const checkoutUrl = data.url || data.checkout_url || data.payment_link;

        if (!checkoutUrl) {
            console.error('No checkout URL in response:', data);
            throw new Error('No checkout URL received from payment provider');
        }

        return {
            checkout_url: checkoutUrl,
            payment_id: data.id,
            ...data
        };
    } catch (error) {
        console.error('❌ Dodo Payment Error:', error);

        // Provide helpful error message
        if (error.message.includes('Failed to fetch')) {
            console.error('💡 Network error - check your internet connection');
            console.error('💡 This might be a CORS issue. Consider using a server-side proxy.');

            // Fallback to direct link
            console.log('🔄 Attempting fallback to direct payment link...');
            return createDirectPaymentLink(orderData);
        }

        throw error;
    }
}

// Fallback: Direct payment link
function createDirectPaymentLink(orderData) {
    console.log('Using direct payment link fallback');

    // Create direct payment URL
    const params = new URLSearchParams({
        product_id: DODO_CONFIG.productId,
        quantity: '1',
        customer_email: orderData.email || '',
        customer_name: `${orderData.first_name} ${orderData.last_name}`,
        return_url: `${window.location.origin}/order-success.html?order_id=${orderData.order_id}`
    });

    const checkoutUrl = `https://dodopayments.com/pay/${DODO_CONFIG.productId}?${params.toString()}`;

    return {
        checkout_url: checkoutUrl,
        direct_link: true
    };
}

// Initialize Dodo Payments
window.DodoPayments = {
    config: DODO_CONFIG,
    createSession: createDodoPaymentSession,
    createDirectLink: createDirectPaymentLink
};

console.log('🔧 Dodo Payments initialized');
