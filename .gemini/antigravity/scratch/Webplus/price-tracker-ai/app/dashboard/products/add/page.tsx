import AddProductForm from '@/components/products/AddProductForm';
import { Plus, ShoppingBag, Sparkles, Link2 } from 'lucide-react';

export default function AddProductPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header with gradient */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl mb-4 animate-pulse">
                    <Plus className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Track New Product
                </h1>
                <p className="text-zinc-500 mt-2">Paste any Amazon, Flipkart, or supported URL to start tracking</p>
            </div>

            {/* Features badges */}
            <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full border border-blue-200 text-blue-700 text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    AI Price Tracking
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200 text-purple-700 text-sm font-medium">
                    <ShoppingBag className="h-4 w-4" />
                    Auto-detect Product
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 text-green-700 text-sm font-medium">
                    <Link2 className="h-4 w-4" />
                    Multiple Stores
                </div>
            </div>

            {/* Form */}
            <AddProductForm />

            {/* Supported stores */}
            <div className="text-center">
                <p className="text-xs text-zinc-400">Supported: Amazon, Flipkart, Myntra, and more</p>
            </div>
        </div>
    );
}
