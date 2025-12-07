import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import DodoPaymentButton from '@/components/subscription/DodoPaymentButton';
import PaymentVerificationHandler from '@/components/subscription/PaymentVerificationHandler';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
    const session = await auth();
    if (!session?.user) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
    });

    const isPremium = user?.subscriptionTier === 'premium';

    return (
        <div className="max-w-4xl mx-auto">
            <PaymentVerificationHandler />
            <h1 className="text-2xl font-bold mb-6">Subscription & Billing</h1>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Free Plan */}
                <Card className={!isPremium ? 'border-blue-500 border-2' : ''}>
                    <CardHeader>
                        <CardTitle>Free Plan</CardTitle>
                        <CardDescription>Perfect for getting started</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-4">₹0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Track up to 3 products</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Hourly checks</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Email alerts</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <div className="w-full text-center py-2 bg-gray-100 rounded-md font-medium text-gray-500">
                            {isPremium ? 'Downgrade' : 'Current Plan'}
                        </div>
                    </CardFooter>
                </Card>

                {/* Premium Plan */}
                <Card className={isPremium ? 'border-blue-500 border-2 relative' : ''}>
                    {isPremium && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                            Active
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle>Premium Plan</CardTitle>
                        <CardDescription>For serious shoppers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-4 flex items-center gap-3">
                            <span className="line-through text-gray-400 text-2xl">₹999</span>
                            <span className="text-green-500">₹499</span>
                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Track up to 100 products</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 15-minute checks</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Priority alerts</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Price history charts</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Notifications</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {isPremium ? (
                            <div className="w-full text-center py-2 bg-green-100 text-green-700 rounded-md font-medium">
                                Active Subscription
                            </div>
                        ) : (
                            <DodoPaymentButton planId="pdt_0QvaUicdCeSK6ON7UOQdq" />
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div >
    );
}
