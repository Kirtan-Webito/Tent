import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');
    const email = 'admin@tent.com';
    const password = 'admin'; // Change in production!

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            name: 'Super Admin',
        },
    });

    console.log('Seeded User:', admin);
}

main()
    .then(async () => {
        await prisma.$disconnect();
        process.exit(0);
    })
    .catch(async (e) => {
        console.error('Seed error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
