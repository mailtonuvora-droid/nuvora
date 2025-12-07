
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Find User
    const emails = ['saravanavenkatachalam@gmail.com', 'saravanavenkatachalam8001@gmail.com'];
    let user = null;

    for (const email of emails) {
        user = await prisma.user.findUnique({ where: { email } });
        if (user) break;
    }

    if (!user) {
        console.log('User not found. Creating dummy user saravanavenkatachalam@gmail.com');
        user = await prisma.user.create({
            data: {
                email: 'saravanavenkatachalam@gmail.com',
                name: 'Saravana Test',
                emailNotifications: true,
                subscriptionTier: 'premium' // To test limit potentially, but mainly for features
            }
        });
    }

    console.log(`Using User: ${user.email} (${user.id})`);

    // 2. Insert Dummy Product with HIGH price
    // We use a real Amazon URL so the scraper can fetch the REAL (lower) price.
    const product = await prisma.product.create({
        data: {
            userId: user.id,
            url: 'https://www.amazon.in/Apple-iPhone-13-128GB-Starlight/dp/B09G9D8KRQ', // iPhone 13
            title: 'DUMMY TEST PRODUCT - iPhone 13',
            imageUrl: 'https://m.media-amazon.com/images/I/71GLMJ7TQiL._SX679_.jpg',
            currentPrice: 999999, // Artificially high price
            currency: 'INR',
            isAvailable: true,
            alertEnabled: true,
            checkInterval: 900,
            nextCheckAt: new Date(), // Due immediately
        }
    });

    console.log(`Created Dummy Product: ${product.id}`);
    console.log(`Fake Price: 999999. Real price check should trigger alert.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
