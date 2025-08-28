import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Status } from '@prisma/client';
import * as QRCode from 'qrcode';
import { CustomPasienDto } from './custom.dto';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PasienService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) { }

    async create(data: CustomPasienDto, userId: number) {
        // Validasi: semua field wajib diisi kecuali Pantangan
        const { namaPasien, mr, tempatTidur, diagnosa } = data;
        if (![namaPasien, mr, tempatTidur, diagnosa].every((f) =>
            f !== undefined && f !== null && (typeof f === 'string' ? f.trim().length > 0 : true)
        )) {
            throw new BadRequestException('Semua data harus diisi kecuali data pantangan');
        }

        // Cek konflik MR terlebih dahulu
        const existing = await this.prisma.pasien.findFirst({ where: { mr: data.mr } });
        if (existing) {
            throw new BadRequestException(`MR ${data.mr} sudah digunakan oleh pasien dengan nama ${existing.namaPasien}`);
        }

        const uuid = randomUUID();

        try {
            return await this.prisma.pasien.create({
                data: {
                    namaPasien: data.namaPasien,
                    mr: data.mr,
                    tempatTidur: data.tempatTidur,
                    diagnosa: data.diagnosa,
                    Pantangan: {
                        create: data.Pantangan?.map((p) => ({
                            namaPantangan: p.namaPantangan,
                            makanan: {
                                connect: { idMakanan: p.makananId },
                            },
                        })),
                    },
                    status: "PENDING",
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
            // Tangani potensi error unique constraint dari Prisma (race condition)
            if ((err)?.code === 'P2002') {
                throw new BadRequestException('MR sudah digunakan');
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
                throw new NotFoundException(`Pasien dengan uuid ${uuid} tidak ditemukan`);
            }

            return pasien;
        } catch (err) {
            throw new UnauthorizedException('error: ' + err.message);
        }
    }

    async generateQr(uuid: string): Promise<{ qrCodeUrl: string }> {
        const url = `${process.env.FRONTEND_URL}/pesanan/${uuid}`;
        const dataUrl = await QRCode.toDataURL(url);
        return { qrCodeUrl: dataUrl };
    }

    async findAll() {
        return this.prisma.pasien.findMany({
            include: {
                user: { select: { namaUser: true } },
                Pantangan: { include: { makanan: true } },
            },
        });
    }

    async findOne(id: number) {
        const pasien = await this.prisma.pasien.findUnique({
            where: { idPasien: id },
            include: {
                user: { select: { namaUser: true } },
                Pantangan: true,
            },
        });
        if (!pasien) throw new NotFoundException('Pasien Tidak Ditemukan');
        return pasien;
    }

    async update(id: number, dto: CustomPasienDto, role: string, userId: number) {
        const pasien = await this.prisma.pasien.findUnique({ where: { idPasien : id } });
        if (!pasien) throw new NotFoundException('Pasien Tidak Ditemukan');

        // Hanya Admin atau pembuat data yang boleh update
        if (!(role === 'ADMIN' || userId === pasien.createdBy)) {
            throw new ForbiddenException('Hanya Admin atau pembuat data yang dapat menghapus');
        }

        // Jika status masih PENDING -> ADMIN & NURSE boleh update
        if (pasien.status === 'PENDING') {
            if (!['ADMIN', 'NURSE'].includes(role)) {
                throw new ForbiddenException('Hanya Admin atau Nurse yang dapat mengubah data');
            }
        } else if (pasien.status === 'ACTIVE') {
            if (role !== 'ADMIN') {
                throw new ForbiddenException('Hanya Admin yang dapat mengubah data');
            }
        }
        return this.prisma.pasien.update({
            where: { idPasien: id },
            data: {
                namaPasien: dto.namaPasien,
                mr: dto.mr,
                tempatTidur: dto.tempatTidur,
                diagnosa: dto.diagnosa,
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

    async validatePasien(id: number, userId: number) {
        const pasien = await this.prisma.pasien.findUnique({ where: { idPasien: id } });
        if (!pasien) throw new NotFoundException('Pasien tidak ditemukan');

        if (pasien.status === 'ACTIVE') {
            throw new BadRequestException('Pasien sudah aktif');
        }

        return this.prisma.pasien.update({
            where: { idPasien: id },
            data: { status: 'ACTIVE', validatedBy: userId },
        });
    }

    async remove(id: number, role: string, userId: number) {
        const pasien = await this.prisma.pasien.findUnique({ where: { idPasien: id } });
        if (!pasien) throw new NotFoundException('Pasien Tidak Ditemukan');

        if (!(role === 'ADMIN' || userId === pasien.createdBy)) {
            throw new ForbiddenException('Hanya Admin atau pembuat data yang dapat menghapus data ini');
        }

        if (pasien.status === 'PENDING') {
            if (!['ADMIN', 'NURSE'].includes(role)) {
                throw new ForbiddenException('Hanya Admin atau Nurse yang dapat menghapus data ini');
            }
        } else if (pasien.status === 'ACTIVE') {
            if (role !== 'ADMIN') {
                throw new ForbiddenException('Status pasien sudah aktif, hanya Admin yang dapat menghapus data ini');
            }
        }

        // Menghapus data pasien
        await this.prisma.$transaction([
            this.prisma.pantangan.deleteMany({ where: { pasienId: id } }),
            this.prisma.pasien.delete({ where: { idPasien: id } }),
        ]);
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
