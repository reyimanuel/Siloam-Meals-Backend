import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { Public } from 'src/auth/roles.decorator'


@Controller('pesanan')
export class PesananController {
  constructor(private readonly pesananService: PesananService) {}

  @Post(':uuid')
  @Public()
  async create(@Param('uuid') uuid: string, @Body('sesi') sesi: string, @Body('details') details: any[],) {
    return this.pesananService.create(uuid, sesi, details);
  }

  @Get('menu/:uuid')
  @Public()
  async findMenu(@Param('uuid') uuid: string) {
    return this.pesananService.findMenu(uuid);
  }

  @Get('makanan/:uuid')
  @Public()
  async findMakanan(@Param('uuid') uuid: string) {
    return this.pesananService.findMakanan(uuid);
  }

  @Get(':uuid')
  @Public()
  async findPesananPasien(@Param('uuid') uuid: string) {
    return this.pesananService.findPesananPasien(uuid);
  }

  @Get()
  @Public()
  async findAll() {
    return this.pesananService.findAll();
  }

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
