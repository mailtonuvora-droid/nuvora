import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { checkAndDowngradeSubscription } from '@/lib/subscription';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await checkAndDowngradeSubscription();

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <Sidebar />
            </div>
            <div className="flex-grow md:overflow-y-auto md:p-12">
                <Header />
                <div className="p-4 md:p-0">{children}</div>
            </div>
        </div>
    );
}
