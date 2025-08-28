import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class UpdateMakananDto {
    @IsOptional()
    @IsString()
    namaMakanan?: string;

    @IsOptional()
    @IsString()
    jenis?: string; // enum: 'UTAMA', 'LAINNYA'

    @IsOptional()
    @IsNumberString()
    menuId?: string; // masih string, nanti di parse ke number

    @IsOptional()
    @IsNumberString()
    punyaUtamaId?: string; // id makanan utama baru
}
