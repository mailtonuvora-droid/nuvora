import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProductRow from '@/components/products/ProductRow';
import CheckPricesButton from '@/components/products/CheckPricesButton';

export default async function ProductsPage() {
    const session = await auth();
    if (!session?.user) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: {
            products: {
                orderBy: { updatedAt: 'desc' },
                include: {
                    priceHistory: {
                        orderBy: { checkedAt: 'asc' },
                        take: 1
                    }
                }
            }
        }
    });

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold">My Products</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage your tracked products and alert settings.
                    </p>
                </div>
                <div className="flex gap-2">
                    <CheckPricesButton />
                    <Link href="/dashboard/products/add">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
                {user.products.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">No products tracked yet</h3>
                        <p className="text-gray-500 mb-6 mt-2 max-w-sm mx-auto">
                            Start tracking prices by adding your first product URL from Amazon, Flipkart, or any other store.
                        </p>
                        <Link href="/dashboard/products/add">
                            <Button>Track your first product</Button>
                        </Link>
                    </div>
                ) : (
                    user.products.map((product) => (
                        <ProductRow
                            key={product.id}
                            product={{
                                ...product,
                                currentPrice: product.currentPrice ? Number(product.currentPrice) : 0,
                                alertThreshold: product.alertThreshold ? Number(product.alertThreshold) : null,
                                initialPrice: product.initialPrice ? Number(product.initialPrice) : null,
                                priceHistory: product.priceHistory.map(h => ({
                                    ...h,
                                    price: Number(h.price)
                                })),
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
