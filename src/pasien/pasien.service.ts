import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, Status } from '@prisma/client';

@Injectable()
export class PasienService {
    constructor(private prisma: PrismaService) { }
    
    async create(data: Prisma.PasienCreateInput) {
        return this.prisma.pasien.create({
            data: {
                namaPasien: data.namaPasien,
                tempatTidur: data.tempatTidur,
                diagnosa: data.diagnosa,
                status: 'PENDING',
                Pantangan: data.Pantangan, // langsung oper nested input
            },
            include: {
                Pantangan: true,
            },
        });
    }

    findAll() {
        return this.prisma.pasien.findMany();
    }

    async findOne(id: number) {
        try {
            return await this.prisma.pasien.findUniqueOrThrow({ where: { id } });
        } catch (error) {
            throw new NotFoundException('Pasien Tidak Ditemukan');
        }
    }

    async update(id: number, data: Prisma.PasienUpdateInput, role: string) {
        const pasien = await this.prisma.pasien.findUnique({ where: { id } });
        if (!pasien) throw new NotFoundException('Pasien Tidak Ditemukan');

        // Jika status masih PENDING -> ADMIN & NURSE boleh update
        if (pasien.status === 'PENDING' && !['ADMIN', 'NURSE'].includes(role)) {
            throw new ForbiddenException('Hanya Admin atau Nurse yang dapat memperbarui saat status pasien pending');
        }

        // Jika status sudah ACTIVE -> ADMIN & DIETISIEN boleh update
        if (pasien.status === 'ACTIVE' && !['ADMIN', 'DIETISIEN'].includes(role)) {
            throw new ForbiddenException('Hanya Admin atau Dietisien yang dapat memperbarui saat status pasien aktif');
        }

        return this.prisma.pasien.update({
            where: { id }, data: {
                namaPasien: data.namaPasien,
                tempatTidur: data.tempatTidur,
                diagnosa: data.diagnosa,
                status: 'PENDING',
                Pantangan: data.Pantangan, // langsung oper nested input
            },
            include: {
                Pantangan: true,
            }, });
    }

    async validatePasien(id: number) {
        const pasien = await this.prisma.pasien.findUnique({ where: { id } });
        if (!pasien) throw new NotFoundException('Pasien tidak ditemukan');

        if (pasien.status === 'ACTIVE') {
            throw new BadRequestException('Pasien sudah aktif');
        }

        return this.prisma.pasien.update({
            where: { id },
            data: { status: 'ACTIVE' },
        });
    }

    async remove(id: number, role:string) {
        const pasien = await this.prisma.pasien.findUnique({ where: { id } });
        if (!pasien) throw new NotFoundException('Pasien Tidak Ditemukan');

        // Jika status masih PENDING -> ADMIN & NURSE boleh hapus
        if (pasien.status === 'PENDING' && !['ADMIN', 'NURSE'].includes(role)) {
            throw new ForbiddenException('Hanya Admin atau Nurse yang dapat menghapus data');
        }

        // Jika status sudah ACTIVE -> ADMIN & DIETISIEN boleh hapus
        if (pasien.status === 'ACTIVE' && !['ADMIN', 'DIETISIEN'].includes(role)) {
            throw new ForbiddenException('Hanya Admin atau Dietisien yang dapat menghapus data');
        }

        return this.prisma.pasien.delete({ where: { id } });
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
