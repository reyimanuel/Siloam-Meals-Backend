import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MakananService } from './makanan.service';
import { Public, Roles } from 'src/auth/roles.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { MakananDto } from './custom.dto';

@Controller('makanan')
export class MakananController {
  constructor(private readonly makananService: MakananService) {}

  @Post()
  @Roles('ADMIN', 'KITCHEN')
  @UseInterceptors( FileInterceptor('gambar', {
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() data: MakananDto, @Request() req: any,) {
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
  @UseInterceptors(
    FileInterceptor('gambar', {
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: MakananDto,
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
