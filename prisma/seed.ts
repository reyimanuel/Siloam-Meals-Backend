import { PrismaClient, Role, Jenis } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
            nama: 'John Doe',
            username: 'john',
            password: hashedPassword,
            role: Role.NURSE,
            email: 'john@example.com',
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'jane@example.com' },
        update: {},
        create: {
            nama: 'Jane Doe',
            username: 'jane',
            password: hashedPassword,
            role: Role.ADMIN,
            email: 'jane@example.com',
        },
    });

    const user3 = await prisma.user.upsert({
        where: { email: 'jack@example.com' },
        update: {},
        create: {
            nama: 'Jack Doe',
            username: 'jack',
            password: hashedPassword,
            role: Role.KITCHEN,
            email: 'jack@example.com',
        },
    });

    const user4 = await prisma.user.upsert({
        where: { email: 'jessica@example.com' },
        update: {},
        create: {
            nama: 'Jessica Doe',
            username: 'jessica',
            password: hashedPassword,
            role: Role.DIETISIEN,
            email: 'jessica@example.com',
        },
    });

    const makanan1 = await prisma.makanan.upsert({
        where: { id: 1 },
        update: {},
        create: {
            namaMakanan: 'Nasi Putih',
            jenis: Jenis.Karbohidrat,
        },
    });


    const makanan2 = await prisma.makanan.upsert({
        where: { id: 2 },
        update: {},
        create: {
            namaMakanan: 'Ayam Bakar',
            jenis: Jenis.Lauk,
        },
    });


    const makanan3 = await prisma.makanan.upsert({
        where: { id: 3 },
        update: {},
        create: {
            namaMakanan: 'Tuna Goreng',
            jenis: Jenis.Lauk,
        },
    });


    const makanan4 = await prisma.makanan.upsert({
        where: { id: 4 },
        update: {},
        create: {
            namaMakanan: 'Bir Bintang',
            jenis: Jenis.Minuman,
        },
    });

    console.log({ user1, user2, user3, user4, makanan1, makanan2, makanan3, makanan4 });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
