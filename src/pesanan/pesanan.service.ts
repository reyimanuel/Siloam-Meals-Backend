import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Jenis, Prisma, StatusPesanan } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PesananService {
  constructor(private prisma: PrismaService) {}

  async create(uuid: string, sesi: string, details: { makananId: number }[]) {
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

    // --- PERUBAHAN: Fetch detail makanan untuk disimpan sebagai history ---
    const makananDetails = await this.prisma.makanan.findMany({
      where: {
        idMakanan: {
          in: details.map((d) => d.makananId),
        },
      },
    });

    if (makananDetails.length !== details.length) {
      throw new BadRequestException('Satu atau lebih makanan tidak valid.');
    }
    // ------------------------------------------------------------------

    // Cek apakah ada makanan yang dipesan masuk dalam pantangan
    const forbidden = makananDetails.filter((d) =>
      pantanganIds.has(d.idMakanan),
    );

    if (forbidden.length > 0) {
      throw new BadRequestException(
        `Pesanan tidak valid. Pasien memiliki pantangan terhadap makanan: ${forbidden
          .map((f) => f.namaMakanan)
          .join(', ')}`,
      );
    }

    return this.prisma.pesanan.create({
      data: {
        pasienId: pasien.idPasien,
        tanggal: tomorrow,
        sesi: sesi,
        // --- PERUBAHAN: Simpan snapshot data pasien saat pesanan dibuat ---
        namaPasienHistory: pasien.namaPasien,
        ruanganInapHistory: pasien.ruanganInap,
        mrHistory: pasien.mr,
        diagnosaHistory: pasien.diagnosa,
        // -------------------------------------------------------------
        PesananDetail: {
          // --- PERUBAHAN: Simpan snapshot data makanan saat pesanan dibuat ---
          create: makananDetails.map((m) => ({
            makananId: m.idMakanan,
            namaMakananHistory: m.namaMakanan,
            jenisHistory: m.jenis,
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

  async findForKitchen() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    const pesanan = await this.prisma.pesanan.findMany({
      where: {
        status: StatusPesanan.PENDING,
        tanggal: {
          gte: startOfTomorrow,
          lt: endOfTomorrow,
        },
      },
      include: {
        pasien: { select: { namaPasien: true, ruanganInap: true } },
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

    return pesanan.map((p) => ({
      ...p,
      namaPasien:
        p.pasien?.namaPasien ?? p.namaPasienHistory ?? 'Pasien Dihapus',
      ruanganInap: p.pasien?.ruanganInap ?? p.ruanganInapHistory ?? 'N/A',
    }));
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

  // FUNGSI BARU: Logika untuk menghitung pesanan pending per sesi
  async getCountBySesi() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    const counts = await this.prisma.pesanan.groupBy({
      by: ['sesi'],
      where: {
        status: StatusPesanan.PENDING,
        tanggal: {
          gte: startOfTomorrow,
          lt: endOfTomorrow,
        },
      },
      _count: {
        _all: true,
      },
    });

    // Mengubah format data agar lebih mudah digunakan di frontend
    const result = {
      'Menu Pagi': 0,
      'Menu Siang': 0,
      'Menu Malam': 0,
    };

    counts.forEach((item) => {
      if (result.hasOwnProperty(item.sesi)) {
        result[item.sesi] = item._count._all;
      }
    });

    return result;
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

  async findAll(startDate?: string, endDate?: string) {
    // 2. Tambahkan parameter tanggal
    const whereClause: Prisma.PesananWhereInput = {}; // 3. Buat objek whereClause

    if (startDate && endDate) {
      whereClause.tanggal = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const pesanan = await this.prisma.pesanan.findMany({
      where: whereClause, // 4. Gunakan whereClause dalam query
      include: {
        pasien: { select: { namaPasien: true, ruanganInap: true } },
        PesananDetail: {
          include: {
            makanan: true,
          },
        },
      },
      orderBy: {
        tanggal: 'desc', // Urutkan berdasarkan tanggal
      },
    });

    return pesanan.map((p) => ({
      ...p,
      namaPasien:
        p.pasien?.namaPasien ?? p.namaPasienHistory ?? 'Pasien Dihapus',
      ruanganInap: p.pasien?.ruanganInap ?? p.ruanganInapHistory ?? 'N/A',
    }));
  }

  async remove(id: number) {
    const pesanan = await this.prisma.pesanan.findUnique({
      where: { idPesanan: id },
    });

    if (!pesanan) {
      throw new NotFoundException('Riwayat pesanan tidak ditemukan.');
    }

    // Dengan onDelete: Cascade pada PesananDetail, detail akan terhapus otomatis.
    return this.prisma.pesanan.delete({
      where: { idPesanan: id },
    });
  }
}
