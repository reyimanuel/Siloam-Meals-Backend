import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { PasienService } from './pasien.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('pasien')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PasienController {
    constructor(private readonly pasienService: PasienService) { }

    @Post()
    @Roles('ADMIN', 'NURSE')
    create(@Body() data: any) {
        return this.pasienService.create(data);
    }

    @Get()
    @Roles('ADMIN', 'NURSE')
    findAll() {
        return this.pasienService.findAll();
    }

    @Get(':id')
    @Roles('ADMIN', 'NURSE')
    findOne(@Param('id') id: string) {
        return this.pasienService.findOne(+id);
    }

    @Put(':id')
    @Roles('ADMIN', 'NURSE', 'DIETISIEN')
    update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
        return this.pasienService.update(+id, data, req.user.role);
    }

    @Roles('DIETISIEN') // hanya dietisien yang bisa validasi
    validatePasien(@Param('id') id: string) {
        return this.pasienService.validatePasien(+id);
    }

    @Delete(':id')
    @Roles('ADMIN', 'NURSE', 'DIETISIEN')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.pasienService.remove(+id, req.user.role);
    }
}
