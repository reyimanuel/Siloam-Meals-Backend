import { PrismaClient, Role, Jenis } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
            namaUser: 'John Doe',
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
            namaUser: 'Jane Doe',
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
            namaUser: 'Jack Doe',
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
            namaUser: 'Jessica Doe',
            username: 'jessica',
            password: hashedPassword,
            role: Role.DIETISIEN,
            email: 'jessica@example.com',
        },
    });

    const menu1 = await prisma.menu.upsert({
        where: { idMenu: 1 },
        update: {},
        create: {
            namaMenu: 'Menu 1',
            createdBy: user3.idUser,
        },
    });

    const menu2 = await prisma.menu.upsert({
        where: { idMenu: 2 },
        update: {},
        create: {
            namaMenu: 'Menu 2',
            createdBy: user3.idUser,
        },
    });

    const menu3 = await prisma.menu.upsert({
        where: { idMenu: 3 },
        update: {},
        create: {
            namaMenu: 'Menu 3',
            createdBy: user3.idUser,
        },
    });

    const menu4 = await prisma.menu.upsert({
        where: { idMenu: 4 },
        update: {},
        create: {
            namaMenu: 'Menu 4',
            createdBy: user3.idUser,
        },
    });

    const makanan1 = await prisma.makanan.upsert({
        where: { idMakanan: 1 },
        update: {},
        create: {
            namaMakanan: 'Nasi Putih',
            jenis: Jenis.Karbohidrat,
            createdBy: user3.idUser,
            menuId: menu1.idMenu,
        },
    });


    const makanan2 = await prisma.makanan.upsert({
        where: { idMakanan: 2 },
        update: {},
        create: {
            namaMakanan: 'Ayam Bakar',
            jenis: Jenis.Lauk,
            createdBy: user3.idUser,
            menuId: menu2.idMenu,
        },
    });


    const makanan3 = await prisma.makanan.upsert({
        where: { idMakanan: 3 },
        update: {},
        create: {
            namaMakanan: 'Tuna Goreng',
            jenis: Jenis.Lauk,
            createdBy: user3.idUser,
            menuId: menu3.idMenu,
        },
    });


    const makanan4 = await prisma.makanan.upsert({
        where: { idMakanan: 4 },
        update: {},
        create: {
            namaMakanan: 'Bir Bintang',
            jenis: Jenis.Minuman,
            createdBy: user3.idUser,
            menuId: menu4.idMenu,
        },
    });
    console.log({ user1, user2, user3, user4, menu1, menu2, menu3, menu4, makanan1, makanan2, makanan3, makanan4 });
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
