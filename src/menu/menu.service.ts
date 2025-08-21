import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma} from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MenuUncheckedCreateInput, userId: number) {
    return this.prisma.menu.create({ 
      data: {
        ...data,
        createdBy: userId
      },
      include: {
        user: { select: { nama: true } }
      }
     });
  }

  async findAll() {
    return this.prisma.menu.findMany({
      include: {
        user: { select: { nama: true } }
      }
    });
  }

  async findOne(id: number) {
    try {
      return this.prisma.menu.findUniqueOrThrow({
        where: { id },
        include: {
          user: { select: { nama: true } }
        }
      });
    } catch (error) {
      throw new NotFoundException(`Menu tidak ditemukan`);
    }
  }

  async update(id: number, updateMenuDto: Prisma.MenuUpdateInput, userId: number, role: string) {
      const menu = await this.prisma.menu.findUnique({ where: { id } });
      if (!menu) {
        throw new NotFoundException(`Menu tidak ditemukan`);
      }

      // Hanya Admin atau pembuat data yang boleh update
      if (!(role === 'ADMIN' || userId === menu.createdBy)) {
        throw new ForbiddenException(`Anda tidak memiliki izin untuk mengubah menu ini`);
      }

      return this.prisma.menu.update({
        where: { id },
        data: updateMenuDto,
      });
      
  }

  async remove(id: number, userId: number, role: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu tidak ditemukan`);
    }

    // Hanya Admin atau pembuat data yang boleh hapus
    if (!(role === 'ADMIN' || userId === menu.createdBy)) {
      throw new ForbiddenException(`Anda tidak memiliki izin untuk menghapus menu ini`);
    }

    await this.prisma.$transaction([
      this.prisma.menu.delete({ where: { id } }),
    ]);
  }
}
