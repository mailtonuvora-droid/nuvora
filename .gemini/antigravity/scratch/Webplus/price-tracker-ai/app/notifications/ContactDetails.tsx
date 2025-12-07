'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MessageSquare, Pencil, Check, X } from 'lucide-react';
import { updateContactDetails } from './actions';
import { toast } from 'sonner';

interface ContactDetailsProps {
    initialEmail: string | null;
    initialMobile: string | null;
}

export default function ContactDetails({ initialEmail, initialMobile }: ContactDetailsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState(initialEmail || '');
    const [mobile, setMobile] = useState(initialMobile || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateContactDetails(email, mobile);
            setIsEditing(false);
            toast.success("Contact details updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setEmail(initialEmail || '');
        setMobile(initialMobile || '');
        setIsEditing(false);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Table Header - Hidden on Mobile */}
            <div className="hidden md:grid grid-cols-12 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 p-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <div className="col-span-5">Email Address</div>
                <div className="col-span-4">Mobile Number</div>
                <div className="col-span-3 text-right">Action</div>
            </div>

            {/* Combined Row */}
            <div className="flex flex-col md:grid md:grid-cols-12 p-4 items-start md:items-center hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors gap-4 md:gap-0">

                {/* Email Field */}
                <div className="w-full md:col-span-5 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    {isEditing ? (
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-8 text-sm w-full md:w-auto"
                            placeholder="Email Address"
                        />
                    ) : (
                        <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate">{email || 'Not set'}</span>
                    )}
                </div>

                {/* Mobile Field */}
                <div className="w-full md:col-span-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {isEditing ? (
                        <Input
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="h-8 text-sm w-full md:w-auto"
                            placeholder="Mobile Number"
                        />
                    ) : (
                        <span className={`${mobile ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-500 italic'} truncate`}>{mobile || 'Not set'}</span>
                    )}
                </div>

                {/* Actions */}
                <div className="w-full md:col-span-3 flex justify-end gap-2 mt-2 md:mt-0">
                    {isEditing ? (
                        <>
                            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isLoading} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30">
                                <X className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleSave} disabled={isLoading} className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30">
                                <Check className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="w-full md:w-auto text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 flex items-center justify-center gap-2">
                            <Pencil className="h-3 w-3" /> <span className="md:hidden">Edit</span> <span className="hidden md:inline">Edit Details</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
