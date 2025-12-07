import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Bell, TrendingDown, Target, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
    return (
        <div className="container mx-auto py-6 md:py-10 space-y-6 md:space-y-8 p-4 md:p-6">
            <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Help & FAQ
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                    Learn how price alerts and notifications work.
                </p>
            </div>

            <div className="grid gap-6">
                {/* How Notifications Work */}
                <Card className="border-2 border-blue-100 dark:border-blue-900 bg-white dark:bg-zinc-900 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Bell className="h-5 w-5 text-blue-500" />
                            How Do Notifications Work?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-zinc-700 dark:text-zinc-300">
                        <p>
                            We check your tracked products periodically and compare the <strong>new price</strong> with the <strong>old price</strong>.
                        </p>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                                <TrendingDown className="h-4 w-4" />
                                We ONLY notify you when the price DROPS (goes down).
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                If the price stays the same or increases, you will NOT receive any notification.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Notify on Any Price Drop */}
                <Card className="border-2 border-purple-100 dark:border-purple-900 bg-white dark:bg-zinc-900 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <AlertCircle className="h-5 w-5 text-purple-500" />
                            What is "Notify on Any Price Drop"?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-zinc-700 dark:text-zinc-300">
                        <p>
                            When this option is <strong>checked</strong>, you will receive an alert for <em>any</em> decrease in price, no matter how small.
                        </p>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <p className="font-medium">Example:</p>
                            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                                <li>Current Price: ₹1,000</li>
                                <li>Price drops to ₹999 → <span className="text-green-600 font-bold">You get an alert!</span></li>
                                <li>Price drops to ₹950 → <span className="text-green-600 font-bold">You get an alert!</span></li>
                            </ul>
                        </div>
                        <p className="text-sm text-zinc-500">
                            Use this if you want to be notified about every single price decrease.
                        </p>
                    </CardContent>
                </Card>

                {/* Target Price */}
                <Card className="border-2 border-orange-100 dark:border-orange-900 bg-white dark:bg-zinc-900 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Target className="h-5 w-5 text-orange-500" />
                            How Does Target Price Work?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-zinc-700 dark:text-zinc-300">
                        <p>
                            If "Notify on Any Price Drop" is <strong>unchecked</strong>, notifications are triggered based on your <strong>Target Price</strong>.
                        </p>
                        <p>
                            You will only receive an alert when the price drops <strong>to or below</strong> your target.
                        </p>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <p className="font-medium">Example:</p>
                            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                                <li>Current Price: ₹1,000</li>
                                <li>Your Target: ₹800</li>
                                <li>Price drops to ₹900 → <span className="text-red-500 font-bold">No alert</span> (still above target)</li>
                                <li>Price drops to ₹750 → <span className="text-green-600 font-bold">You get an alert!</span> (below target)</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-800 mt-4">
                            <p className="font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                Pro Tip:
                            </p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                                If you set the Target Price <strong>higher</strong> than the current price (e.g., ₹2,000 when current is ₹1,000), you will get notified for <em>every</em> price drop — because the price is always "below" your target.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card className="border-2 border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-zinc-50 to-slate-50 dark:from-zinc-800 dark:to-slate-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Quick Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                                    <th className="text-left py-2 font-semibold">Setting</th>
                                    <th className="text-left py-2 font-semibold">When You Get Notified</th>
                                </tr>
                            </thead>
                            <tbody className="text-zinc-600 dark:text-zinc-400">
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    <td className="py-2">"Notify on Any Price Drop" <strong>ON</strong></td>
                                    <td className="py-2">Every time the price goes down</td>
                                </tr>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    <td className="py-2">"Notify on Any Price Drop" <strong>OFF</strong></td>
                                    <td className="py-2">Only when price drops to or below your Target Price</td>
                                </tr>
                                <tr>
                                    <td className="py-2">Price goes <strong>UP</strong> or stays same</td>
                                    <td className="py-2 text-red-500">No notification (never)</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center pt-4">
                <Link href="/dashboard/products" className="text-blue-600 hover:text-purple-600 font-medium transition-colors">
                    ← Back to Products
                </Link>
            </div>
        </div>
    );
}
