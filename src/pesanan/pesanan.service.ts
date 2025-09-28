import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Jenis, StatusPesanan } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PesananService {
  constructor(private prisma: PrismaService) {}

  async create(uuid: string, sesi: string, details: any[]) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { uuid },
      include: { Pantangan: true, PengecualianMakanan: true },
    });

    if (!pasien) {
      throw new NotFoundException('Pasien tidak ditemukan');
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // reset jam ke 00:00:00

    const existingPesanan = await this.prisma.pesanan.findFirst({
      where: {
        pasienId: pasien.idPasien,
        tanggal: tomorrow,
        sesi: sesi, // pagi / siang / malam
      },
    });

    if (existingPesanan) {
      throw new BadRequestException(
        `Pasien sudah memiliki pesanan untuk sesi ${sesi} pada tanggal ${tomorrow.toLocaleDateString()}`,
      );
    }

    // Gabungkan pantangan umum dan pengecualian spesifik dari dietisien
    const pantanganIds = new Set([
      ...pasien.Pantangan.map((p) => p.makananId),
      ...pasien.PengecualianMakanan.map((p) => p.makananId),
    ]);

    // Cek apakah ada makanan yang dipesan masuk dalam pantangan
    const forbidden = details.filter((d) => pantanganIds.has(d.makananId));

    if (forbidden.length > 0) {
      throw new BadRequestException(
        `Pesanan tidak valid. Pasien memiliki pantangan terhadap makanan dengan ID: ${forbidden
          .map((f) => f.makananId)
          .join(', ')}`,
      );
    }

    return this.prisma.pesanan.create({
      data: {
        pasienId: pasien.idPasien,
        tanggal: tomorrow,
        sesi: sesi,
        PesananDetail: {
          create: details.map((d) => ({
            makananId: d.makananId, // hanya makananId
          })),
        },
      },
      include: {
        PesananDetail: {
          include: {
            makanan: true,
          },
        },
        pasien: { select: { namaPasien: true } },
      },
    });
  }

  async getPesananDapur() {
    const pesanan = await this.prisma.pesanan.findMany({
      include: { pasien: true }, // pasien bisa null setelah dihapus
      orderBy: { created_at: 'desc' },
    });

    return pesanan.map((p) => ({
      idPesanan: p.idPesanan,
      namaPasien:
        p.pasien?.namaPasien ?? p.namaPasienHistory ?? 'Pasien tidak diketahui',
      status: p.status,
      tanggal: p.tanggal,
    }));
  }

  async findMenu(uuid: string) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { uuid },
      include: { Pantangan: true, PengecualianMakanan: true },
    });

    if (!pasien) throw new NotFoundException('Pasien tidak ditemukan');

    // Gabungkan semua ID makanan yang tidak boleh dimakan oleh pasien
    const pantanganUmumIds = pasien.Pantangan.map((p) => p.makananId);
    const pengecualianSpesifikIds = pasien.PengecualianMakanan.map(
      (p) => p.makananId,
    );
    const forbiddenFoodIds = [
      ...new Set([...pantanganUmumIds, ...pengecualianSpesifikIds]),
    ];

    // **LOGIKA BARU: Tentukan tanggal untuk pemesanan (besok)**
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    const menus = await this.prisma.menu.findMany({
      include: {
        user: { select: { namaUser: true } },
        Makanan: {
          where: {
            jenis: Jenis.Lauk,
            idMakanan: {
              notIn: forbiddenFoodIds,
            },
            // **FILTER BARU: Hanya tampilkan makanan yang tersedia besok**
            tanggalTersedia: {
              some: {
                tanggal: {
                  gte: startOfTomorrow,
                  lt: endOfTomorrow,
                },
              },
            },
          },
          select: {
            idMakanan: true,
            namaMakanan: true,
            jenis: true,
            isPaket: true,
            gambar: true,
            created_at: true,
            updated_at: true,
            menuId: true,
            utamaDari: true,
            createdBy: true,
          },
        },
      },
    });

    return menus.map((menu) => {
      const transformedMakanan = menu.Makanan?.map((m) => {
        const utamaDariWithUrl = m.utamaDari?.map((utama) => ({
          ...utama,
          gambar: utama.gambar
            ? `${process.env.APP_URL}${utama.gambar}`
            : utama.gambar,
        }));
        return {
          ...m,
          gambar: m.gambar ? `${process.env.APP_URL}${m.gambar}` : m.gambar,
          utamaDari: utamaDariWithUrl,
        };
      });
      return {
        ...menu,
        Makanan: transformedMakanan,
      };
    });
  }

  async findMakanan(uuid: string) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { uuid },
      include: { Pantangan: true, PengecualianMakanan: true },
    });

    if (!pasien) throw new NotFoundException('Pasien tidak ditemukan');

    // Gabungkan pantangan umum dan pengecualian spesifik dari dietisien
    const pantanganIds = pasien.Pantangan.map((p) => p.makananId);
    const pengecualianSpesifikIds = pasien.PengecualianMakanan.map(
      (p) => p.makananId,
    );
    const forbiddenFoodIds = [
      ...new Set([...pantanganIds, ...pengecualianSpesifikIds]),
    ];

    // **LOGIKA BARU: Tentukan tanggal untuk pemesanan (besok)**
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    const makanan = await this.prisma.makanan.findMany({
      where: {
        idMakanan: {
          notIn: forbiddenFoodIds,
        },
        // **FILTER BARU: Hanya tampilkan makanan pendamping yang tersedia besok**
        tanggalTersedia: {
          some: {
            tanggal: {
              gte: startOfTomorrow,
              lt: endOfTomorrow,
            },
          },
        },
      },
    });

    return makanan.map((m) => ({
      ...m,
      gambar: m.gambar ? `${process.env.APP_URL}${m.gambar}` : m.gambar,
    }));
  }

  findPesananPasien(uuid: string) {
    return this.prisma.pesanan.findMany({
      where: { pasien: { uuid } },
      include: {
        PesananDetail: {
          include: {
            makanan: true,
          },
        },
      },
    });
  }

  async findAll() {
    const pesanan = await this.prisma.pesanan.findMany({
      include: {
        pasien: { select: { namaPasien: true, ruanganInap: true } }, // pasien bisa null
        PesananDetail: {
          include: {
            makanan: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // PERBAIKAN: Gunakan pemetaan untuk memastikan nama pasien selalu ada
    return pesanan.map((p) => ({
      ...p,
      // Logika fallback ini akan digunakan oleh semua peran (Admin & Kitchen)
      namaPasien:
        p.pasien?.namaPasien ?? p.namaPasienHistory ?? 'Pasien Dihapus',
      ruanganInap: p.pasien?.ruanganInap ?? 'N/A',
    }));
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} pesanan`;
  // }

  // update(id: number, updatePesanandata: UpdatePesanandata) {
  //   return `This action updates a #${id} pesanan`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} pesanan`;
  // }
}
