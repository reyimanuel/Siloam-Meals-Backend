import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, Status } from '@prisma/client';

@Injectable()
export class PasienService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.PasienUncheckedCreateInput, userId: number) {
        return this.prisma.pasien.create({
            data: {
                ...data,
                status: Status.PENDING,
                createdBy: userId,
            },
            include: {
                user: { select: { nama: true } },
                Pantangan: true,
            },
        });
    }

    async findAll() {
        return this.prisma.pasien.findMany({
            include: {
                user: { select: { nama: true } },
                Pantangan: true,
            },
        });
    }

    async findOne(id: number) {
        const pasien = await this.prisma.pasien.findUnique({
            where: { id },
            include: {
                user: { select: { nama: true } },
                Pantangan: true,
            },
        });
        if (!pasien) throw new NotFoundException('Pasien Tidak Ditemukan');
        return pasien;
    }

    async update(id: number, dto: Prisma.PasienUpdateInput, role: string, userId: number) {
        const pasien = await this.prisma.pasien.findUnique({ where: { id } });
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
            where: { id }, data: {
                ...dto
            },
            include: {
                Pantangan: true,
            },
        });
    }

    async validatePasien(id: number, userId: number) {
        const pasien = await this.prisma.pasien.findUnique({ where: { id } });
        if (!pasien) throw new NotFoundException('Pasien tidak ditemukan');

        if (pasien.status === 'ACTIVE') {
            throw new BadRequestException('Pasien sudah aktif');
        }

        return this.prisma.pasien.update({
            where: { id },
            data: { status: 'ACTIVE', validatedBy: userId },
        });
    }

    async remove(id: number, role: string, userId: number) {
        const pasien = await this.prisma.pasien.findUnique({ where: { id } });
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
            this.prisma.pasien.delete({ where: { id } }),
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
