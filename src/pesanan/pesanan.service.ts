import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PesananService {
  constructor(private prisma: PrismaService) { }

  async create(pasienId: number, details: any[]) {
    return this.prisma.pesanan.create({
      data: {
        pasienId,
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
