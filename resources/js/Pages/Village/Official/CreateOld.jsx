import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { HiUsers, HiPlus, HiTrash, HiSave } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Ambil token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function CreateOfficial({ positions }) {
    // State untuk data utama
    const [official, setOfficial] = useState({
        village_id: "",
        nik: "",
        niad: "",
        nama_lengkap: "",
        gelar_depan: "",
        gelar_belakang: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        jenis_kelamin: "",
        status_perkawinan: "Menikah",
        agama: "",
        alamat: "",
        rt: "",
        rw: "",
        province_code: "",
        province_name: "",
        regency_code: "",
        regency_name: "",
        district_code: "",
        district_name: "",
        village_code: "",
        village_name: "",
        handphone: "",
        gol_darah: "",
        pendidikan: "",
        bpjs_kesehatan: "",
        bpjs_ketenagakerjaan: "",
        npwp: "",
    });

    // State untuk data studies (dinamis)
    const [studies, setStudies] = useState([
        {
            jenjang: "",
            nama_sekolah: "",
            alamat_sekolah: "",
            jurusan: "",
            masuk: "",
            keluar: "",
            doc_scan: null, // File upload
        },
    ]);

    // State untuk data positions (dinamis)
    const [officialPositions, setOfficialPositions] = useState([
        {
            position_id: "",
            penetap: "",
            nomor_sk: "",
            tanggal_sk: "",
            foto: null, // File upload
            mulai: "",
            selesai: "",
            keterangan: "",
        },
    ]);

    // State untuk data wilayah
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    // Ambil data provinsi
    useEffect(() => {
        axios.get("/village/bps/wilayah")
            .then((response) => setProvinces(response.data))
            .catch((error) => console.error("Error fetching provinces:", error));
    }, []);

    // Handle perubahan provinsi
    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        const selectedProvince = provinces.find(province => province.kode_bps === e.target.value);
        setOfficial({
            ...official,
            province_code: selectedProvince.kode_bps,
            province_name: selectedProvince.nama_bps,
            regency_code: "",
            regency_name: "",
            district_code: "",
            district_name: "",
            village_code: "",
            village_name: "",
        });
        axios.get(`/village/bps/wilayah/kabupaten/${provinceCode}`)
            .then((response) => setRegencies(response.data))
            .catch((error) => console.error("Error fetching regencies:", error));
    };

    // Handle perubahan kabupaten
    const handleRegencyChange = (e) => {
        const regencyCode = e.target.value;
        const selectedRegency = regencies.find(regency => regency.kode_bps === e.target.value);
        setOfficial({
            ...official,
            regency_code: selectedRegency.kode_bps,
            regency_name: selectedRegency.nama_bps,
            district_code: "",
            district_name: "",
            village_code: "",
            village_name: "",
        });
        axios.get(`/village/bps/wilayah/kecamatan/${regencyCode}`)
            .then((response) => setDistricts(response.data))
            .catch((error) => console.error("Error fetching districts:", error));
    };

    // Handle perubahan kecamatan
    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        const selectedDistrict = districts.find(district => district.kode_bps === e.target.value);
        setOfficial({
            ...official,
            district_code: selectedDistrict.kode_bps,
            district_name: selectedDistrict.nama_bps,
            village_code: "",
            village_name: "",
        });
        axios.get(`/village/bps/wilayah/desa/${districtCode}`)
            .then((response) => setVillages(response.data))
            .catch((error) => console.error("Error fetching villages:", error));
    };

    const handleVillageChange = (e) => {
        const selectedVillage = villages.find(village => village.kode_bps === e.target.value);
        setOfficial({
            ...official,
            village_code: selectedVillage.kode_bps,
            village_name: selectedVillage.nama_bps,
        });
    };

    // Tambah baris studies
    const addStudy = () => {
        setStudies([
            ...studies,
            {
                jenjang: "",
                nama_sekolah: "",
                alamat_sekolah: "",
                jurusan: "",
                masuk: "",
                keluar: "",
                doc_scan: null,
            },
        ]);
    };

    // Hapus baris studies
    const removeStudy = (index) => {
        const newStudies = studies.filter((_, i) => i !== index);
        setStudies(newStudies);
    };

    // Tambah baris positions
    const addPosition = () => {
        setOfficialPositions([
            ...officialPositions,
            {
                position_id: "",
                penetap: "",
                nomor_sk: "",
                tanggal_sk: "",
                foto: null,
                mulai: "",
                selesai: "",
                keterangan: "",
            },
        ]);
    };

    // Hapus baris positions
    const removePosition = (index) => {
        const newPositions = officialPositions.filter((_, i) => i !== index);
        setOfficialPositions(newPositions);
    };

    // Handle submit form
    const handleSubmit = (e) => {
        e.preventDefault();

        // Buat FormData untuk mengirim file
        const formData = new FormData();

        // Tambahkan data utama
        for (const key in official) {
            formData.append(`official[${key}]`, official[key]);
        }

        // Tambahkan data studies
        studies.forEach((study, index) => {
            for (const key in study) {
                if (key === "doc_scan" && study[key] instanceof File) {
                    formData.append(`studies[${index}][${key}]`, study[key]);
                } else {
                    formData.append(`studies[${index}][${key}]`, study[key]);
                }
            }
        });

        // Tambahkan data positions
        officialPositions.forEach((position, index) => {
            for (const key in position) {
                if (key === "foto" && position[key] instanceof File) {
                    formData.append(`positions[${index}][${key}]`, position[key]);
                } else {
                    formData.append(`positions[${index}][${key}]`, position[key]);
                }
            }
        });

        // Kirim data ke backend
        router.post("/village/official/store", formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Penting untuk upload file
            },
            onSuccess: () => {
                Swal.fire("Success", "Data berhasil disimpan.", "success");
                // Reset form setelah berhasil
                setOfficial({
                    village_id: "",
                    nik: "",
                    niad: "",
                    nama_lengkap: "",
                    gelar_depan: "",
                    gelar_belakang: "",
                    tempat_lahir: "",
                    tanggal_lahir: "",
                    jenis_kelamin: "",
                    status_perkawinan: "Menikah",
                    agama: "",
                    alamat: "",
                    rt: "",
                    rw: "",
                    province_code: "",
                    province_name: "",
                    regency_code: "",
                    regency_name: "",
                    district_code: "",
                    district_name: "",
                    village_code: "",
                    village_name: "",
                    handphone: "",
                    gol_darah: "",
                    pendidikan: "",
                    bpjs_kesehatan: "",
                    bpjs_ketenagakerjaan: "",
                    npwp: "",
                });
                setStudies([
                    {
                        jenjang: "",
                        nama_sekolah: "",
                        alamat_sekolah: "",
                        jurusan: "",
                        masuk: "",
                        keluar: "",
                        doc_scan: null,
                    },
                ]);
                setOfficialPositions([
                    {
                        position_id: "",
                        penetap: "",
                        nomor_sk: "",
                        tanggal_sk: "",
                        foto: null,
                        mulai: "",
                        selesai: "",
                        keterangan: "",
                    },
                ]);
            },
            onError: (errors) => {
                Swal.fire("Error", Object.values(errors).join(", "), "error");
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Tambah Official
                    <p className="text-sm font-thin mt-1">Formulir Penambahan Data Official</p>
                </div>
            }
            breadcrumb={[{ name: "Tambah Official", path: "/village/official/create", active: true, icon: <HiUsers className="w-5 h-5 mr-3" /> }]}
        >
            <Head title="Tambah Official" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form Data Utama */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {/* Field Nama Lengkap */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input
                                type="text"
                                value={official.nama_lengkap}
                                onChange={(e) => setOfficial({ ...official, nama_lengkap: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>

                        {/* Field NIK */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">NIK</label>
                            <input
                                type="number"
                                value={official.nik}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (/^\d*$/.test(inputValue) && inputValue.length <= 16) {
                                        setOfficial({ ...official, nik: inputValue });
                                    }
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                            {official.nik.length < 16 && (
                                <p className="text-sm text-red-500">NIK harus terdiri dari 16 angka.</p>
                            )}
                        </div>

                        {/* Field NIAD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">NIAD</label>
                            <input
                                type="number"
                                value={official.niad}
                                onChange={(e) => setOfficial({ ...official, niad: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>

                        {/* Field Tempat Lahir */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                            <input
                                type="text"
                                value={official.tempat_lahir}
                                onChange={(e) => setOfficial({ ...official, tempat_lahir: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>

                        {/* Field Tanggal Lahir */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                            <input
                                type="date"
                                value={official.tanggal_lahir}
                                onChange={(e) => setOfficial({ ...official, tanggal_lahir: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>

                        {/* Field Jenis Kelamin */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                            <select
                                value={official.jenis_kelamin}
                                onChange={(e) => setOfficial({ ...official, jenis_kelamin: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>

                        {/* Field Status Perkawinan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status Perkawinan</label>
                            <select
                                value={official.status_perkawinan}
                                onChange={(e) => setOfficial({ ...official, status_perkawinan: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="Belum Menikah">Belum Menikah</option>
                                <option value="Menikah">Menikah</option>
                                <option value="Cerai">Cerai</option>
                                <option value="Duda">Duda</option>
                                <option value="Janda">Janda</option>
                            </select>
                        </div>

                        {/* Field Agama */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Agama</label>
                            <select
                                value={official.agama}
                                onChange={(e) => setOfficial({ ...official, agama: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="">Pilih Agama</option>
                                <option value="Islam">Islam</option>
                                <option value="Kristen">Kristen</option>
                                <option value="Katolik">Katolik</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Buddha">Buddha</option>
                                <option value="Konghucu">Konghucu</option>
                            </select>
                        </div>

                        {/* Field Alamat */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Alamat</label>
                            <textarea
                                value={official.alamat}
                                onChange={(e) => setOfficial({ ...official, alamat: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>

                        {/* Field RT */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">RT</label>
                            <input
                                type="number"
                                value={official.rt}
                                onChange={(e) => setOfficial({ ...official, rt: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>

                        {/* Field RW */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">RW</label>
                            <input
                                type="number"
                                value={official.rw}
                                onChange={(e) => setOfficial({ ...official, rw: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>

                        {/* Field Provinsi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                            <select
                                onChange={handleProvinceChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="">Pilih Provinsi</option>
                                {provinces.map((province) => (
                                    <option key={province.kode_bps} value={province.kode_bps}>
                                        {province.nama_bps}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Field Kabupaten */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kabupaten</label>
                            <select
                                onChange={handleRegencyChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="">Pilih Kabupaten</option>
                                {regencies.map((regency) => (
                                    <option key={regency.kode_bps} value={regency.kode_bps}>
                                        {regency.nama_bps}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Field Kecamatan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                            <select
                                onChange={handleDistrictChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="">Pilih Kecamatan</option>
                                {districts.map((district) => (
                                    <option key={district.kode_bps} value={district.kode_bps}>
                                        {district.nama_bps}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Field Desa */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Desa</label>
                            <select
                                value={official.village_code}
                                onChange={handleVillageChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="">Pilih Desa</option>
                                {villages.map((village) => (
                                    <option key={village.kode_bps} value={village.kode_bps}>
                                        {village.nama_bps}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Field Handphone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Handphone</label>
                            <input
                                type="number"
                                value={official.handphone}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (/^\d*$/.test(inputValue)) {
                                        if (inputValue.length <= 13) {
                                            setOfficial({ ...official, handphone: inputValue });
                                        }
                                    }
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                            {official.handphone.length < 11 && (
                                <p className="text-sm text-red-500">Nomor handphone harus terdiri dari minimal 11 digit.</p>
                            )}
                            {official.handphone.length > 13 && (
                                <p className="text-sm text-red-500">Nomor handphone tidak boleh lebih dari 13 digit.</p>
                            )}
                        </div>

                        {/* Field Golongan Darah */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Golongan Darah</label>
                            <select
                                value={official.gol_darah}
                                onChange={(e) => setOfficial({ ...official, gol_darah: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            >
                                <option value="">Pilih Golongan Darah</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="AB">AB</option>
                                <option value="O">O</option>
                            </select>
                        </div>

                        {/* Field Pendidikan Terakhir */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                            <select
                                value={official.pendidikan}
                                onChange={(e) => setOfficial({ ...official, pendidikan: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            >
                                <option value="">Pilih Pendidikan</option>
                                <option value="SD/MI">SD/MI</option>
                                <option value="SMP/MTS">SMP/MTS</option>
                                <option value="SMA/SMK/MA">SMA/SMK/MA</option>
                                <option value="D1">D1</option>
                                <option value="D2">D2</option>
                                <option value="D3">D3</option>
                                <option value="D4">D4</option>
                                <option value="S1">S1</option>
                                <option value="S2">S2</option>
                                <option value="S3">S3</option>
                            </select>
                        </div>

                        {/* Field BPJS Kesehatan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">BPJS Kesehatan</label>
                            <input
                                type="text"
                                value={official.bpjs_kesehatan}
                                onChange={(e) => setOfficial({ ...official, bpjs_kesehatan: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>

                        {/* Field BPJS Ketenagakerjaan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">BPJS Ketenagakerjaan</label>
                            <input
                                type="text"
                                value={official.bpjs_ketenagakerjaan}
                                onChange={(e) => setOfficial({ ...official, bpjs_ketenagakerjaan: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>

                        {/* Field NPWP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">NPWP</label>
                            <input
                                type="text"
                                value={official.npwp}
                                onChange={(e) => setOfficial({ ...official, npwp: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                    </motion.div>

                    {/* Form Data Studies */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8"
                    >
                        <h3 className="text-lg font-semibold mb-4">Riwayat Pendidikan</h3>
                        <AnimatePresence>
                            {studies.map((study, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Jenjang</label>
                                        <select
                                            value={study.jenjang}
                                            onChange={(e) => {
                                                const newStudies = [...studies];
                                                newStudies[index].jenjang = e.target.value;
                                                setStudies(newStudies);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        >
                                            <option value="">Pilih Jenjang</option>
                                            <option value="SD/MI">SD/MI</option>
                                            <option value="SMP/MTS">SMP/MTS</option>
                                            <option value="SMA/SMK/MA">SMA/SMK/MA</option>
                                            <option value="D1">D1</option>
                                            <option value="D2">D2</option>
                                            <option value="D3">D3</option>
                                            <option value="D4">D4</option>
                                            <option value="S1">S1</option>
                                            <option value="S2">S2</option>
                                            <option value="S3">S3</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nama Sekolah</label>
                                        <input
                                            type="text"
                                            value={study.nama_sekolah}
                                            onChange={(e) => {
                                                const newStudies = [...studies];
                                                newStudies[index].nama_sekolah = e.target.value;
                                                setStudies(newStudies);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Alamat Sekolah</label>
                                        <input
                                            type="text"
                                            value={study.alamat_sekolah}
                                            onChange={(e) => {
                                                const newStudies = [...studies];
                                                newStudies[index].alamat_sekolah = e.target.value;
                                                setStudies(newStudies);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Jurusan</label>
                                        <input
                                            type="text"
                                            value={study.jurusan}
                                            onChange={(e) => {
                                                const newStudies = [...studies];
                                                newStudies[index].jurusan = e.target.value;
                                                setStudies(newStudies);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tahun Masuk</label>
                                        <input
                                            type="number"
                                            value={study.masuk}
                                            onChange={(e) => {
                                                const newStudies = [...studies];
                                                newStudies[index].masuk = e.target.value;
                                                setStudies(newStudies);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tahun Keluar</label>
                                        <input
                                            type="number"
                                            value={study.keluar}
                                            onChange={(e) => {
                                                const newStudies = [...studies];
                                                newStudies[index].keluar = e.target.value;
                                                setStudies(newStudies);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Dokumen Scan</label>
                                        <input
                                            type="file"
                                            onChange={(e) => {
                                                const newStudies = [...studies];
                                                newStudies[index].doc_scan = e.target.files[0];
                                                setStudies(newStudies);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <motion.button
                                            type="button"
                                            onClick={() => removeStudy(index)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                                        >
                                            <HiTrash className="mr-2" /> Hapus
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <motion.button
                            type="button"
                            onClick={addStudy}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                        >
                            <HiPlus className="mr-2" /> Tambah Riwayat Pendidikan
                        </motion.button>
                    </motion.div>

                    {/* Form Data Positions */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8"
                    >
                        <h3 className="text-lg font-semibold mb-4">Riwayat Jabatan</h3>
                        <AnimatePresence>
                            {officialPositions.map((position, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Posisi</label>
                                        <select
                                            value={position.position_id}
                                            onChange={(e) => {
                                                const newPositions = [...officialPositions];
                                                newPositions[index].position_id = e.target.value;
                                                setOfficialPositions(newPositions);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        >
                                            <option value="">Pilih Posisi</option>
                                            {positions.map((pos) => (
                                                <option key={pos.id} value={pos.id}>
                                                    {pos.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Penetap</label>
                                        <input
                                            type="text"
                                            value={position.penetap}
                                            onChange={(e) => {
                                                const newPositions = [...officialPositions];
                                                newPositions[index].penetap = e.target.value;
                                                setOfficialPositions(newPositions);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nomor SK</label>
                                        <input
                                            type="text"
                                            value={position.nomor_sk}
                                            onChange={(e) => {
                                                const newPositions = [...officialPositions];
                                                newPositions[index].nomor_sk = e.target.value;
                                                setOfficialPositions(newPositions);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tanggal SK</label>
                                        <input
                                            type="date"
                                            value={position.tanggal_sk}
                                            onChange={(e) => {
                                                const newPositions = [...officialPositions];
                                                newPositions[index].tanggal_sk = e.target.value;
                                                setOfficialPositions(newPositions);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Foto</label>
                                        <input
                                            type="file"
                                            onChange={(e) => {
                                                const newPositions = [...officialPositions];
                                                newPositions[index].foto = e.target.files[0];
                                                setOfficialPositions(newPositions);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Mulai Jabatan</label>
                                        <input
                                            type="date"
                                            value={position.mulai}
                                            onChange={(e) => {
                                                const newPositions = [...officialPositions];
                                                newPositions[index].mulai = e.target.value;
                                                setOfficialPositions(newPositions);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Selesai Jabatan</label>
                                        <input
                                            type="date"
                                            value={position.selesai}
                                            onChange={(e) => {
                                                const newPositions = [...officialPositions];
                                                newPositions[index].selesai = e.target.value;
                                                setOfficialPositions(newPositions);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                                        <textarea
                                            value={position.keterangan}
                                            onChange={(e) => {
                                                const newPositions = [...officialPositions];
                                                newPositions[index].keterangan = e.target.value;
                                                setOfficialPositions(newPositions);
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <motion.button
                                            type="button"
                                            onClick={() => removePosition(index)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                                        >
                                            <HiTrash className="mr-2" /> Hapus
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <motion.button
                            type="button"
                            onClick={addPosition}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                        >
                            <HiPlus className="mr-2" /> Tambah Riwayat Jabatan
                        </motion.button>
                    </motion.div>

                    {/* Tombol Submit */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex justify-end mt-8"
                    >
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                        >
                            <HiSave className="mr-2" /> Simpan
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </AuthenticatedLayout>
    );
}
