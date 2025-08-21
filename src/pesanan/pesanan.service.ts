import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PesananService {
  constructor(private prisma: PrismaService) { }  

  async create(dto: Prisma.CreatePesananInput) {
    return 'This action adds a new pesanan';
  }

  // findAll() {
  //   return `This action returns all pesanan`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} pesanan`;
  // }

  // update(id: number, updatePesananDto: UpdatePesananDto) {
  //   return `This action updates a #${id} pesanan`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} pesanan`;
  // }
}
