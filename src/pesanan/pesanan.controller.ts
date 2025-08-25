import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PesananService } from './pesanan.service';


@Controller('pesanan')
export class PesananController {
  constructor(private readonly pesananService: PesananService) {}

  @Post()
  async create(@Body() body: { pasienId: number; details: any[] }) {
    return this.pesananService.create(body.pasienId, body.details);
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
