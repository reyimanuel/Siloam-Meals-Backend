import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  Query,
} from '@nestjs/common';
import { MakananService } from './makanan.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { MakananDto } from './custom.dto';

// @UseGuards(JwtGuard) sudah dihapus karena tidak diperlukan (menggunakan global guard)
@Controller('makanan')
export class MakananController {
  constructor(private readonly makananService: MakananService) {}

  // ENDPOINT BARU: Untuk mengambil jadwal menu bulanan
  @Get('schedule')
  @Roles(Role.ADMIN, Role.KITCHEN)
  findMonthlySchedule(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.makananService.findMonthlySchedule(Number(month), Number(year));
  }

  @Roles(Role.ADMIN, Role.KITCHEN)
  @Post()
  @UseInterceptors(
    FileInterceptor('gambar', {
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() dto: MakananDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.makananService.create(dto, file, userId);
  }

  @Get()
  findAll() {
    return this.makananService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.makananService.findOne(+id);
  }

  @Roles(Role.ADMIN, Role.KITCHEN)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('gambar', {
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: MakananDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.id;
    const role = req.user.role;
    return this.makananService.update(+id, dto, file, userId, role);
  }

  @Roles(Role.ADMIN, Role.KITCHEN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const role = req.user.role;
    return this.makananService.remove(+id, userId, role);
  }
}
