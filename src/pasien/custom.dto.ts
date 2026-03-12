import { IsArray, IsNumber } from 'class-validator';

export class CustomPasienDto {
  namaPasien: string;
  mr: string;
  ruanganInap: string; // Diubah dari tempatTidur
  diagnosa: string;
  noKtp?: string; // Ditambahkan
  tanggalLahir?: string; // Ditambahkan sebagai string, akan dikonversi di service
  Pantangan?: {
    namaPantangan: string;
    makananId: number;
  }[];
}

// DTO Baru untuk menerima daftar ID makanan yang dikecualikan
export class UpdatePengecualianDto {
  @IsArray()
  @IsNumber({}, { each: true })
  makananIds: number[];
}
