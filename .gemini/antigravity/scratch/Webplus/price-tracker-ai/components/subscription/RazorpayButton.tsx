'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function RazorpayButton() {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Order
            const res = await fetch('/api/razorpay/create-order', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: 'Price Tracker AI',
                description: 'Premium Subscription',
                order_id: data.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    const verifyRes = await fetch('/api/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });

                    if (verifyRes.ok) {
                        window.location.reload(); // Refresh to show premium status
                    } else {
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    name: 'User Name',
                    email: 'user@example.com',
                },
                theme: {
                    color: '#3b82f6',
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment initialization failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Button onClick={handlePayment} disabled={loading} className="w-full">
                {loading ? 'Processing...' : 'Upgrade to Premium (₹999/mo)'}
            </Button>
        </>
    );
}
