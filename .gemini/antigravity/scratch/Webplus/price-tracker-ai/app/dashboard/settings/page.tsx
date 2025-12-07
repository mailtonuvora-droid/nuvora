'use client';

import { useTheme } from "next-themes";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Monitor, ArrowLeft, Palette } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const { setTheme, theme } = useTheme();

    return (
        <div className="container max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your preferences.</p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-purple-500" />
                            <CardTitle>Appearance</CardTitle>
                        </div>
                        <CardDescription>Customize how the application looks properly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800
                                    ${theme === 'light' ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10' : 'border-zinc-200 dark:border-zinc-700'}
                                `}
                                onClick={() => setTheme('light')}
                            >
                                <Sun className="h-8 w-8 text-orange-500" />
                                <span className="font-medium">Light Mode</span>
                            </div>
                            <div
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800
                                    ${theme === 'dark' ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10' : 'border-zinc-200 dark:border-zinc-700'}
                                `}
                                onClick={() => setTheme('dark')}
                            >
                                <Moon className="h-8 w-8 text-blue-500" />
                                <span className="font-medium">Dark Mode</span>
                            </div>
                            <div
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800
                                    ${theme === 'system' ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10' : 'border-zinc-200 dark:border-zinc-700'}
                                `}
                                onClick={() => setTheme('system')}
                            >
                                <Monitor className="h-8 w-8 text-zinc-500" />
                                <span className="font-medium">System</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
