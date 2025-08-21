import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { PrismaService } from 'nestjs-prisma';

@Module({
  controllers: [MenuController],
  providers: [MenuService, PrismaService],
})
export class MenuModule {}
