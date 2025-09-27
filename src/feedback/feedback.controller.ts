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
    const pengirimRole = req.user.role; // Mengambil peran dari request
    return this.feedbackService.create(
      createFeedbackDto,
      pengirimId,
      pengirimRole,
    ); // Mengirim peran ke service
  }

  @Get('pasien/:pasienId')
  @Roles('NURSE', 'DIETISIEN')
  findByPasien(@Param('pasienId') pasienId: string) {
    return this.feedbackService.findByPasien(+pasienId);
  }

  @Patch(':id/resolve')
  @Roles('NURSE')
  resolve(@Param('id') id: string) {
    return this.feedbackService.resolve(+id);
  }
}
