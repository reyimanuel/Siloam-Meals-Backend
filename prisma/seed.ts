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
            namaMenu: 'Menu',
            createdBy: user3.idUser,
        },
    });

    const menu2 = await prisma.menu.upsert({
        where: { idMenu: 2 },
        update: {},
        create: {
            namaMenu: 'Menu',
            createdBy: user3.idUser,
        },
    });

    const menu3 = await prisma.menu.upsert({
        where: { idMenu: 3 },
        update: {},
        create: {
            namaMenu: 'Menu',
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
            gambar: '/public/nasi-putih.png',
        },
    });

    const makanan2 = await prisma.makanan.upsert({
        where: { idMakanan: 2 },
        update: {},
        create: {
            namaMakanan: 'Nasi Merah',
            jenis: Jenis.Karbohidrat,
            createdBy: user3.idUser,
            menuId: menu1.idMenu,
            gambar: '/public/nasi-merah.png',
        },
    });

    const makanan3 = await prisma.makanan.upsert({
        where: { idMakanan: 3 },
        update: {},
        create: {
            namaMakanan: 'Telur Dadar',
            jenis: Jenis.Lauk,
            createdBy: user3.idUser,
            menuId: menu1.idMenu,
            gambar: '/public/telur-dadar.png',
        },
    });

    const makanan4 = await prisma.makanan.upsert({
        where: { idMakanan: 4 },
        update: {},
        create: {
            namaMakanan: 'Ayam Kukus',
            jenis: Jenis.Lauk,
            createdBy: user3.idUser,
            menuId: menu1.idMenu,
            gambar: '/public/ayam-kukus.png',
        },
    });

    const makanan5 = await prisma.makanan.upsert({
        where: { idMakanan: 5 },
        update: {},
        create: {
            namaMakanan: 'Kangkung',
            jenis: Jenis.Sayur,
            createdBy: user3.idUser,
            menuId: menu1.idMenu,
            gambar: '/public/kangkung.png',
        },
    });

    const makanan6 = await prisma.makanan.upsert({
        where: { idMakanan: 6 },
        update: {},
        create: {
            namaMakanan: 'Capcay',
            jenis: Jenis.Sayur,
            createdBy: user3.idUser,
            menuId: menu1.idMenu,
            gambar: '/public/capcay.png',
        },
    });

    // Menu
    const makanan7 = await prisma.makanan.upsert({
        where: { idMakanan: 7 },
        update: {},
        create: {
            namaMakanan: 'Nasi Putih',
            jenis: Jenis.Karbohidrat,
            createdBy: user3.idUser,
            menuId: menu2.idMenu,
            gambar: '/public/nasi-putih.png',
        },
    });

    const makanan8 = await prisma.makanan.upsert({
        where: { idMakanan: 8 },
        update: {},
        create: {
            namaMakanan: 'Kentang Panggang',
            jenis: Jenis.Karbohidrat,
            createdBy: user3.idUser,
            menuId: menu2.idMenu,
            gambar: '/public/kentang-panggang.png',
        },
    });

    const makanan9 = await prisma.makanan.upsert({
        where: { idMakanan: 9 },
        update: {},
        create: {
            namaMakanan: 'Ayam Goreng',
            jenis: Jenis.Lauk,
            createdBy: user3.idUser,
            menuId: menu2.idMenu,
            gambar: '/public/ayam-goreng.png',
        },
    });

    const makanan10 = await prisma.makanan.upsert({
        where: { idMakanan: 10 },
        update: {},
        create: {
            namaMakanan: 'Ikan Bakar',
            jenis: Jenis.Lauk,
            createdBy: user3.idUser,
            menuId: menu2.idMenu,
            gambar: '/public/ikan-bakar.png',
        },
    });

    const makanan11 = await prisma.makanan.upsert({
        where: { idMakanan: 11 },
        update: {},
        create: {
            namaMakanan: 'Capcay',
            jenis: Jenis.Sayur,
            createdBy: user3.idUser,
            menuId: menu2.idMenu,
            gambar: '/public/capcay.png',
        },
    });

    const makanan12 = await prisma.makanan.upsert({
        where: { idMakanan: 12 },
        update: {},
        create: {
            namaMakanan: 'Tumis Buncis',
            jenis: Jenis.Sayur,
            createdBy: user3.idUser,
            menuId: menu2.idMenu,
            gambar: '/public/tumis-buncis.png',
        },
    });

    // Menu
    const makanan13 = await prisma.makanan.upsert({
        where: { idMakanan: 13 },
        update: {},
        create: {
            namaMakanan: 'Nasi Putih',
            jenis: Jenis.Karbohidrat,
            createdBy: user3.idUser,
            menuId: menu3.idMenu,
            gambar: '/public/nasi-putih.png',
        },
    });

    const makanan14 = await prisma.makanan.upsert({
        where: { idMakanan: 14 },
        update: {},
        create: {
            namaMakanan: 'Nasi Merah',
            jenis: Jenis.Karbohidrat,
            createdBy: user3.idUser,
            menuId: menu3.idMenu,
            gambar: '/public/nasi-merah.png',
        },
    });

    const makanan15 = await prisma.makanan.upsert({
        where: { idMakanan: 15 },
        update: {},
        create: {
            namaMakanan: 'Sup Ayam',
            jenis: Jenis.Lauk,
            createdBy: user3.idUser,
            menuId: menu3.idMenu,
            gambar: '/public/sup-ayam.png',
        },
    });

    const makanan16 = await prisma.makanan.upsert({
        where: { idMakanan: 16 },
        update: {},
        create: {
            namaMakanan: 'Tahu Bacem',
            jenis: Jenis.Lauk,
            createdBy: user3.idUser,
            menuId: menu3.idMenu,
            gambar: '/public/tahu-bacem.png',
        },
    });

    const makanan17 = await prisma.makanan.upsert({
        where: { idMakanan: 17 },
        update: {},
        create: {
            namaMakanan: 'Sayur Asem',
            jenis: Jenis.Sayur,
            createdBy: user3.idUser,
            menuId: menu3.idMenu,
            gambar: '/public/sayur-asem.png',
        },
    });

    const makanan18 = await prisma.makanan.upsert({
        where: { idMakanan: 18 },
        update: {},
        create: {
            namaMakanan: 'Lalapan',
            jenis: Jenis.Sayur,
            createdBy: user3.idUser,
            menuId: menu3.idMenu,
            gambar: '/public/lalapan.png',
        },
    });


    console.log({ user1, user2, user3, user4, menu1, menu2, menu3, makanan1, makanan2, makanan3, makanan4, makanan5, makanan6, makanan7 });
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
