'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { sendSupportMessage } from './actions';
import { Loader2, Send, MessageCircleQuestion } from 'lucide-react';
import { toast } from 'sonner';

export default function SupportPage() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const result = await sendSupportMessage(null, formData);

        setLoading(false);

        if (result?.error) {
            if (typeof result.error === 'string') {
                toast.error(result.error);
            } else {
                toast.error("Please check your inputs.");
            }
        } else if (result?.success) {
            toast.success(result.message);
            (event.target as HTMLFormElement).reset();
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-10 px-4">
            {/* Header Section with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white shadow-lg mb-8">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Support & Feedback</h1>
                        <p className="text-blue-100 mt-2 text-lg">
                            We'd love to hear from you. Whether it's a bug report, feature request, or just a hello.
                        </p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                        <MessageCircleQuestion className="h-10 w-10 text-white" />
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
            </div>

            <div className="flex justify-center">
                {/* Main Form */}
                <Card className="w-full shadow-lg border-t-4 border-t-indigo-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            Send us a message
                        </CardTitle>
                        <CardDescription>
                            We typically respond within 24 hours.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    placeholder="Briefly describe your topic"
                                    required
                                    minLength={3}
                                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-base font-medium">Message</Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="How can we help you today?"
                                    required
                                    className="min-h-[200px] border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none p-4"
                                    minLength={10}
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium h-11 transition-all shadow-md hover:shadow-lg"
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                                    ) : (
                                        <><Send className="mr-2 h-5 w-5" /> Send Message</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
