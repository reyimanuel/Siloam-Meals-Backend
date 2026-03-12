import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './feedback.dto';
import { Roles } from 'src/auth/roles.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles('DIETISIEN')
  create(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req: any) {
    const pengirimId = req.user.id;
    const pengirimRole = req.user.role;
    return this.feedbackService.create(
      createFeedbackDto,
      pengirimId,
      pengirimRole,
    );
  }

  @Get('pasien/:pasienId')
  @Roles('NURSE', 'DIETISIEN')
  findByPasien(@Param('pasienId') pasienId: string) {
    return this.feedbackService.findByPasien(+pasienId);
  }

  @Patch(':id/resolve')
  @Roles('NURSE')
  resolve(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id; // Mengambil ID perawat yang login
    const userRole = req.user.role; // Mengambil peran perawat yang login
    return this.feedbackService.resolve(+id, userId, userRole); // Mengirim ID dan peran ke service
  }
}
