import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { MakananDto } from './custom.dto'; // Import DTO baru
import { unlink } from 'fs/promises';
import { join } from 'path';

// Definisikan tipe data untuk jadwal di sini
interface ScheduledFood {
  id: number;
  nama: string;
  jenis: string;
}

interface DailySchedule {
  Pagi: ScheduledFood[];
  Siang: ScheduledFood[];
  Malam: ScheduledFood[];
  Lainnya: ScheduledFood[];
}

@Injectable()
export class MakananService {
  constructor(private prisma: PrismaService) {}

  // FUNGSI BARU: Logika untuk mengambil jadwal menu bulanan
  async findMonthlySchedule(month: number, year: number) {
    // Menentukan tanggal awal dan akhir dari bulan yang diminta
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const scheduledFoods = await this.prisma.makanan.findMany({
      where: {
        tanggalTersedia: {
          some: {
            tanggal: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      include: {
        menu: { select: { namaMenu: true } }, // Untuk mengetahui sesi (Pagi/Siang/Malam)
        tanggalTersedia: {
          where: {
            tanggal: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    // Mengelompokkan makanan berdasarkan tanggal dan sesi
    const schedule = {};

    scheduledFoods.forEach((food) => {
      food.tanggalTersedia.forEach((tgl) => {
        const dateString = tgl.tanggal.toISOString().split('T')[0]; // Format YYYY-MM-DD

        if (!schedule[dateString]) {
          schedule[dateString] = {
            Pagi: [],
            Siang: [],
            Malam: [],
            Lainnya: [],
          };
        }

        const foodData = {
          id: food.idMakanan,
          nama: food.namaMakanan,
          jenis: food.jenis,
        };

        // *** PERBAIKAN LOGIKA UTAMA DI SINI ***
        if (food.jenis === 'Lauk') {
          // Jika Lauk, kelompokkan berdasarkan menu spesifik
          let sesiKey: keyof DailySchedule = 'Lainnya';
          const namaMenu = food.menu?.namaMenu;

          if (namaMenu === 'Menu Pagi') sesiKey = 'Pagi';
          else if (namaMenu === 'Menu Siang') sesiKey = 'Siang';
          else if (namaMenu === 'Menu Malam') sesiKey = 'Malam';

          schedule[dateString][sesiKey].push(foodData);
        } else {
          // Jika bukan Lauk (pendamping), tambahkan ke semua sesi
          schedule[dateString].Pagi.push(foodData);
          schedule[dateString].Siang.push(foodData);
          schedule[dateString].Malam.push(foodData);
        }
      });
    });

    return schedule;
  }

  async create(
    dto: MakananDto & { utamaDariIds?: number[] },
    file: Express.Multer.File,
    userId: number,
  ) {
    const gambarUrl = file ? `/public/${file.filename}` : null;

    // SOLUSI: Tambahkan konversi boolean ini, sama seperti di fungsi update
    const isPaketBoolean = String(dto.isPaket) === 'true';

    return this.prisma.makanan.create({
      data: {
        namaMakanan: dto.namaMakanan,
        jenis: dto.jenis,
        isPaket: isPaketBoolean, // SOLUSI: Gunakan nilai boolean di sini
        gambar: gambarUrl,
        createdBy: userId,
        menuId: dto.menuId ? Number(dto.menuId) : null,
        ...(dto.utamaDariIds?.length && {
          utamaDari: {
            connect: dto.utamaDariIds.map((id) => ({ idMakanan: Number(id) })),
          },
        }),
        ...(dto.tanggalTersedia?.length && {
          tanggalTersedia: {
            create: dto.tanggalTersedia.map((tgl) => ({
              tanggal: new Date(tgl),
            })),
          },
        }),
      },
      include: {
        user: { select: { namaUser: true } },
        utamaDari: true,
        tanggalTersedia: true,
      },
    });
  }

  async findAll() {
    const makanans = await this.prisma.makanan.findMany({
      include: {
        user: { select: { namaUser: true } },
        utamaDari: true,
        tanggalTersedia: true,
      },
    });

    return makanans.map((m) => ({
      ...m,
      gambar: m.gambar ? `${process.env.APP_URL}${m.gambar}` : m.gambar,
      utamaDari: m.utamaDari.map((u) => ({
        ...u,
        gambar: u.gambar ? `${process.env.APP_URL}${u.gambar}` : u.gambar,
      })),
    }));
  }

  async findOne(id: number) {
    const makanan = await this.prisma.makanan.findUnique({
      where: { idMakanan: id },
      include: {
        user: { select: { namaUser: true } },
        utamaDari: true,
        tanggalTersedia: true,
      },
    });

    if (!makanan) throw new NotFoundException('Makanan Tidak Ditemukan');

    return {
      ...makanan,
      gambar: makanan.gambar
        ? `${process.env.APP_URL}${makanan.gambar}`
        : makanan.gambar,
    };
  }

  async update(
    id: number,
    dto: MakananDto & { utamaDariIds?: number[] },
    file: Express.Multer.File,
    userId: number,
    role: string,
  ) {
    const makanan = await this.prisma.makanan.findUnique({
      where: { idMakanan: id },
      include: { tanggalTersedia: true },
    });
    if (!makanan) throw new NotFoundException('Makanan Tidak Ditemukan');

    if (role !== 'ADMIN' && role !== 'KITCHEN') {
      throw new ForbiddenException(
        'Hanya Admin atau Staf Dapur yang dapat memperbarui data ini',
      );
    }

    let gambarUrl: string | undefined;
    if (file) {
      if (makanan.gambar) {
        const oldPath = join(process.cwd(), makanan.gambar.replace(/^\//, ''));
        try {
          await unlink(oldPath);
        } catch (err) {
          console.warn('Gagal hapus gambar lama:', err.message);
        }
      }
      gambarUrl = `/public/${file.filename}`;
    }

    // PERBAIKAN DI SINI: Konversi string dari FormData menjadi boolean
    const isPaketBoolean = String(dto.isPaket) === 'true';

    return this.prisma.makanan.update({
      where: { idMakanan: id },
      data: {
        ...(dto.namaMakanan && { namaMakanan: dto.namaMakanan }),
        ...(dto.jenis && { jenis: dto.jenis }),
        ...(dto.isPaket && { isPaket: isPaketBoolean }),
        ...(dto.menuId && { menuId: Number(dto.menuId) }),
        ...(dto.utamaDariIds?.length && {
          utamaDari: {
            set: dto.utamaDariIds.map((id) => ({ idMakanan: Number(id) })),
          },
        }),
        ...(gambarUrl && { gambar: gambarUrl }),
        ...(dto.tanggalTersedia?.length && {
          tanggalTersedia: {
            deleteMany: {}, // hapus semua tanggal lama
            create: dto.tanggalTersedia.map((tgl) => ({
              tanggal: new Date(tgl),
            })),
          },
        }),
      },
      include: {
        user: { select: { namaUser: true } },
        utamaDari: true,
        tanggalTersedia: true,
      },
    });
  }

  async remove(id: number, userId: number, role: string) {
    const makanan = await this.prisma.makanan.findUnique({
      where: { idMakanan: id },
    });

    if (!makanan) {
      throw new NotFoundException('Makanan Tidak Ditemukan');
    }

    if (role !== 'ADMIN' && role !== 'KITCHEN') {
      throw new ForbiddenException(
        'Hanya Admin atau Staf Dapur yang dapat menghapus data ini',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Salin data makanan ke riwayat pesanan (PesananDetail)
      await tx.pesananDetail.updateMany({
        where: { makananId: id },
        data: {
          namaMakananHistory: makanan.namaMakanan,
          jenisHistory: makanan.jenis,
        },
      });

      // 2. Hapus file gambar jika ada
      if (makanan.gambar) {
        const filePath = join(process.cwd(), makanan.gambar.replace(/^\//, ''));
        try {
          await unlink(filePath);
        } catch (err) {
          console.warn('Gagal hapus gambar fisik:', err.message);
        }
      }

      // 3. Hapus makanan. Prisma akan menangani relasi `onDelete`
      await tx.makanan.delete({
        where: { idMakanan: id },
      });
    });

    return { message: `Makanan "${makanan.namaMakanan}" berhasil dihapus.` };
  }
}
