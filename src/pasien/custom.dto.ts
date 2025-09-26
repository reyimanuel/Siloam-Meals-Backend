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
