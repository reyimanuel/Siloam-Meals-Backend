import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsInt()
  @IsNotEmpty()
  pasienId: number;

  @IsString()
  @IsNotEmpty()
  pesan: string;
}
