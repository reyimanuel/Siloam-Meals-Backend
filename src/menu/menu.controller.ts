import { Controller, Get, Post, Body, Patch, Param, Delete, Request} from '@nestjs/common';
import { MenuService } from './menu.service';
import { Prisma } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Roles('ADMIN', 'KITCHEN')
  create(@Body() data: any, @Request() req: any) {
    return this.menuService.create(data, req.user.id);
  }

  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'KITCHEN')
  update(@Param('id') id: string, @Body() data: Prisma.MenuUpdateInput, @Request() req: any) {
    return this.menuService.update(+id, data, req.user.id, req.user.role);
  }

  @Delete(':id')
  @Roles('ADMIN', 'KITCHEN')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.menuService.remove(+id, req.user.id, req.user.role);
  }
}
