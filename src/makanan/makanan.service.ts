import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class MakananService {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.MakananUncheckedCreateInput, userId: number) {
    return this.prisma.makanan.create({
      data: {
        ...data,
        createdBy: userId,
        menuId: data.menuId
      },
      include: {
        user: { select: { namaUser: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.makanan.findMany({
      include: { 
        user: { select: { namaUser: true } } },
    });
  }

  async findOne(id: number) {
    const makanan = await this.prisma.makanan.findUnique({
      where: { idMakanan : id },
      include: { 
        user: { select: { namaUser: true } } 
      },
    });
    if (!makanan) throw new NotFoundException('Makanan Tidak Ditemukan');
    return makanan;
  }

  async update(id: number, data: Prisma.MakananUncheckedUpdateInput, userId: number, role: string) {
    const makanan = await this.prisma.makanan.findUnique({ where: { idMakanan : id } });
    if (!makanan) throw new NotFoundException('Makanan Tidak Ditemukan');

    // Hanya Admin atau pembuat data yang boleh update
    if (!(role === 'ADMIN' || userId === makanan.createdBy)) {
      throw new ForbiddenException('Hanya Admin atau pembuat data yang dapat memperbarui');
    }

    return this.prisma.makanan.update({ 
      data: { 
        ...data, 
        menuId : data.menuId
      }, 
      where: { idMakanan : id } });
  }

  async remove(id: number, userId: number, role: string) {
    const makanan = await this.prisma.makanan.findUnique({ where: { idMakanan : id } });
    if (!makanan) throw new NotFoundException('Makanan Tidak Ditemukan');

    // Hanya Admin atau pembuat data yang boleh hapus
    if (!(role === 'ADMIN' || userId === makanan.createdBy)) {
      throw new ForbiddenException('Hanya Admin atau pembuat data yang dapat menghapus');
    }

    await this.prisma.$transaction([
      this.prisma.makanan.delete({ where: { idMakanan : id } })
    ]);
  }
}