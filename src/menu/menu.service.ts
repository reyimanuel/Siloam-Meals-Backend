import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Jenis, Prisma} from '@prisma/client';

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
        user: { select: { namaUser: true } }
      }
     });
  }

  async findAll() {
    const menus = await this.prisma.menu.findMany({
      include: {
        user: { select: { namaUser: true } },
        Makanan: {
          where: { jenis: Jenis.Lauk },
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

  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { idMenu: id },
      include: {
        user: { select: { namaUser: true } },
        Makanan: {
          where: { jenis: Jenis.Lauk },
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

    if (!menu) {
      throw new NotFoundException(`Menu tidak ditemukan`);
    }

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
  }

  async update(id: number, updateMenuDto: Prisma.MenuUpdateInput, userId: number, role: string) {
      const menu = await this.prisma.menu.findUnique({ where: { idMenu : id } });
      if (!menu) {
        throw new NotFoundException(`Menu tidak ditemukan`);
      }

      // Hanya Admin atau pembuat data yang boleh update
      if (!(role === 'ADMIN' || userId === menu.createdBy)) {
        throw new ForbiddenException(`Anda tidak memiliki izin untuk mengubah menu ini`);
      }

      return this.prisma.menu.update({
        where: { idMenu : id },
        data: updateMenuDto,
      });
      
  }

  async remove(id: number, userId: number, role: string) {
    const menu = await this.prisma.menu.findUnique({ where: { idMenu : id } });
    if (!menu) {
      throw new NotFoundException(`Menu tidak ditemukan`);
    }

    // Hanya Admin atau pembuat data yang boleh hapus
    if (!(role === 'ADMIN' || userId === menu.createdBy)) {
      throw new ForbiddenException(`Anda tidak memiliki izin untuk menghapus menu ini`);
    }

    await this.prisma.$transaction([
      this.prisma.menu.delete({ where: { idMenu : id } }),
    ]);
  }
}
