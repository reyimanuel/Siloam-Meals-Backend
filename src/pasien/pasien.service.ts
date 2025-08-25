import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, Status } from '@prisma/client';
import * as QRCode from 'qrcode';
import { CustomPasienDto } from './custom.dto';

@Injectable()
export class PasienService {
    constructor(private prisma: PrismaService) { }

    async create(data: CustomPasienDto, userId: number) {
        const link = `${process.env.APP_URL}/pasien/${data.mr}`;

        return this.prisma.pasien.create({
            data: {
                namaPasien: data.namaPasien,
                mr: data.mr,
                tempatTidur: data.tempatTidur,
                diagnosa: data.diagnosa,
                Pantangan: {
                    create: data.Pantangan?.map((p) => ({
                        namaPantangan: p.namaPantangan,
                        makanan: {
                            connect: { idMakanan: p.makananId } 
                        }
                    }))
                },
                status: "PENDING",
                createdBy: userId,
                link: link
            },
            include: {
                user: { select: { namaUser: true } },
                Pantangan: { include: { makanan: true } }
            }
        });
    }

    async generateQr( mr:string ) {
        const pasien = await this.prisma.pasien.findUnique({ where: {mr}});
        if (!pasien) throw new NotFoundException('Pasien Tidak Ditemukan');

        const qrCode = await QRCode.toDataURL(pasien.link);
        return { pasien, qrCode };
    }

    async findAll() {
        return this.prisma.pasien.findMany({
            include: {
                user: { select: { namaUser: true } },
                Pantangan: true,
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
            throw new ForbiddenException('Hanya Admin atau pembuat data yang dapat memperbarui');
        }

        if (pasien.status === 'PENDING') {
            if (!['ADMIN', 'NURSE'].includes(role)) {
                throw new ForbiddenException('Hanya Admin atau Nurse yang dapat menghapus data');
            }
        } else if (pasien.status === 'ACTIVE') {
            if (role !== 'ADMIN') {
                throw new ForbiddenException('Hanya Admin yang dapat menghapus data');
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
