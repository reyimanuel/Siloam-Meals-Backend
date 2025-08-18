import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PasienService } from './pasien.service';

@Injectable()
export class PasienScheduler {
    constructor(private pasienService: PasienService) { }

    // jalan tiap 1 jam sekali
    @Cron('0 * * * *')
    async handleCron() {
        await this.pasienService.activatePendingPasien();
        console.log('Checked and updated pending pasien -> active');
    }
}
