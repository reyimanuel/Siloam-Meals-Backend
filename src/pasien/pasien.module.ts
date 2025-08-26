import { Module } from '@nestjs/common';
import { PasienService } from './pasien.service';
import { PasienController } from './pasien.controller';
import { PrismaService } from 'nestjs-prisma'
import { PasienScheduler } from './pasien.scheduler';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'supersecret',
        }),
    ],
    controllers: [PasienController],
    providers: [PasienService, PrismaService, PasienScheduler],
})
export class PasienModule { }
