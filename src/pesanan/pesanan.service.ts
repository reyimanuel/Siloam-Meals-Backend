import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PesananService {
  constructor(private prisma: PrismaService) { }

  async create(link: string, details: any[]) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { link },
      include: { Pantangan: true },
    });

    if (!pasien) throw new NotFoundException("Pasien tidak ditemukan");

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
        PesananDetail: {
          create: details.map((d) => ({
            makananId: d.makananId,
            penggantiId: d.penggantiId ?? null,
          })),
        },
      },
      include: {
        PesananDetail: {
          include: {
            makanan: true,
            pengganti: true,
          },
        },
        pasien: { select: { namaPasien: true } },
      },
    });
  }


  // findAll() {
  //   return `This action returns all pesanan`;
  // }

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
