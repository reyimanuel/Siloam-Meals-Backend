import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Role, Status, StatusPesanan } from '@prisma/client';
import * as QRCode from 'qrcode';
import { CustomPasienDto, UpdatePengecualianDto } from './custom.dto';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PasienService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(data: CustomPasienDto, userId: number) {
    // Validasi: semua field wajib diisi kecuali Pantangan
    const { namaPasien, mr, ruanganInap, diagnosa } = data;
    if (
      ![namaPasien, mr, ruanganInap, diagnosa].every(
        (f) =>
          f !== undefined &&
          f !== null &&
          (typeof f === 'string' ? f.trim().length > 0 : true),
      )
    ) {
      throw new BadRequestException(
        'Semua data harus diisi kecuali data pantangan',
      );
    }

    // Cek konflik MR atau No KTP terlebih dahulu
    const existing = await this.prisma.pasien.findFirst({
      where: {
        OR: [{ mr: data.mr }, ...(data.noKtp ? [{ noKtp: data.noKtp }] : [])],
      },
    });
    if (existing) {
      if (existing.mr === data.mr) {
        throw new BadRequestException(
          `MR ${data.mr} sudah digunakan oleh pasien dengan nama ${existing.namaPasien}`,
        );
      }
      if (existing.noKtp === data.noKtp) {
        throw new BadRequestException(
          `No. KTP ${data.noKtp} sudah digunakan oleh pasien dengan nama ${existing.namaPasien}`,
        );
      }
    }

    const uuid = randomUUID();

    try {
      return await this.prisma.pasien.create({
        data: {
          namaPasien: data.namaPasien,
          mr: data.mr,
          ruanganInap: data.ruanganInap,
          diagnosa: data.diagnosa,
          noKtp: data.noKtp,
          tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
          Pantangan: {
            create: data.Pantangan?.map((p) => ({
              namaPantangan: p.namaPantangan,
              makanan: {
                connect: { idMakanan: p.makananId },
              },
            })),
          },
          status: 'PENDING',
          createdBy: userId,
          uuid,
          link: `${process.env.FRONTEND_URL}/pesanan/${uuid}`,
        },
        include: {
          user: { select: { namaUser: true } },
          Pantangan: { include: { makanan: true } },
        },
      });
    } catch (err) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('MR atau No. KTP sudah digunakan');
      }
      throw err;
    }
  }

  async getPasienByLink(uuid: string) {
    try {
      const pasien = await this.prisma.pasien.findUnique({
        where: { uuid },
        include: { Pantangan: { include: { makanan: true } } },
      });

      if (!pasien) {
        throw new NotFoundException(
          `Pasien dengan uuid ${uuid} tidak ditemukan`,
        );
      }

      return pasien;
    } catch (err) {
      throw new UnauthorizedException('error: ' + err.message);
    }
  }

  async generateQr(uuid: string): Promise<{ qrCodeUrl: string }> {
    const pasien = await this.prisma.pasien.findUnique({ where: { uuid } });
    if (!pasien || !pasien.link) {
      throw new NotFoundException(
        `Pasien dengan uuid ${uuid} tidak ditemukan atau tidak memiliki link`,
      );
    }
    const dataUrl = await QRCode.toDataURL(pasien.link);
    return { qrCodeUrl: dataUrl };
  }

  async findAll() {
    return this.prisma.pasien.findMany({
      include: {
        user: { select: { namaUser: true } },
        Pantangan: { include: { makanan: true } },
        PengecualianMakanan: { include: { makanan: true } }, // Sertakan data pengecualian
      },
    });
  }

  async findOne(id: number) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { idPasien: id },
      include: {
        user: { select: { namaUser: true } },
        Pantangan: true,
        PengecualianMakanan: { include: { makanan: true } }, // Sertakan data pengecualian
      },
    });
    if (!pasien) throw new NotFoundException('Pasien Tidak Ditemukan');
    return pasien;
  }

  async update(id: number, dto: CustomPasienDto, role: string, userId: number) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { idPasien: id },
    });
    if (!pasien) throw new NotFoundException('Pasien Tidak Ditemukan');

    // Hanya Admin atau pembuat data yang boleh update
    if (!(role === 'ADMIN' || userId === pasien.createdBy)) {
      throw new ForbiddenException(
        'Hanya Admin atau pembuat data yang dapat mengubah data ini',
      );
    }

    // Jika status masih PENDING atau ACTIVE -> ADMIN & NURSE boleh update
    if (pasien.status === 'PENDING' || pasien.status === 'ACTIVE') {
      if (!['ADMIN', 'NURSE'].includes(role)) {
        throw new ForbiddenException(
          'Hanya Admin atau Nurse yang dapat mengubah data',
        );
      }
    }

    return this.prisma.pasien.update({
      where: { idPasien: id },
      data: {
        namaPasien: dto.namaPasien,
        mr: dto.mr,
        ruanganInap: dto.ruanganInap,
        diagnosa: dto.diagnosa,
        noKtp: dto.noKtp,
        tanggalLahir: dto.tanggalLahir ? new Date(dto.tanggalLahir) : null,
        Pantangan: dto.Pantangan
          ? {
              deleteMany: {},
              create: dto.Pantangan.map((p) => ({
                namaPantangan: p.namaPantangan,
                makanan: { connect: { idMakanan: p.makananId } },
              })),
            }
          : undefined,
      },
      include: {
        Pantangan: { include: { makanan: true } },
      },
    });
  }

  // Fungsi baru untuk dietisien memfilter makanan
  async updatePengecualian(
    pasienId: number,
    makananIds: number[],
    userRole: string,
  ) {
    if (userRole !== Role.DIETISIEN) {
      throw new ForbiddenException(
        'Hanya Dietisien yang dapat mengatur pengecualian makanan.',
      );
    }

    const pasien = await this.prisma.pasien.findUnique({
      where: { idPasien: pasienId },
    });
    if (!pasien) throw new NotFoundException('Pasien tidak ditemukan');

    // Transaksi untuk menghapus pengecualian lama dan membuat yang baru
    await this.prisma.$transaction([
      // 1. Hapus semua pengecualian yang ada untuk pasien ini
      this.prisma.pengecualianMakanan.deleteMany({
        where: { pasienId: pasienId },
      }),
      // 2. Buat pengecualian baru berdasarkan daftar ID yang diberikan
      this.prisma.pengecualianMakanan.createMany({
        data: makananIds.map((makananId) => ({
          pasienId: pasienId,
          makananId: makananId,
        })),
      }),
    ]);

    return { message: 'Daftar pengecualian makanan berhasil diperbarui.' };
  }

  async validatePasien(id: number, userId: number) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { idPasien: id },
    });
    if (!pasien) throw new NotFoundException('Pasien tidak ditemukan');

    if (pasien.validate === true) {
      throw new BadRequestException('Pasien sudah divalidasi');
    }

    return this.prisma.pasien.update({
      where: { idPasien: id },
      data: { validate: true, validatedBy: userId },
    });
  }

  async remove(id: number, role: string, userId: number) {
    const pasien = await this.prisma.pasien.findUnique({
      where: { idPasien: id },
    });
    if (!pasien) throw new NotFoundException('Pasien Tidak Ditemukan');

    if (!(role === 'ADMIN' || userId === pasien.createdBy)) {
      throw new ForbiddenException(
        'Hanya Admin atau pembuat data yang dapat menghapus data ini',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Update semua pesanan yang tertunda (jika ada) menjadi BATAL.
      // Logika ini sekarang aman meskipun pasien belum pernah memesan.
      await tx.pesanan.updateMany({
        where: {
          pasienId: id,
          status: StatusPesanan.PENDING,
        },
        data: {
          namaPasienHistory: pasien.namaPasien,
          status: StatusPesanan.BATAL,
        },
      });

      // 2. Hapus semua data anak yang harus hilang bersama pasien.
      await tx.pantangan.deleteMany({ where: { pasienId: id } });
      await tx.pengecualianMakanan.deleteMany({ where: { pasienId: id } });
      await tx.feedback.deleteMany({ where: { pasienId: id } });

      // 3. Terakhir, hapus data pasien.
      // onDelete: SetNull pada skema akan otomatis mengubah pasienId di Pesanan yang tidak PENDING menjadi null.
      await tx.pasien.delete({ where: { idPasien: id } });
    });

    return {
      message: `Pasien dengan ID ${id} berhasil dihapus. Pesanan yang tertunda (jika ada) telah dibatalkan.`,
    };
  }

  async activatePendingPasien() {
    const now = new Date();
    const threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 jam

    return this.prisma.pasien.updateMany({
      where: {
        status: Status.PENDING,
        created_at: { lt: threshold },
      },
      data: { status: Status.ACTIVE },
    });
  }
}
