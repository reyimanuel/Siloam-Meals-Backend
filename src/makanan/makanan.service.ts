import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class MakananService {
  constructor(private prisma: PrismaService) {}

  create(dto: Prisma.MakananCreateInput) {
    return this.prisma.makanan.create({ data: dto });
  }

  findAll() {
    return this.prisma.makanan.findMany();
  }

  findOne(id: number) {
    try {
      return this.prisma.makanan.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Makanan Tidak Ditemukan');
    }
  }

  update(id: number, dto: Prisma.MakananUpdateInput) {
    try {
      return this.prisma.makanan.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      throw new NotFoundException('Makanan Tidak Ditemukan');
    }
  }

  remove(id: number) {
    try {
      return this.prisma.makanan.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Makanan Tidak Ditemukan');
    }
  }
}
