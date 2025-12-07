import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Phone, Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';
import { toggleNotification, sendTestNotification } from './actions';
import ContactDetails from './ContactDetails';

export default async function NotificationsPage() {
    const session = await auth();
    let userEmail = session?.user?.email;

    if (!userEmail) {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) userEmail = firstUser.email;
    }

    if (!userEmail) return <div>No user found</div>;

    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
            notifications: {
                orderBy: { sentAt: 'desc' },
                take: 10
            }
        }
    });

    if (!user) return <div>User not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 py-4 px-4 md:px-6">
            <div className="container mx-auto max-w-5xl space-y-4">
                {/* Header */}
                <div className="mb-2">
                    <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                        Notification Center
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage your alert channels and preferences.</p>
                </div>

                {/* Contact Info - Full Width Row */}
                <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ContactDetails initialEmail={user.email} initialMobile={user.mobile} />
                    </CardContent>
                </Card>

                {/* Notification Channels - Full Width Row */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    {/* Email */}
                    <Card className={`border-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${user.emailNotifications
                        ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50'
                        : 'border-zinc-200 bg-zinc-50'
                        }`}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl shadow-sm ${user.emailNotifications ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-base">Email</span>
                                        <p className="text-xs text-zinc-500">Via Nodemailer</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${user.emailNotifications ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                        {user.emailNotifications ? 'ON' : 'OFF'}
                                    </span>
                                    <form action={async () => { 'use server'; await toggleNotification('email', !user.emailNotifications); }}>
                                        <Switch checked={user.emailNotifications} type="submit" />
                                    </form>
                                </div>
                            </div>
                            <form action={async () => { 'use server'; await sendTestNotification('email'); }}>
                                <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-600 hover:bg-blue-100" disabled={!user.emailNotifications}>
                                    🧪 Test Email
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* WhatsApp */}
                    <Card className={`border-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${user.whatsappNotifications
                        ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                        : 'border-zinc-200 bg-zinc-50'
                        }`}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl shadow-sm ${user.whatsappNotifications ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-base">WhatsApp</span>
                                        <p className="text-xs text-zinc-500">Via API</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${user.whatsappNotifications ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                        {user.whatsappNotifications ? 'ON' : 'OFF'}
                                    </span>
                                    <form action={async () => { 'use server'; await toggleNotification('whatsapp', !user.whatsappNotifications); }}>
                                        <Switch checked={user.whatsappNotifications} type="submit" />
                                    </form>
                                </div>
                            </div>
                            <form action={async () => { 'use server'; await sendTestNotification('whatsapp'); }}>
                                <Button variant="outline" size="sm" className="w-full border-green-200 text-green-600 hover:bg-green-100" disabled={!user.whatsappNotifications}>
                                    🧪 Test WhatsApp
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* SMS */}
                    <Card className={`border-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${user.smsNotifications
                        ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50'
                        : 'border-zinc-200 bg-zinc-50'
                        }`}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl shadow-sm ${user.smsNotifications ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-base">SMS</span>
                                        <p className="text-xs text-zinc-500">Via Gateway</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${user.smsNotifications ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                        {user.smsNotifications ? 'ON' : 'OFF'}
                                    </span>
                                    <form action={async () => { 'use server'; await toggleNotification('sms', !user.smsNotifications); }}>
                                        <Switch checked={user.smsNotifications} type="submit" />
                                    </form>
                                </div>
                            </div>
                            <form action={async () => { 'use server'; await sendTestNotification('sms'); }}>
                                <Button variant="outline" size="sm" className="w-full border-orange-200 text-orange-600 hover:bg-orange-100" disabled={!user.smsNotifications}>
                                    🧪 Test SMS
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Notification History */}
                <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Bell className="h-4 w-4 text-indigo-500" />
                            Notification History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {user.notifications.length === 0 ? (
                            <p className="text-center text-zinc-400 py-6 text-sm">No notifications sent yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {user.notifications.map((notif) => (
                                    <div key={notif.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-blue-100 shadow-sm">
                                        <div className={`p-2 rounded-full ${notif.type === 'email' ? 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600' :
                                            notif.type === 'whatsapp' ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' :
                                                notif.type === 'price_drop' ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600' :
                                                    'bg-zinc-100 text-zinc-600'
                                            }`}>
                                            {notif.type === 'email' ? <Mail className="h-4 w-4" /> :
                                                notif.type === 'whatsapp' ? <MessageSquare className="h-4 w-4" /> :
                                                    <Bell className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-800 truncate">{notif.message}</p>
                                            <p className="text-xs text-zinc-400">{new Date(notif.sentAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
