'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

interface PricePoint {
    price: number;
    date: string;
}

interface PriceHistoryChartProps {
    data: PricePoint[];
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="w-full">
                <h3 className="text-xl font-bold mb-4">Price History</h3>
                <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <div className="text-center p-6">
                        <p className="text-gray-600 font-medium mb-2">No price history available yet</p>
                        <p className="text-sm text-gray-500">Price tracking data will appear here as we monitor this product over time.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map(item => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        }),
        fullDate: new Date(item.date).toLocaleString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: 'numeric'
        })
    }));

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold mb-6">Price History Tracking</h3>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                            dataKey="formattedDate"
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickMargin={10}
                            minTickGap={30}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={(value) => `₹${value.toLocaleString()}`}
                            domain={['auto', 'auto']}
                            width={80}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500">
                                                    {data.fullDate}
                                                </div>
                                                <div className="text-lg font-bold text-gray-900">
                                                    ₹{data.price.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
                Showing {chartData.length} price {chartData.length === 1 ? 'check' : 'checks'}
            </div>
        </div>
    )
}
