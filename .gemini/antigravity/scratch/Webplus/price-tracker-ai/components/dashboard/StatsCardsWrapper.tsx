'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Bell, TrendingDown, Sparkles, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface SavingsData {
    id: string;
    title: string | null;
    initialPrice: number;
    currentPrice: number;
    saved: number;
}

interface NotificationData {
    id: string;
    message: string;
    sentAt: Date;
    type: string;
}

interface PriceDropData {
    id: string;
    productTitle: string | null;
    oldPrice: number;
    newPrice: number;
    droppedAt: Date;
}

interface StatsCardsWrapperProps {
    productCount: number;
    productLimit: number | null;
    alertCount: number;
    notifications: NotificationData[];
    priceDropCount: number;
    priceDrops: PriceDropData[];
    totalSaved: number;
    savingsBreakdown: SavingsData[];
}

type ExpandedCard = 'alerts' | 'priceDrops' | 'savings' | null;

export default function StatsCardsWrapper({
    productCount,
    productLimit,
    alertCount,
    notifications,
    priceDropCount,
    priceDrops,
    totalSaved,
    savingsBreakdown
}: StatsCardsWrapperProps) {
    const [expandedCard, setExpandedCard] = useState<ExpandedCard>(null);
    const [alertIndex, setAlertIndex] = useState(0);
    const [priceDropIndex, setPriceDropIndex] = useState(0);
    const [savingsIndex, setSavingsIndex] = useState(0);

    const handleCardClick = (card: ExpandedCard) => {
        setExpandedCard(expandedCard === card ? null : card);
    };

    const currentNotification = notifications[alertIndex];
    const currentPriceDrop = priceDrops[priceDropIndex];
    const currentSaving = savingsBreakdown[savingsIndex];

    return (
        <div className="space-y-4">
            {/* Fixed-height stat cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Products Tracked - NO expand */}
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Products Tracked
                        </CardTitle>
                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Package className="h-6 w-6" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-black text-gray-900 mt-2">{productCount}</div>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            {productLimit ? `${productLimit - productCount} slots remaining` : 'Unlimited slots'}
                        </p>
                        {productLimit && (
                            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(productCount / productLimit) * 100}%` }}></div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Active Alerts */}
                <Card
                    className={`border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden relative group cursor-pointer ${expandedCard === 'alerts' ? 'ring-2 ring-green-400' : ''}`}
                    onClick={() => notifications.length > 0 && handleCardClick('alerts')}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Alerts</CardTitle>
                        <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shadow-sm group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Bell className="h-6 w-6" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-black text-gray-900 mt-2">{alertCount}</div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-500 font-medium">Unread</p>
                            {notifications.length > 0 && (expandedCard === 'alerts' ? <ChevronUp className="h-4 w-4 text-green-600" /> : <ChevronDown className="h-4 w-4 text-green-600" />)}
                        </div>
                    </CardContent>
                </Card>

                {/* Price Drops */}
                <Card
                    className={`border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden relative group cursor-pointer ${expandedCard === 'priceDrops' ? 'ring-2 ring-purple-400' : ''}`}
                    onClick={() => priceDrops.length > 0 && handleCardClick('priceDrops')}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Price Drops</CardTitle>
                        <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-black text-gray-900 mt-2">{priceDropCount}</div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-500 font-medium">This month</p>
                            {priceDrops.length > 0 && (expandedCard === 'priceDrops' ? <ChevronUp className="h-4 w-4 text-purple-600" /> : <ChevronDown className="h-4 w-4 text-purple-600" />)}
                        </div>
                    </CardContent>
                </Card>

                {/* Money Saved */}
                <Card
                    className={`border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden relative group cursor-pointer ${expandedCard === 'savings' ? 'ring-2 ring-orange-400' : ''}`}
                    onClick={() => savingsBreakdown.length > 0 && handleCardClick('savings')}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Money Saved</CardTitle>
                        <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <Sparkles className="h-6 w-6" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mt-2">₹{totalSaved.toLocaleString('en-IN')}</div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-500 font-medium">Total</p>
                            {savingsBreakdown.length > 0 && (expandedCard === 'savings' ? <ChevronUp className="h-4 w-4 text-orange-600" /> : <ChevronDown className="h-4 w-4 text-orange-600" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Shared expansion area BELOW all cards */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCard ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                {/* Alerts Panel */}
                {expandedCard === 'alerts' && (
                    <div className="bg-white rounded-xl border-2 border-green-200 shadow-lg p-6">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <Bell className="h-5 w-5 text-green-500" /> Recent Notifications
                        </h4>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setAlertIndex(prev => prev > 0 ? prev - 1 : notifications.length - 1)}
                                className="p-3 rounded-full bg-green-100 hover:bg-green-200 text-green-600 disabled:opacity-50" disabled={notifications.length <= 1}>
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="flex-1 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                <p className="text-base font-medium text-gray-800">{currentNotification?.message}</p>
                                <p className="text-sm text-gray-500 mt-2">{currentNotification?.sentAt ? new Date(currentNotification.sentAt).toLocaleString() : ''}</p>
                            </div>
                            <button onClick={() => setAlertIndex(prev => prev < notifications.length - 1 ? prev + 1 : 0)}
                                className="p-3 rounded-full bg-green-100 hover:bg-green-200 text-green-600 disabled:opacity-50" disabled={notifications.length <= 1}>
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        {notifications.length > 1 && <p className="text-sm text-center text-gray-400 mt-3">{alertIndex + 1} of {notifications.length}</p>}
                    </div>
                )}

                {/* Price Drops Panel */}
                {expandedCard === 'priceDrops' && (
                    <div className="bg-white rounded-xl border-2 border-purple-200 shadow-lg p-6">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <TrendingDown className="h-5 w-5 text-purple-500" /> Price Drop Details
                        </h4>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setPriceDropIndex(prev => prev > 0 ? prev - 1 : priceDrops.length - 1)}
                                className="p-3 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 disabled:opacity-50" disabled={priceDrops.length <= 1}>
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="flex-1 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                <p className="text-base font-medium text-gray-800">{currentPriceDrop?.productTitle}</p>
                                <p className="text-sm text-gray-500 mt-1">₹{currentPriceDrop?.oldPrice.toLocaleString('en-IN')} → ₹{currentPriceDrop?.newPrice.toLocaleString('en-IN')}</p>
                                <p className="text-lg font-bold text-green-600 mt-2">Saved ₹{((currentPriceDrop?.oldPrice || 0) - (currentPriceDrop?.newPrice || 0)).toLocaleString('en-IN')}</p>
                            </div>
                            <button onClick={() => setPriceDropIndex(prev => prev < priceDrops.length - 1 ? prev + 1 : 0)}
                                className="p-3 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 disabled:opacity-50" disabled={priceDrops.length <= 1}>
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        {priceDrops.length > 1 && <p className="text-sm text-center text-gray-400 mt-3">{priceDropIndex + 1} of {priceDrops.length}</p>}
                    </div>
                )}

                {/* Savings Panel */}
                {expandedCard === 'savings' && (
                    <div className="bg-white rounded-xl border-2 border-orange-200 shadow-lg p-6">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-orange-500" /> Savings Breakdown
                        </h4>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSavingsIndex(prev => prev > 0 ? prev - 1 : savingsBreakdown.length - 1)}
                                className="p-3 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 disabled:opacity-50" disabled={savingsBreakdown.length <= 1}>
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="flex-1 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                                <p className="text-base font-medium text-gray-800">{currentSaving?.title || 'Untitled'}</p>
                                <p className="text-sm text-gray-500 mt-1">₹{currentSaving?.initialPrice.toLocaleString('en-IN')} → ₹{currentSaving?.currentPrice.toLocaleString('en-IN')}</p>
                                <p className="text-lg font-bold text-green-600 mt-2">Saved ₹{currentSaving?.saved.toLocaleString('en-IN')}</p>
                            </div>
                            <button onClick={() => setSavingsIndex(prev => prev < savingsBreakdown.length - 1 ? prev + 1 : 0)}
                                className="p-3 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 disabled:opacity-50" disabled={savingsBreakdown.length <= 1}>
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        {savingsBreakdown.length > 1 && <p className="text-sm text-center text-gray-400 mt-3">{savingsIndex + 1} of {savingsBreakdown.length}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
