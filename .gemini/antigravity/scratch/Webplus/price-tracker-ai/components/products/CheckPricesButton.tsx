'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function CheckPricesButton() {
    const [isChecking, setIsChecking] = useState(false);
    const [message, setMessage] = useState('');

    const handleCheckPrices = async () => {
        setIsChecking(true);
        setMessage('');

        try {
            const response = await fetch('/api/monitor/check-prices', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ ${data.message || 'Prices updated successfully!'}`);
                // Reload the page after 2 seconds to show updated prices
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setMessage(`❌ ${data.error || 'Failed to check prices'}`);
            }
        } catch (error) {
            setMessage('❌ Error checking prices');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-2">
            <Button
                onClick={handleCheckPrices}
                disabled={isChecking}
                variant="outline"
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-400"
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking Prices...' : 'Check Prices Now'}
            </Button>
            {message && (
                <p className="text-sm font-medium">{message}</p>
            )}
        </div>
    );
}
