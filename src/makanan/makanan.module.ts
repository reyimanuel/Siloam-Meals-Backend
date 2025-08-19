import { Module } from '@nestjs/common';
import { MakananService } from './makanan.service';
import { MakananController } from './makanan.controller';
import { PrismaService } from 'nestjs-prisma';

@Module({
  controllers: [MakananController],
  providers: [MakananService, PrismaService,],
})
export class MakananModule {}
