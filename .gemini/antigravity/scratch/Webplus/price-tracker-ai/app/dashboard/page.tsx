import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, TrendingDown, Bell, Package, Sparkles, Crown, Calendar, ArrowUpRight } from 'lucide-react';
import StatsCardsWrapper from '@/components/dashboard/StatsCardsWrapper';

export default async function DashboardPage() {
    const session = await auth();

    let userEmail = session?.user?.email;

    if (!userEmail) {
        // Fallback to the first user in the database for testing/demo purposes
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
            userEmail = firstUser.email;
        }
    }

    if (!userEmail) return <div className="flex h-screen items-center justify-center">No user found. Please run the seed script.</div>;

    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
            products: {
                orderBy: { updatedAt: 'desc' },
                take: 6,
                include: {
                    priceHistory: {
                        orderBy: { checkedAt: 'asc' },
                        take: 1
                    }
                }
            },
            _count: {
                select: { products: true, notifications: true }
            },
            notifications: {
                where: { isRead: false },
                take: 5
            }
        }
    });

    if (!user) return <div>User not found</div>;

    // Calculate Real Stats - Price Drops this month with details
    const priceDropNotifications = await prisma.notification.findMany({
        where: {
            userId: user.id,
            type: 'price_drop',
            sentAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
        },
        include: {
            product: {
                select: { title: true }
            }
        },
        orderBy: { sentAt: 'desc' },
        take: 10
    });

    const priceDropCount = priceDropNotifications.length;

    // Parse price drop details from notification messages
    const priceDrops = priceDropNotifications.map(n => {
        const match = n.message.match(/₹([\d,]+) to ₹([\d,]+)/);
        return {
            id: n.id,
            productTitle: n.product?.title || 'Unknown Product',
            oldPrice: match ? parseInt(match[1].replace(/,/g, '')) : 0,
            newPrice: match ? parseInt(match[2].replace(/,/g, '')) : 0,
            droppedAt: n.sentAt
        };
    });

    // Calculate Total Saved with breakdown
    const allProducts = await prisma.product.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            title: true,
            currentPrice: true,
            priceHistory: {
                orderBy: { checkedAt: 'asc' },
                take: 1,
                select: { price: true }
            }
        }
    });

    let totalSaved = 0;
    const savingsBreakdown: { id: string; title: string | null; initialPrice: number; currentPrice: number; saved: number }[] = [];

    allProducts.forEach(p => {
        if (p.currentPrice && p.priceHistory.length > 0) {
            const initial = Number(p.priceHistory[0].price);
            const current = Number(p.currentPrice);
            if (current < initial) {
                const saved = initial - current;
                totalSaved += saved;
                savingsBreakdown.push({
                    id: p.id,
                    title: p.title,
                    initialPrice: initial,
                    currentPrice: current,
                    saved
                });
            }
        }
    });

    // Sort by highest savings first
    savingsBreakdown.sort((a, b) => b.saved - a.saved);

    const isPremium = user.subscriptionTier === 'premium';
    const productLimit = isPremium ? null : 3;
    const daysRemaining = user.subscriptionEndDate
        ? Math.ceil((new Date(user.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <main className="space-y-8 p-6 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2 font-medium">Welcome back, {user.name || 'User'}! Here's your savings overview.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/notifications">
                        <Button variant="outline" className="border-2 border-purple-200 hover:bg-purple-50 text-purple-700">
                            <Bell className="mr-2 h-4 w-4" /> Notifications
                        </Button>
                    </Link>
                    <Link href="/dashboard/products/add">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
                            <Plus className="mr-2 h-5 w-5" /> Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Subscription Card */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {isPremium ? (
                                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30">
                                    <Crown className="h-8 w-8 text-yellow-300 drop-shadow-md" />
                                </div>
                            ) : (
                                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30">
                                    <Sparkles className="h-8 w-8 text-blue-200" />
                                </div>
                            )}
                            <div>
                                <CardTitle className="text-3xl font-black tracking-tight">
                                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                                </CardTitle>
                                <p className="text-blue-100 font-medium">
                                    {isPremium ? 'Unlimited tracking & priority alerts' : 'Limited to 3 products'}
                                </p>
                            </div>
                        </div>
                        {!isPremium && (
                            <Link href="/dashboard/billing">
                                <Button className="bg-white text-purple-600 hover:bg-blue-50 font-bold shadow-lg border-none">
                                    <Crown className="mr-2 h-4 w-4" /> Upgrade Now
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardHeader>
                {isPremium && daysRemaining !== null && (
                    <CardContent className="relative z-10">
                        <div className="flex items-center gap-2 text-blue-50 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
                            <Calendar className="h-4 w-4" />
                            <span className="font-semibold">
                                {daysRemaining > 0
                                    ? `${daysRemaining} days remaining`
                                    : 'Subscription expired'}
                            </span>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Statistics Grid */}
            <StatsCardsWrapper
                productCount={user._count.products}
                productLimit={productLimit}
                alertCount={user._count.notifications}
                notifications={user.notifications.map(n => ({
                    id: n.id,
                    message: n.message,
                    sentAt: n.sentAt,
                    type: n.type
                }))}
                priceDropCount={priceDropCount}
                priceDrops={priceDrops}
                totalSaved={totalSaved}
                savingsBreakdown={savingsBreakdown}
            />

            {/* Recent Products */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Recent Products</h2>
                        <p className="text-gray-500 text-sm mt-1">Tracked items and their current status</p>
                    </div>
                    <Link href="/dashboard/products">
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold">
                            View All <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {user.products.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-4 mx-auto shadow-sm">
                            <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No products tracked yet</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start tracking products to get notified when prices drop.</p>
                        <Link href="/dashboard/products/add">
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                                <Plus className="mr-2 h-4 w-4" /> Track your first product
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {user.products.map((product) => (
                            <Link key={product.id} href={`/dashboard/products/${product.id}`}>
                                <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                    {product.imageUrl && (
                                        <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end p-4">
                                                <span className="text-white font-medium text-sm">View Details</span>
                                            </div>
                                            <img
                                                src={product.imageUrl}
                                                alt={product.title || 'Product'}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-gray-900 truncate mb-1" title={product.title || product.url}>
                                            {product.title || 'Untitled Product'}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            {new URL(product.url).hostname}
                                        </p>

                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Current Price</p>
                                                <div className="text-2xl font-black text-gray-900">
                                                    {product.currentPrice ? `₹${product.currentPrice.toString()}` : 'Checking...'}
                                                </div>
                                            </div>
                                            {product.alertThreshold && product.currentPrice && (
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 mb-0.5">Target</p>
                                                    <div className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                                        ₹{product.alertThreshold.toString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
