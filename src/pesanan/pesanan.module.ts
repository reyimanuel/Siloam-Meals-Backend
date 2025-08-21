import { Module } from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { PesananController } from './pesanan.controller';

@Module({
  controllers: [PesananController],
  providers: [PesananService],
})
export class PesananModule {}
