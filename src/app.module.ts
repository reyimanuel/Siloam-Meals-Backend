import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PasienModule } from './pasien/pasien.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [AuthModule, PasienModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
