import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserManagementTable from "@/components/admin/UserManagementTable"
import { Shield, Users, Crown, UserCheck } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const session = await auth()

    const adminEmail = "admin@example.com"
    if (session?.user?.email !== adminEmail) {
        // For now, let's allow access for debugging
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            subscriptionEndDate: true,
        }
    })

    // Stats
    const totalUsers = users.length
    const premiumUsers = users.filter(u => u.subscriptionTier === 'premium').length
    const activeSubscriptions = users.filter(u => u.subscriptionStatus === 'active' && u.subscriptionTier === 'premium').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent flex items-center gap-3">
                    <Shield className="h-8 w-8 text-purple-600" />
                    Admin Dashboard
                </h1>
                <p className="text-zinc-500 text-sm mt-1">Manage users and subscriptions.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                {/* Total Users */}
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-gray-900">{totalUsers}</p>
                                <p className="text-sm text-zinc-500 font-medium">Total Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Premium Users */}
                <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-lg">
                                <Crown className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-gray-900">{premiumUsers}</p>
                                <p className="text-sm text-zinc-500 font-medium">Premium Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Subscriptions */}
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-gray-900">{activeSubscriptions}</p>
                                <p className="text-sm text-zinc-500 font-medium">Active Subscriptions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Management Table */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-white shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-500" />
                        User Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <UserManagementTable users={users} />
                </CardContent>
            </Card>
        </div>
    )
}
