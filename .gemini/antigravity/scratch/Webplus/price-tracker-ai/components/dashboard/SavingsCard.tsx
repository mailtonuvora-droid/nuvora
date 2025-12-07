'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, TrendingDown } from 'lucide-react';

interface SavingsData {
    id: string;
    title: string | null;
    initialPrice: number;
    currentPrice: number;
    saved: number;
}

interface SavingsCardProps {
    totalSaved: number;
    savingsBreakdown: SavingsData[];
}

export default function SavingsCard({ totalSaved, savingsBreakdown }: SavingsCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : savingsBreakdown.length - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev < savingsBreakdown.length - 1 ? prev + 1 : 0));
    };

    const currentItem = savingsBreakdown[currentIndex];

    return (
        <div className="relative">
            <Card
                className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden relative group cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Money Saved
                    </CardTitle>
                    <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <Sparkles className="h-6 w-6" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mt-2">
                        ₹{totalSaved.toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 font-medium">
                            Total savings
                        </p>
                        <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                            {isExpanded ? (
                                <>
                                    <span>Hide details</span>
                                    <ChevronUp className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    <span>View details</span>
                                    <ChevronDown className="h-4 w-4" />
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Expandable Breakdown - Carousel Style */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="bg-white rounded-xl border border-orange-100 shadow-lg p-4">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                        Savings Breakdown
                    </h4>

                    {savingsBreakdown.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No savings yet. Keep tracking!</p>
                    ) : (
                        <div className="flex items-center gap-2">
                            {/* Left Arrow */}
                            <button
                                onClick={handlePrev}
                                className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors flex-shrink-0 disabled:opacity-50"
                                disabled={savingsBreakdown.length <= 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {/* Current Product */}
                            <div className="flex-1 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <p className="text-sm font-medium text-gray-800 truncate" title={currentItem?.title || 'Untitled'}>
                                            {currentItem?.title || 'Untitled Product'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            ₹{currentItem?.initialPrice.toLocaleString('en-IN')} → ₹{currentItem?.currentPrice.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-sm font-bold text-green-600">
                                            -₹{currentItem?.saved.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Arrow */}
                            <button
                                onClick={handleNext}
                                className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors flex-shrink-0 disabled:opacity-50"
                                disabled={savingsBreakdown.length <= 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Indicator */}
                    {savingsBreakdown.length > 1 && (
                        <p className="text-xs text-center text-gray-400 mt-2">
                            {currentIndex + 1} of {savingsBreakdown.length}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
