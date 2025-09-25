import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Jenis } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PesananService {
  constructor(private prisma: PrismaService) { }

  async create(uuid: string, sesi: string, details: any[]) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { uuid },
      include: { Pantangan: true },
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
        `Pasien sudah memiliki pesanan untuk sesi ${sesi} pada tanggal ${tomorrow.toLocaleDateString()}`
      );
    }

    // Ambil daftar makanan pantangan pasien
    const pantanganIds = pasien.Pantangan.map((p) => p.makananId);

    // Cek apakah ada makanan yang dipesan masuk dalam pantangan
    const forbidden = details.filter((d) => pantanganIds.includes(d.makananId));

    if (forbidden.length > 0) {
      throw new BadRequestException(
        `Pesanan tidak valid. Pasien memiliki pantangan terhadap makanan dengan ID: ${forbidden
          .map((f) => f.makananId)
          .join(", ")}`
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

  async findMenu(uuid: string) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { uuid },
      include: { Pantangan: true },
    });

    if (!pasien) throw new NotFoundException("Pasien tidak ditemukan");

    const pantanganIds = pasien.Pantangan.map(p => p.makananId);

    const menus = await this.prisma.menu.findMany({
      include: {
        user: { select: { namaUser: true } },
        Makanan: {
          where: {
            jenis: Jenis.Lauk,
            idMakanan: {
              notIn: pantanganIds
            },
          },
          select: {
            idMakanan: true,
            namaMakanan: true,
            jenis: true,
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

    return menus.map(menu => {
      const transformedMakanan = menu.Makanan?.map(m => {
        const utamaDariWithUrl = m.utamaDari?.map(utama => ({
          ...utama,
          gambar: utama.gambar ? `${process.env.APP_URL}${utama.gambar}` : utama.gambar,
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
      include: { Pantangan: true },
    });

    if (!pasien) throw new NotFoundException("Pasien tidak ditemukan");

    const pantanganIds = pasien.Pantangan.map(p => p.makananId);

    const makanan = await this.prisma.makanan.findMany({
      where: {
        idMakanan: {
          notIn: pantanganIds
        },
      },
    });

    return makanan.map(m => ({
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

  findAll() {
    return this.prisma.pesanan.findMany({
      include: {
        pasien: { select: { namaPasien: true } },
        PesananDetail: {
          include: {
            makanan: true,
          },
        },
      },
    });
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

