'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateTelegramConnectToken, verifyTelegramConnection, unlinkTelegram } from './actions';
import { Send, Check, Loader2, Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
    isConnected: boolean;
    initialToken: string | null;
}

export function TelegramConnectButton({ isConnected, initialToken }: Props) {
    const [token, setToken] = useState<string | null>(initialToken);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [open, setOpen] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await generateTelegramConnectToken();
            if (res.error) {
                toast.error(res.error);
            } else if (res.token) {
                setToken(res.token);
            }
        } catch (e) {
            toast.error("Failed to generate token");
        }
        setLoading(false);
    };

    const handleVerify = async () => {
        setVerifying(true);
        try {
            const res = await verifyTelegramConnection();
            if (res.success) {
                toast.success("Telegram Connected Successfully! 🎉");
                setOpen(false); // Collapse/Close the dialog
            } else if (res.error) {
                toast.error(res.error);
            }
        } catch (e) {
            toast.error("Verification failed");
        }
        setVerifying(false);
    };

    const handleUnlink = async () => {
        if (!confirm("Are you sure you want to disconnect Telegram?")) return;
        setLoading(true);
        await unlinkTelegram();
        setLoading(false);
        toast.success("Disconnected.");
    };

    // 1. Connected State
    if (isConnected) {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
                    <Check className="h-4 w-4" />
                    <span>Connected to Telegram</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlink}
                    disabled={loading}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-2" />}
                    Disconnect
                </Button>
            </div>
        );
    }

    // 2. Not Connected - Dialog Flow
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="w-full bg-[#0088cc] hover:bg-[#0077b5]"
                    onClick={() => {
                        if (!token) handleGenerate();
                    }}
                >
                    <Send className="mr-2 h-4 w-4" />
                    Connect Telegram
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-[#0088cc]" /> Connect Telegram
                    </DialogTitle>
                    <DialogDescription>
                        Follow these steps to link your Telegram account for instant alerts.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        token && (
                            <>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Step 1: Send access code</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-100 p-3 rounded-md border font-mono text-center text-lg tracking-wider font-bold">
                                            {token}
                                        </div>
                                        <Button size="icon" variant="outline" className="h-12 w-12" onClick={() => {
                                            navigator.clipboard.writeText(token);
                                            toast.success("Copied!");
                                        }}>
                                            <Copy className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <Button variant="link" className="h-auto p-0 text-[#0088cc]" asChild>
                                        <a href={`https://telegram.me/MyAIPriceTrackerBot?start=${token}`} target="_blank" rel="noopener noreferrer">
                                            👉 Click here to Open Bot directly
                                        </a>
                                    </Button>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <p className="text-sm font-medium text-muted-foreground">Step 2: Verify connection</p>
                                    <Button
                                        onClick={handleVerify}
                                        disabled={verifying}
                                        className="w-full bg-[#0088cc] hover:bg-[#0077b5]"
                                    >
                                        {verifying ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                                        ) : (
                                            <><Check className="mr-2 h-4 w-4" /> I have sent the code</>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
