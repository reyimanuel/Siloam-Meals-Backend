import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { MakananDto } from './custom.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class MakananService {
  constructor(private prisma: PrismaService) { }

  async create(
    dto: MakananDto & { utamaDariIds?: number[] },
    file: Express.Multer.File,
    userId: number,
  ) {
    const gambarUrl = file ? `/public/${file.filename}` : null;

    return this.prisma.makanan.create({
      data: {
        namaMakanan: dto.namaMakanan,
        jenis: dto.jenis,
        gambar: gambarUrl,
        createdBy: userId,
        menuId: dto.menuId ? Number(dto.menuId) : null,
        ...(dto.utamaDariIds?.length && {
          utamaDari: {
            connect: dto.utamaDariIds.map((id) => ({ idMakanan: Number(id) })),
          },
        }),
        ...(dto.tanggalTersedia?.length && {
          tanggalTersedia: {
            create: dto.tanggalTersedia.map((tgl) => ({
              tanggal: new Date(tgl),
            })),
          },
        }),
      },
      include: {
        user: { select: { namaUser: true } },
        utamaDari: true,
        tanggalTersedia: true,
      },
    });
  }


  async findAll() {
    const makanans = await this.prisma.makanan.findMany({
      include: {
        user: { select: { namaUser: true } },
        utamaDari: true, // ambil array makanan utama
        tanggalTersedia: true,
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
        user: { select: { namaUser: true } },
        utamaDari: true,
        tanggalTersedia: true,
      },
    });

    if (!makanan) throw new NotFoundException('Makanan Tidak Ditemukan');

    return {
      ...makanan,
      gambar: makanan.gambar ? `${process.env.APP_URL}${makanan.gambar}` : makanan.gambar,
    };
  }

  async update(
    id: number,
    dto: MakananDto & { utamaDariIds?: number[] },
    file: Express.Multer.File,
    userId: number,
    role: string,
  ) {
    const makanan = await this.prisma.makanan.findUnique({
      where: { idMakanan: id },
      include: { tanggalTersedia: true },
    });
    if (!makanan) throw new NotFoundException('Makanan Tidak Ditemukan');

    if (!(role === 'ADMIN' || userId === makanan.createdBy)) {
      throw new ForbiddenException(
        'Hanya Admin atau pembuat data yang dapat memperbarui',
      );
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
        ...(dto.namaMakanan && { namaMakanan: dto.namaMakanan }),
        ...(dto.jenis && { jenis: dto.jenis }),
        ...(dto.menuId && { menuId: Number(dto.menuId) }),
        ...(dto.utamaDariIds?.length && {
          utamaDari: {
            set: dto.utamaDariIds.map((id) => ({ idMakanan: Number(id) })),
          },
        }),
        ...(gambarUrl && { gambar: gambarUrl }),
        ...(dto.tanggalTersedia?.length && {
          tanggalTersedia: {
            deleteMany: {}, // hapus semua tanggal lama
            create: dto.tanggalTersedia.map((tgl) => ({
              tanggal: new Date(tgl),
            })),
          },
        }),
      },
      include: {
        user: { select: { namaUser: true } },
        utamaDari: true,
        tanggalTersedia: true,
      },
    });
  }


  async remove(id: number, userId: number, role: string) {
    const makanan = await this.prisma.makanan.findUnique({
      where: { idMakanan: id },
    });

    if (!makanan) {
      throw new NotFoundException('Makanan Tidak Ditemukan');
    }

    if (!(role === 'ADMIN' || userId === makanan.createdBy)) {
      throw new ForbiddenException(
        'Hanya Admin atau pembuat data yang dapat menghapus',
      );
    }

    if (makanan.gambar) {
      const filePath = join(process.cwd(), makanan.gambar.replace(/^\//, ''));
      try {
        await unlink(filePath);
      } catch (err) {
        console.warn('Gagal hapus gambar fisik:', err.message);
      }
    }

    return this.prisma.makanan.delete({
      where: { idMakanan: id },
    });
  }
}