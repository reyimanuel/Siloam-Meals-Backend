import { Module } from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { PesananController } from './pesanan.controller';
import { PrismaService } from 'nestjs-prisma';

@Module({
  controllers: [PesananController],
  providers: [PesananService, PrismaService],
})
export class PesananModule {}
