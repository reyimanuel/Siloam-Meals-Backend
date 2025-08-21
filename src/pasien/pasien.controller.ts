import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Request } from '@nestjs/common';
import { PasienService } from './pasien.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';

@Controller('pasien')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PasienController {
    constructor(private readonly pasienService: PasienService) { }

    @Post()
    @Roles('ADMIN', 'NURSE')
    async create(@Body() data: any, @Request() req: any) {
        return this.pasienService.create(data, req.user.id);
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
    async update(@Param('id') id: string, @Body() dto: Prisma.PasienUpdateInput, @Request() req: any) {
        return this.pasienService.update(+id, dto, req.user.role, req.user.id);
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
