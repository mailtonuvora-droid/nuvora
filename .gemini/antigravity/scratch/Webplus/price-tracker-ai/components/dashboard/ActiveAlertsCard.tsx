'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface NotificationData {
    id: string;
    message: string;
    sentAt: Date;
    type: string;
}

interface ActiveAlertsCardProps {
    count: number;
    notifications: NotificationData[];
}

export default function ActiveAlertsCard({ count, notifications }: ActiveAlertsCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : notifications.length - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev < notifications.length - 1 ? prev + 1 : 0));
    };

    const currentItem = notifications[currentIndex];

    return (
        <div className="relative">
            <Card
                className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden relative group cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Active Alerts
                    </CardTitle>
                    <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shadow-sm group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <Bell className="h-6 w-6" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-4xl font-black text-gray-900 mt-2">{count}</div>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 font-medium">
                            Unread notifications
                        </p>
                        {notifications.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                {isExpanded ? (
                                    <>
                                        <span>Hide</span>
                                        <ChevronUp className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        <span>View</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Expandable - Carousel Style */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && notifications.length > 0 ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="bg-white rounded-xl border border-green-100 shadow-lg p-4">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                        <Bell className="h-4 w-4 text-green-500" />
                        Recent Notifications
                    </h4>

                    <div className="flex items-center gap-2">
                        {/* Left Arrow */}
                        <button
                            onClick={handlePrev}
                            className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors flex-shrink-0 disabled:opacity-50"
                            disabled={notifications.length <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {/* Current Notification */}
                        <div className="flex-1 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                            <p className="text-sm font-medium text-gray-800 truncate">
                                {currentItem?.message || 'No message'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {currentItem?.sentAt ? new Date(currentItem.sentAt).toLocaleString() : ''}
                            </p>
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={handleNext}
                            className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors flex-shrink-0 disabled:opacity-50"
                            disabled={notifications.length <= 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Indicator */}
                    {notifications.length > 1 && (
                        <p className="text-xs text-center text-gray-400 mt-2">
                            {currentIndex + 1} of {notifications.length}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
