import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UpdateMakananDto } from './custom.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class MakananService {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.MakananUncheckedCreateInput & { sampinganIds?: number[] }, file: Express.Multer.File, userId: number) {
    const imagePath = file ? `/public/${file.filename}` : null;

    const sampinganIds = data.sampinganIds || [];

    return this.prisma.makanan.create({
      // Bangun objek 'data' secara eksplisit, tanpa spread operator
      data: {
        namaMakanan: data.namaMakanan,
        jenis: data.jenis,
        gambar: imagePath,
        createdBy: userId,
        menuId: data.menuId ? Number(data.menuId) : null,
        utamaDari: {
          connect: sampinganIds.map(id => ({ idMakanan: Number(id) })),
        },
      },
      include: {
        user: { select: { namaUser: true } },
        utamaDari: true,
      },
    });
  }

  async findAll() {
    const makanans = await this.prisma.makanan.findMany({
      include: {
        user: { select: { namaUser: true } },
        utamaDari: true, // ambil array makanan utama
      },
    });

    return makanans.map(m => ({
      ...m,
      gambar: m.gambar ? `${process.env.APP_URL}${m.gambar}` : m.gambar,
      utamaDari: m.utamaDari.map(u => ({
        ...u,
        gambar: u.gambar ? `${process.env.APP_URL}${u.gambar}` : u.gambar,
      })),
    }));
  }


  async findOne(id: number) {
    const makanan = await this.prisma.makanan.findUnique({
      where: { idMakanan: id }, 
      include: {
        user: { select: { namaUser: true } }
      },
    });

    if (!makanan) throw new NotFoundException('Makanan Tidak Ditemukan');

    return {
      ...makanan,
      gambar: makanan.gambar ? `${process.env.APP_URL}${makanan.gambar}` : makanan.gambar,
    };
  }

  async update(id: number, dto: UpdateMakananDto, file: Express.Multer.File, userId: number, role: string,) {
    const makanan = await this.prisma.makanan.findUnique({
      where: { idMakanan: id },
    });
    if (!makanan) throw new NotFoundException('Makanan Tidak Ditemukan');

    if (!(role === 'ADMIN' || userId === makanan.createdBy)) {
      throw new ForbiddenException('Hanya Admin atau pembuat data yang dapat memperbarui');
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

    return this.prisma.makanan.update({
      where: { idMakanan: id },
      data: {
        ...(dto.namaMakanan ? { namaMakanan: dto.namaMakanan } : {}),
        ...(dto.jenis ? { jenis: dto.jenis as any } : {}),
        ...(dto.menuId ? { menuId: Number(dto.menuId) } : {}),
        ...(dto.punyaUtamaId
          ? {
            punyaUtama: {
              set: [{ idMakanan: Number(dto.punyaUtamaId) }],
            },
          }
          : {}),
        ...(gambarUrl ? { gambar: gambarUrl } : {}),
      },
    });
  }

  async remove(id: number, userId: number, role: string) {
    const makanan = await this.prisma.makanan.findUnique({ where: { idMakanan : id } });
    if (!makanan) throw new NotFoundException('Makanan Tidak Ditemukan');

    // Hanya Admin atau pembuat data yang boleh hapus
    if (!(role === 'ADMIN' || userId === makanan.createdBy)) {
      throw new ForbiddenException('Hanya Admin atau pembuat data yang dapat menghapus');
    }

    if (makanan.gambar) {
      const filePath = join(process.cwd(), 'public', 'uploads', makanan.gambar);
      try {
        await unlink(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }

    await this.prisma.makanan.delete({
      where: { idMakanan: id },
    });

    return { message: 'Makanan berhasil dihapus' };
  }
}