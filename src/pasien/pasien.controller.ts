import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PasienService } from './pasien.service';
import { Public, Roles } from '../auth/roles.decorator';
import { CustomPasienDto, UpdatePengecualianDto } from './custom.dto';

@Controller('pasien')
export class PasienController {
  constructor(private readonly pasienService: PasienService) {}

  @Post()
  @Roles('ADMIN', 'NURSE')
  async create(@Body() data: CustomPasienDto, @Request() req: any) {
    return this.pasienService.create(data, req.user.id);
  }

  @Get('count')
  @Roles('ADMIN')
  async getCount() {
    return this.pasienService.count();
  }

  @Get('qr/:uuid')
  @Roles('ADMIN', 'NURSE')
  async generateQr(@Param('uuid') uuid: string) {
    return this.pasienService.generateQr(uuid);
  }

  @Get('link/:uuid')
  @Public()
  async getPasienByLink(@Param('uuid') uuid: string) {
    return this.pasienService.getPasienByLink(uuid);
  }

  @Get()
  async findAll() {
    return this.pasienService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pasienService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'NURSE')
  async update(
    @Param('id') id: string,
    @Body() data: CustomPasienDto,
    @Request() req: any,
  ) {
    return this.pasienService.update(+id, data, req.user.role, req.user.id);
  }

  // Endpoint baru untuk dietisien memfilter makanan
  @Patch(':id/pengecualian')
  @Roles('DIETISIEN')
  async updatePengecualian(
    @Param('id') id: string,
    @Body() data: UpdatePengecualianDto,
    @Request() req: any,
  ) {
    return this.pasienService.updatePengecualian(
      +id,
      data.makananIds,
      req.user.role,
    );
  }

  @Patch('validate/:id')
  @Roles('DIETISIEN') // hanya dietisien yang bisa validasi
  async validatePasien(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.pasienService.validatePasien(+id, userId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'NURSE')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.pasienService.remove(+id, req.user.role, req.user.id);
  }
}
