import * as Yup from "yup";

const officialSchema = Yup.object().shape({
    id: Yup.number().nullable(),
    nik: Yup.string()
        .length(16, "NIK harus 16 digit")
        .required("NIK wajib diisi"),
    nama_lengkap: Yup.string().required("Nama lengkap wajib diisi"),
    gelar_depan: Yup.string().nullable(),
    gelar_belakang: Yup.string().nullable(),
    tempat_lahir: Yup.string().required("Tempat lahir wajib diisi"),
    tanggal_lahir: Yup.date().required("Tanggal lahir wajib diisi"),
    jenis_kelamin: Yup.mixed().oneOf(["L", "P"], "Jenis kelamin tidak valid").required("Jenis kelamin wajib diisi"),
    status_perkawinan: Yup.mixed()
        .oneOf(["Belum Menikah", "Menikah", "Cerai", "Duda", "Janda"], "Status perkawinan tidak valid")
        .default("Menikah"),
    agama: Yup.mixed()
        .oneOf(["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"], "Agama tidak valid")
        .nullable(),
    alamat: Yup.string().required("Alamat wajib diisi"),
    rt: Yup.number().nullable(),
    rw: Yup.number().nullable(),
    regency_name: Yup.string().required("Kabupaten/Kota wajib diisi"),
    district_name: Yup.string().required("Kecamatan wajib diisi"),
    village_name: Yup.string().required("Kelurahan/Desa wajib diisi"),
    handphone: Yup.string().required("Nomor HP wajib diisi"),
    gol_darah: Yup.mixed().oneOf(["A", "B", "AB", "O"], "Golongan darah tidak valid").nullable(),
    pendidikan: Yup.mixed()
        .oneOf(["SD/MI", "SMP/MTS", "SMA/SMK/MA", "D1", "D2", "D3", "D4", "S1", "S2", "S3"], "Pendidikan tidak valid")
        .required("Pendidikan wajib diisi"),
    bpjs_kesehatan: Yup.string().length(20, "BPJS Kesehatan harus 20 digit").required("BPJS Kesehatan wajib diisi"),
    bpjs_ketenagakerjaan: Yup.string().length(20, "BPJS Ketenagakerjaan harus 20 digit").required("BPJS Ketenagakerjaan wajib diisi"),
    npwp: Yup.string().length(20, "NPWP harus 20 digit").required("NPWP wajib diisi"),
    status: Yup.mixed().oneOf(["daftar", "proses", "validasi", "tolak"], "Status tidak valid").default("daftar"),
});

export default class OfficialModel {
    constructor(data) {
        this.id = data.id || null;
        this.nik = data.nik || "";
        this.nama_lengkap = data.nama_lengkap || "";
        this.gelar_depan = data.gelar_depan || null;
        this.gelar_belakang = data.gelar_belakang || null;
        this.tempat_lahir = data.tempat_lahir || "";
        this.tanggal_lahir = data.tanggal_lahir || "";
        this.jenis_kelamin = data.jenis_kelamin || "L";
        this.status_perkawinan = data.status_perkawinan || "Menikah";
        this.agama = data.agama || null;
        this.alamat = data.alamat || "";
        this.rt = data.rt || null;
        this.rw = data.rw || null;
        this.regency_name = data.regency_name || "";
        this.district_name = data.district_name || "";
        this.village_name = data.village_name || "";
        this.handphone = data.handphone || "";
        this.gol_darah = data.gol_darah || null;
        this.pendidikan = data.pendidikan || "SD/MI";
        this.bpjs_kesehatan = data.bpjs_kesehatan || "";
        this.bpjs_ketenagakerjaan = data.bpjs_ketenagakerjaan || "";
        this.npwp = data.npwp || "";
        this.status = data.status || "daftar";
    }

    static validate(data) {
        return officialSchema.validate(data, { abortEarly: false });
    }
}
