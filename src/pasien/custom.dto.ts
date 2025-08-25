export class CustomPasienDto {
    namaPasien: string;
    mr: string;
    tempatTidur: string;
    diagnosa: string;
    Pantangan?: {
        namaPantangan: string;
        makananId: number;
    }[];
}
