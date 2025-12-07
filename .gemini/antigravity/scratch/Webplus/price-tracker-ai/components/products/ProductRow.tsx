'use client';

import { useState } from 'react';
import { updateProductAlert, deleteProduct } from '@/lib/product-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Trash2, Settings, Bell, BellOff, TrendingDown, ArrowDown, ArrowUp, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import AIRecommendationButton from './AIRecommendationButton';

interface ProductRowProps {
    product: any;
}

export default function ProductRow({ product }: ProductRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [inputMode, setInputMode] = useState<'price' | 'percent'>('price');

    // Calculate percentage difference
    const current = Number(product.currentPrice) || 0;
    const target = Number(product.alertThreshold) || 0;
    const diff = current - target;
    const percentDiff = current > 0 && target > 0 ? Math.abs((diff / current) * 100).toFixed(1) : null;
    const isSavings = diff > 0;

    return (
        <>
            <div className="group relative flex flex-col md:flex-row items-start md:items-center gap-3 p-3 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border border-gray-200 rounded-xl shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:scale-[1.01]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-xl transition-all duration-500"></div>

                <div className="relative w-full md:w-20 h-24 md:h-20 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-blue-400 transition-all duration-300">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                    )}
                    <div className={`absolute top-1 right-1 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md ${product.isAvailable ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'}`}>
                        {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </div>
                </div>

                <div className="relative flex-grow min-w-0 w-full z-10">
                    <h3 className="font-bold text-base leading-tight mb-1 truncate text-gray-900 group-hover:text-blue-600 transition-colors" title={product.title}>
                        {product.title || 'Untitled Product'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center group-hover:text-blue-500 transition-colors">
                            <ExternalLink className="w-3 h-3 mr-1" /> {new URL(product.url).hostname}
                        </span>
                        <span>•</span>
                        <span suppressHydrationWarning className="group-hover:text-purple-500 transition-colors">
                            Last checked: {product.lastCheckedAt ? new Date(product.lastCheckedAt).toLocaleTimeString() : 'Never'}
                        </span>
                    </div>
                </div>

                <div className="relative flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 md:gap-1 z-10">
                    <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Current Price</div>
                        <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-300">
                            ₹{current.toLocaleString()}
                        </div>
                        {(product.initialPrice || product.priceHistory?.[0]?.price) && (
                            <div className="text-xs text-gray-400 mb-1">
                                Initial: ₹{Number(product.initialPrice || product.priceHistory?.[0]?.price).toLocaleString()}
                            </div>
                        )}
                        <div className="text-xs flex items-center justify-end gap-1 flex-wrap">
                            {target > 0 ? (
                                <>
                                    <span className="text-gray-600">Target:</span>
                                    <span className={`font-bold ${isSavings ? 'text-green-600' : 'text-orange-600'}`}>
                                        ₹{target}
                                    </span>
                                    {percentDiff && (
                                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${isSavings ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'}`}>
                                            {isSavings ? <ArrowDown className="w-2.5 h-2.5" /> : <ArrowUp className="w-2.5 h-2.5" />}
                                            {percentDiff}%
                                        </span>
                                    )}
                                    {product.alertEnabled ? <Bell className="w-3 h-3 text-green-500 group-hover:animate-pulse" /> : <BellOff className="w-3 h-3 text-gray-400" />}
                                </>
                            ) : (
                                <>
                                    <span className="text-gray-600">Target:</span>
                                    <span className="font-medium text-gray-400">Not set</span>
                                    {product.alertEnabled ? <Bell className="w-3 h-3 text-green-500 group-hover:animate-pulse" /> : <BellOff className="w-3 h-3 text-gray-400" />}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 md:mt-0 overflow-x-auto">
                        <Link href={`/dashboard/products/${product.id}`}>
                            <Button size="sm" className="h-8 text-xs whitespace-nowrap bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                                <TrendingDown className="w-3 h-3 mr-1" /> Track
                            </Button>
                        </Link>
                        <a href={product.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-8 text-xs whitespace-nowrap border-blue-300 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-purple-400 transition-all duration-300">
                                <ExternalLink className="w-3 h-3 mr-1" /> Open
                            </Button>
                        </a>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="h-8 text-xs whitespace-nowrap border-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 hover:border-orange-400 hover:text-orange-600 transition-all duration-300">
                            <Settings className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        {/* AI Suggestion - Temporarily disabled until API key is available
                        <AIRecommendationButton
                            productTitle={product.title}
                            currentPrice={current}
                            priceHistory={product.priceHistory}
                        /> 
                        */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300"
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete this product?')) {
                                    setIsDeleting(true);
                                    await deleteProduct(product.id);
                                    setIsDeleting(false);
                                }
                            }}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Edit Alert Settings</h2>
                            <Link href="/faq" target="_blank" className="flex items-center gap-1 text-sm text-blue-500 hover:text-purple-500 transition-colors">
                                <HelpCircle className="w-4 h-4" />
                                <span>Help</span>
                            </Link>
                        </div>
                        <form action={async (formData) => {
                            await updateProductAlert(formData);
                            setIsEditing(false);
                        }}>
                            <input type="hidden" name="productId" value={product.id} />

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="notifyAnyDrop"
                                        name="notifyAnyDrop"
                                        defaultChecked={product.notifyAnyDrop}
                                        onChange={(e) => {
                                            const targetInput = document.querySelector('input[name="alertThreshold"]') as HTMLInputElement;
                                            if (targetInput) targetInput.disabled = e.target.checked;
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="notifyAnyDrop" className="text-gray-700 font-medium cursor-pointer">Notify on any price drop</Label>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className={`text-gray-700 font-medium ${product.notifyAnyDrop ? 'opacity-50' : ''}`}>Target Price</Label>
                                        <div className={`flex gap-1 ${product.notifyAnyDrop ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <button
                                                type="button"
                                                onClick={() => setInputMode('price')}
                                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${inputMode === 'price' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                            >
                                                ₹ Price
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setInputMode('percent')}
                                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${inputMode === 'percent' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                                            >
                                                % Discount
                                            </button>
                                        </div>
                                    </div>

                                    {inputMode === 'price' ? (
                                        <Input
                                            name="alertThreshold"
                                            type="number"
                                            defaultValue={product.alertThreshold?.toString() || product.currentPrice?.toString()}
                                            placeholder="Enter target price"
                                            disabled={product.notifyAnyDrop}
                                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400"
                                        />
                                    ) : (
                                        <div className="space-y-2">
                                            <Input
                                                type="number"
                                                placeholder="Enter discount %"
                                                disabled={product.notifyAnyDrop}
                                                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 disabled:bg-gray-100 disabled:text-gray-400"
                                                onChange={(e) => {
                                                    const percent = Number(e.target.value) || 0;
                                                    const targetPrice = current - (current * percent / 100);
                                                    const hiddenInput = document.querySelector('input[name="alertThreshold"]') as HTMLInputElement;
                                                    if (hiddenInput) {
                                                        hiddenInput.value = Math.round(targetPrice).toString();
                                                    }
                                                }}
                                            />
                                            <input type="hidden" name="alertThreshold" defaultValue={product.alertThreshold?.toString() || product.currentPrice?.toString()} />
                                            <p className="text-xs text-purple-600">
                                                Current: ₹{current} • Target will be calculated
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        We'll notify you when the price drops below this amount.
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="alertEnabled"
                                        name="alertEnabled"
                                        defaultChecked={product.alertEnabled}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="alertEnabled" className="text-gray-700 font-medium cursor-pointer">Enable Notifications</Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="hover:bg-gray-100">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
