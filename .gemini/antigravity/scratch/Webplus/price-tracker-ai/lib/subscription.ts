
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"

export async function checkAndDowngradeSubscription() {
    const session = await auth()
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, subscriptionTier: true, subscriptionEndDate: true }
    })

    if (!user || user.subscriptionTier !== 'premium' || !user.subscriptionEndDate) return

    const isExpired = new Date() > new Date(user.subscriptionEndDate)

    if (isExpired) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscriptionTier: 'free',
                subscriptionStatus: 'expired'
            }
        })
        console.log(`Downgraded user ${user.id} to free plan due to expiry.`)
    }
}
