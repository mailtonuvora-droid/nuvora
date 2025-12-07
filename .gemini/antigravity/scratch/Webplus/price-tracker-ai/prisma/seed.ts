
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await hash('password123', 12)

    // Create Free User
    const freeUser = await prisma.user.upsert({
        where: { email: 'free@example.com' },
        update: {},
        create: {
            email: 'free@example.com',
            name: 'Free User',
            password,
            subscriptionTier: 'free',
        },
    })

    // Create Premium User
    const premiumUser = await prisma.user.upsert({
        where: { email: 'premium@example.com' },
        update: {},
        create: {
            email: 'premium@example.com',
            name: 'Premium User',
            password,
            subscriptionTier: 'premium',
            subscriptionStatus: 'active',
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
    })

    // Create Expiring User
    const expiringUser = await prisma.user.upsert({
        where: { email: 'expiring@example.com' },
        update: {},
        create: {
            email: 'expiring@example.com',
            name: 'Expiring User',
            password,
            subscriptionTier: 'premium',
            subscriptionStatus: 'active',
            subscriptionEndDate: new Date(Date.now() - 1000), // Expired
        },
    })

    // Create Admin User (Self)
    // Assuming the user logged in is the admin, referencing their current email if known,
    // or creating a dedicated admin.
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password,
            subscriptionTier: 'premium',
        },
    })

    console.log({ freeUser, premiumUser, expiringUser, adminUser })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
