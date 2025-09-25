import { IsDateString, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString,} from 'class-validator';
import { Transform } from 'class-transformer';
import { Jenis } from '@prisma/client';

export class MakananDto {
    @IsString()
    @IsNotEmpty()
    namaMakanan: string;

    @IsEnum(Jenis)
    jenis: Jenis;

    @IsArray()
    @IsDateString({}, { each: true })
    tanggalTersedia: string[];

    @IsOptional()
    @Transform(({ value }) => value ? Number(value) : null)
    @IsNumber()
    menuId?: number;

    // Properti untuk menangkap ID side dish
    @IsOptional()
    @IsArray()
    @Transform(({ value }) => {
        if (!value) return [];
        // Mengubah dari string tunggal atau array string menjadi array angka
        return Array.isArray(value) ? value.map(Number) : [Number(value)];
    })
    @IsNumber({}, { each: true })
    utamaDariIds?: number[];
}