const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'user1@gmail.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });
    console.log(`Updated password for ${user.email} to '${password}'`);
}

main()
    .catch((e) => {
        // If user not found, try user2 or demo
        console.error(e);
        // Fallback to creating/updating demo user if needed, but let's see.
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
