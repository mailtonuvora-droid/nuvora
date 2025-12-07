const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users.`);

    if (userCount === 0) {
        console.log('Creating a demo user...');
        await prisma.user.create({
            data: {
                name: 'Demo User',
                email: 'demo@example.com',
                password: 'password123', // In a real app this should be hashed
                subscriptionTier: 'premium',
            },
        });
        console.log('Demo user created.');
    } else {
        const user = await prisma.user.findFirst();
        console.log(`Using existing user: ${user.email}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
