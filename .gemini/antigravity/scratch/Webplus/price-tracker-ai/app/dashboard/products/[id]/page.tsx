import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { PriceHistoryChart } from '@/components/charts/PriceHistoryChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, TrendingDown, TrendingUp, Bell, BellOff } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) return null;

    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: {
            id: id,
            userId: session.user.id
        },
        include: {
            priceHistory: {
                orderBy: { checkedAt: 'asc' }
            }
        }
    });

    if (!product) return notFound();

    // Transform data for chart
    const chartData = product.priceHistory.map(h => ({
        price: Number(h.price),
        date: h.checkedAt.toISOString()
    }));

    // Calculate stats
    const prices = chartData.map(d => d.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : Number(product.currentPrice) || 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : Number(product.currentPrice) || 0;
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : Number(product.currentPrice) || 0;
    const currentPrice = Number(product.currentPrice) || 0;
    const priceChange = prices.length > 1 ? currentPrice - prices[0] : 0;
    const priceChangePercent = prices.length > 1 && prices[0] !== 0 ? ((priceChange / prices[0]) * 100).toFixed(1) : '0';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/dashboard/products" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
                    </Link>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Left Column - Product Image & Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Product Image Card */}
                        <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur">
                            <CardContent className="p-6">
                                <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.title || 'Product'} className="max-w-full max-h-full object-contain p-4" />
                                    ) : (
                                        <div className="text-gray-400 text-sm">No Image</div>
                                    )}
                                </div>
                                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 ${product.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Alert Settings Card */}
                        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {product.alertEnabled ? <Bell className="w-5 h-5 text-green-500" /> : <BellOff className="w-5 h-5 text-gray-400" />}
                                    Alert Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm text-gray-600">Target Price</span>
                                    <span className="font-semibold text-lg">₹{Number(product.alertThreshold) || 'Not set'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm text-gray-600">Notifications</span>
                                    <span className={`font-medium ${product.alertEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                                        {product.alertEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600">Last Checked</span>
                                    <span className="text-sm font-medium" suppressHydrationWarning>{product.lastCheckedAt ? new Date(product.lastCheckedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Price Info & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Title & Price Card */}
                        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                            <CardContent className="p-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.title || 'Untitled Product'}</h1>

                                <div className="flex flex-wrap items-end gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Current Price</p>
                                        <div className="text-4xl sm:text-5xl font-bold text-gray-900">₹{currentPrice.toLocaleString()}</div>
                                    </div>
                                    {priceChange !== 0 && (
                                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${priceChange < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {priceChange < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                            <span className="font-semibold">{priceChangePercent}%</span>
                                        </div>
                                    )}
                                </div>

                                <a href={product.url} target="_blank" rel="noopener noreferrer">
                                    <Button className="w-full sm:w-auto" size="lg">
                                        <ExternalLink className="w-4 h-4 mr-2" /> View on {new URL(product.url).hostname}
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>

                        {/* Price Statistics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100/50">
                                <CardContent className="p-4">
                                    <p className="text-sm font-medium text-green-700 mb-1">Lowest Price</p>
                                    <p className="text-2xl font-bold text-green-900">₹{minPrice.toLocaleString()}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
                                <CardContent className="p-4">
                                    <p className="text-sm font-medium text-orange-700 mb-1">Average Price</p>
                                    <p className="text-2xl font-bold text-orange-900">₹{avgPrice.toLocaleString()}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-md border-0 bg-gradient-to-br from-red-50 to-red-100/50">
                                <CardContent className="p-4">
                                    <p className="text-sm font-medium text-red-700 mb-1">Highest Price</p>
                                    <p className="text-2xl font-bold text-red-900">₹{maxPrice.toLocaleString()}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Chart Section - Full Width */}
                <div className="mb-6">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                        <CardContent className="p-6">
                            <PriceHistoryChart data={chartData} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
