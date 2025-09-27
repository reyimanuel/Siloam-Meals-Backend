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
    // Menambahkan pengecekan peran secara manual di dalam service
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

    // Penerima feedback adalah perawat yang membuat data pasien
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

  async resolve(id: number) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { idFeedback: id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback tidak ditemukan');
    }

    return this.prisma.feedback.update({
      where: { idFeedback: id },
      data: { isResolved: true },
    });
  }
}
