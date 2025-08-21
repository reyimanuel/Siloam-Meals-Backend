import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
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
  async create(@Body() data: any, @Request() req: any) {
    return this.makananService.create(data, req.user.id);
  }

  @Get()
  async findAll() {
    return this.makananService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.makananService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'KITCHEN')
  async update(@Param('id') id: string, @Body() dto: Prisma.MakananUpdateInput, @Request() req: any) {
    return this.makananService.update(+id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @Roles('ADMIN', 'KITCHEN')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.makananService.remove(+id, req.user.id, req.user.role);
  }
}
