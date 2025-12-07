'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DodoPaymentButtonProps {
    planId: string;
}

export default function DodoPaymentButton({ planId }: DodoPaymentButtonProps) {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (status === 'loading') return;

        if (!session?.user?.email) {
            toast.error("Please log in to subscribe");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Connecting to secure payment...", { duration: 10000 });

        try {
            console.log("Initiating payment for:", session.user.email);
            const response = await fetch('/api/dodo/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: session.user.email,
                    planId: planId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Payment API Error:", data);
                throw new Error(data.error || 'Failed to initiate payment');
            }

            if (data.checkoutUrl) {
                console.log("Redirecting to:", data.checkoutUrl);
                toast.success("Redirecting to Dodo Payments...", { id: toastId });
                // Do NOT set loading to false, keep it disabled until page unloads
                window.location.href = data.checkoutUrl;
                return;
            } else {
                throw new Error('No checkout URL received from payment provider');
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error instanceof Error ? error.message : "Something went wrong", { id: toastId });
            setLoading(false); // Only reset on error
        }
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-6 shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl text-lg"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-5 w-5 fill-yellow-300 text-yellow-300" />
                    Subscribe to Price Tracker Pro
                </>
            )}
        </Button>
    );
}
