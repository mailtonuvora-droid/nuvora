'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function PaymentVerificationHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const hasVerified = useRef(false);

    useEffect(() => {
        const success = searchParams.get('success');

        if (success === 'true' && session?.user?.email && !hasVerified.current) {
            hasVerified.current = true;
            toast.loading("Verifying your payment...", { id: "verify-payment" });

            fetch('/api/dodo/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session.user.email })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.verified) {
                        toast.success("Payment verified! Subscription activated.", { id: "verify-payment" });
                        router.refresh();

                        // Remove the query param to check again on reload
                        const url = new URL(window.location.href);
                        url.searchParams.delete('success');
                        window.history.replaceState({}, '', url);
                    } else {
                        toast.error(data.message || "Could not verify payment yet. Please wait a moment.", { id: "verify-payment" });
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error("Error verifying payment", { id: "verify-payment" });
                });
        }
    }, [searchParams, session, router]);

    return null; // This component handles side effects only
}
