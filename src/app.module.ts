import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PasienModule } from './pasien/pasien.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MakananModule } from './makanan/makanan.module';
import { MenuModule } from './menu/menu.module';
import { PesananModule } from './pesanan/pesanan.module';

@Module({
  imports: [
    AuthModule,
    PasienModule,
    ScheduleModule.forRoot(),
    MakananModule,
    MenuModule,
    PesananModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
 