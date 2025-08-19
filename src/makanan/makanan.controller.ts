import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MakananService } from './makanan.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('makanan')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MakananController {
  constructor(private readonly makananService: MakananService) {}

  @Post()
  @Roles('ADMIN', 'KITCHEN')
  create(@Body() dto: Prisma.MakananCreateInput) {
    return this.makananService.create(dto);
  }

  @Get()
  findAll() {
    return this.makananService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.makananService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'KITCHEN')
  update(@Param('id') id: string, @Body() dto: Prisma.MakananUpdateInput) {
    return this.makananService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'KITCHEN')
  remove(@Param('id') id: string) {
    return this.makananService.remove(+id);
  }
}
