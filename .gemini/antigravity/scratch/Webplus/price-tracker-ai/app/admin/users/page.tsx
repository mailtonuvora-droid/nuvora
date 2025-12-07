import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserManagementTable from "@/components/admin/UserManagementTable"

export default async function AdminUsersPage() {
    const session = await auth()

    // TODO: Replace with real admin check (e.g., restricted to specific email)
    const adminEmail = "admin@example.com" // Replace or fetch from env
    if (session?.user?.email !== adminEmail) {
        // For now, let's allow access for debugging or redirect to home
        // return redirect("/")
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

    return (
        <div className="container py-10 max-w-7xl">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <UserManagementTable users={users} />
                </CardContent>
            </Card>
        </div>
    )
}
