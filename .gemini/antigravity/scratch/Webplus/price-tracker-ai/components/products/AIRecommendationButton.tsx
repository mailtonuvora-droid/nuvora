'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Sparkles, ExternalLink, Loader2 } from 'lucide-react';

interface ComparisonResult {
    platform: string;
    price: number;
    url: string;
    logo?: string;
}

interface Analysis {
    verdict: string;
    confidence: number;
    reason: string;
    savings: number;
}

interface PricePoint {
    price: number;
    date: string;
}

interface Props {
    productTitle: string;
    currentPrice: number;
    priceHistory?: PricePoint[];
}

export default function AIRecommendationButton({ productTitle, currentPrice, priceHistory = [] }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ComparisonResult[]>([]);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);

    // Real Analysis Logic
    const analyzePrice = () => {
        if (!priceHistory || priceHistory.length < 2) {
            return {
                verdict: 'UNCERTAIN',
                confidence: 50,
                reason: "Not enough historical data yet. Keep tracking to generate insights!",
                savings: 0
            };
        }

        const prices = priceHistory.map(p => p.price);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const minPrice = Math.min(...prices);

        // Simple logic: If current price is below average, it's a good time
        if (currentPrice <= avgPrice) {
            const savings = avgPrice - currentPrice;
            return {
                verdict: 'BUY NOW',
                confidence: 80 + (currentPrice === minPrice ? 15 : 0), // Boost confidence if all-time low
                reason: currentPrice === minPrice
                    ? "This is the lowest price we've ever tracked!"
                    : `Price is ₹${Math.floor(savings)} below the average.`,
                savings: savings
            };
        } else {
            return {
                verdict: 'WAIT',
                confidence: 75,
                reason: `Price is ₹${Math.floor(currentPrice - avgPrice)} above average.`,
                savings: 0
            };
        }
    };

    // Comparison Generator (still simulated for search links)
    const fetchRecommendations = async () => {
        setLoading(true);
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        const encodedTitle = encodeURIComponent(productTitle);

        // Run Real Analysis
        const realAnalysis = analyzePrice();

        const mockResults: ComparisonResult[] = [
            {
                platform: 'Amazon',
                price: currentPrice, // Placeholder
                url: `https://www.amazon.in/s?k=${encodedTitle}`,
            },
            {
                platform: 'Flipkart',
                price: currentPrice,
                url: `https://www.flipkart.com/search?q=${encodedTitle}`,
            },
            {
                platform: 'Croma',
                price: currentPrice,
                url: `https://www.croma.com/search/?text=${encodedTitle}`,
            },
        ];

        setResults(mockResults);
        setAnalysis(realAnalysis);
        setLoading(false);
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen && !analysis) {
            fetchRecommendations();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="h-8 text-xs whitespace-nowrap bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-md border-0"
                >
                    <Sparkles className="w-3 h-3 mr-1" /> AI Suggest
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI Price Analysis
                    </DialogTitle>
                    <DialogDescription>
                        Smart insights for <span className="font-semibold text-foreground">"{productTitle}"</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                            <p className="text-sm text-muted-foreground animate-pulse">Analyzing price trends...</p>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-6">
                            {/* Verdict Card */}
                            <div className={`p-6 rounded-2xl border-2 ${analysis.verdict === 'BUY NOW' ? 'bg-green-50 border-green-200' : analysis.verdict === 'WAIT' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'} text-center shadow-sm relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Sparkles className="w-24 h-24" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Recommendation</h3>
                                <div className={`text-4xl font-black ${analysis.verdict === 'BUY NOW' ? 'text-green-600' : analysis.verdict === 'WAIT' ? 'text-amber-600' : 'text-blue-600'} mb-3 tracking-tight`}>
                                    {analysis.verdict}
                                </div>
                                <p className="text-gray-700 font-medium text-sm mb-4 leading-relaxed">{analysis.reason}</p>
                                <div className="inline-flex items-center px-3 py-1 bg-white/80 backdrop-blur rounded-full text-xs font-bold shadow-sm text-gray-600 border border-gray-100">
                                    Confidence: {analysis.confidence}%
                                </div>
                            </div>

                            {/* Comparison Links */}
                            <div className="pt-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">
                                    Compare on other stores
                                </h4>
                                <div className="grid gap-2">
                                    {results.map((result, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-slate-50 transition-all hover:shadow-sm group cursor-pointer" onClick={() => window.open(result.url, '_blank')}>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{result.platform}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-gray-400">
                                                Search <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 text-center mt-4">
                                    * External prices require API integration (e.g. SerpApi) to be displayed automatically.
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
