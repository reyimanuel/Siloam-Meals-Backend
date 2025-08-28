import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MakananService } from './makanan.service';
import { Prisma } from '@prisma/client';
import { Public, Roles } from 'src/auth/roles.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateMakananDto } from './custom.dto';

@Controller('makanan')
export class MakananController {
  constructor(private readonly makananService: MakananService) {}

  @Post()
  @Roles('ADMIN', 'KITCHEN')
  @UseInterceptors(
    FileInterceptor('gambar', {
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Request() req: any,) {
    const sampinganIds = body.sampinganIds ? JSON.parse(body.sampinganIds) : [];

    const data: Prisma.MakananUncheckedCreateInput & { sampinganIds?: number[] } =
    {...body, menuId: Number(body.menuId), harga: body.harga ? Number(body.harga) : undefined, sampinganIds,};

    return this.makananService.create(data, file, req.user.id);
  }


  @Public()
  @Get()
  async findAll() {
    return this.makananService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.makananService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'KITCHEN')
  @UseInterceptors(FileInterceptor('gambar')) // field form-data "gambar"
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMakananDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.makananService.update(+id, dto, file, req.user.id, req.user.role);
  }

  @Delete(':id')
  @Roles('ADMIN', 'KITCHEN')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.makananService.remove(+id, req.user.id, req.user.role);
  }
}
