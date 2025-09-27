import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateFeedbackDto } from './feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateFeedbackDto,
    pengirimId: number,
    pengirimRole: string,
  ) {
    if (pengirimRole !== 'DIETISIEN') {
      throw new ForbiddenException(
        'Hanya Dietisien yang dapat mengirim feedback.',
      );
    }

    const pasien = await this.prisma.pasien.findUnique({
      where: { idPasien: dto.pasienId },
    });

    if (!pasien) {
      throw new NotFoundException('Pasien tidak ditemukan');
    }

    const penerimaId = pasien.createdBy;

    return this.prisma.feedback.create({
      data: {
        pesan: dto.pesan,
        pasienId: dto.pasienId,
        pengirimId: pengirimId,
        penerimaId: penerimaId,
      },
    });
  }

  async findByPasien(pasienId: number) {
    return this.prisma.feedback.findMany({
      where: { pasienId: pasienId },
      orderBy: { created_at: 'desc' },
      include: {
        pengirim: { select: { namaUser: true, role: true } },
      },
    });
  }

  async resolve(id: number, userId: number, userRole: string) {
    // Pengecekan peran manual untuk memastikan hanya perawat yang bisa mengakses
    if (userRole !== 'NURSE') {
      throw new ForbiddenException(
        'Hanya perawat yang dapat menyelesaikan feedback.',
      );
    }

    const feedback = await this.prisma.feedback.findUnique({
      where: { idFeedback: id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback tidak ditemukan');
    }

    // Pengecekan tambahan: pastikan perawat yang login adalah penerima feedback
    if (feedback.penerimaId !== userId) {
      throw new ForbiddenException(
        'Anda tidak berhak menyelesaikan feedback ini.',
      );
    }

    return this.prisma.feedback.update({
      where: { idFeedback: id },
      data: { isResolved: true },
    });
  }
}
