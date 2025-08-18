import { Module } from '@nestjs/common';
import { PasienService } from './pasien.service';
import { PasienController } from './pasien.controller';
import { PrismaService } from 'nestjs-prisma'
import { PasienScheduler } from './pasien.scheduler';

@Module({
    controllers: [PasienController],
    providers: [PasienService, PrismaService, PasienScheduler],
})
export class PasienModule { }
