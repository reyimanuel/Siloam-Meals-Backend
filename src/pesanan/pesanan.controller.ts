import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { Public, Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('pesanan')
export class PesananController {
  constructor(private readonly pesananService: PesananService) {}

  // ENDPOINT BARU: Khusus untuk mengambil data pesanan dapur
  @Get('dapur')
  // @Roles('KITCHEN', 'ADMIN') // Sebaiknya endpoint ini dilindungi
  async findForKitchen() {
    return this.pesananService.findForKitchen();
  }

  @Get('riwayat')
  @Roles('KITCHEN', 'ADMIN')
  // 2. Tambahkan parameter Query untuk menerima tanggal
  async findHistory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // 3. Teruskan tanggal ke service
    return this.pesananService.findAll(startDate, endDate);
  }

  // FUNGSI BARU: Endpoint untuk mendapatkan jumlah pesanan per sesi
  @Get('count-by-sesi')
  // @Roles('KITCHEN', 'ADMIN') // Anda bisa menambahkan otorisasi jika perlu
  async getCountBySesi() {
    return this.pesananService.getCountBySesi();
  }

  @Post(':uuid')
  @Public()
  async create(
    @Param('uuid') uuid: string,
    @Body('sesi') sesi: string,
    @Body('details') details: any[],
  ) {
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

  // Endpoint findAll yang lama sekarang secara internal akan digunakan oleh findHistory
  @Get()
  @Public()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.pesananService.findAll(startDate, endDate);
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
