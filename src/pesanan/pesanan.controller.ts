import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';


@Controller('pesanan')
export class PesananController {
  constructor(private readonly pesananService: PesananService) {}

  @Post()
  async create(@Body() dto: Prisma.PesananCreateInput) {
    return this.pesananService.create(dto);
  }

  // @Get()
  // async findAll() {
  //   return this.pesananService.findAll();
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return this.pesananService.findOne(+id);
  // }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updatePesananDto: UpdatePesananDto) {
  //   return this.pesananService.update(+id, updatePesananDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return this.pesananService.remove(+id);
  // }
}
