import { motion, AnimatePresence } from "framer-motion";
import { HiTrash, HiPlus, HiPencil } from "react-icons/hi";
import { useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import axios from "axios";

export default function StudiesForm({
    studies = [],
    setStudies = () => {},
    officialStudies = [],
    setOfficialStudies = () => {},
}) {
    const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false); // State untuk modal tambah opsi
    const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false); // State untuk modal tambah data
    const [newStudyTitle, setNewStudyTitle] = useState(""); // State untuk judul pendidikan baru
    const [newStudyDescription, setNewStudyDescription] = useState(""); // State untuk deskripsi pendidikan baru
    const [selectedStudy, setSelectedStudy] = useState(null); // State untuk pendidikan yang dipilih
    const [namaSekolah, setNamaSekolah] = useState(""); // State untuk nama sekolah
    const [alamatSekolah, setAlamatSekolah] = useState(""); // State untuk alamat sekolah
    const [jurusan, setJurusan] = useState(""); // State untuk jurusan
    const [tahunMasuk, setTahunMasuk] = useState(""); // State untuk tahun masuk
    const [tahunKeluar, setTahunKeluar] = useState(""); // State untuk tahun keluar
    const [dokumen, setDokumen] = useState(null); // State untuk dokumen
    const [editIndex, setEditIndex] = useState(null); // State untuk indeks data yang sedang diedit

    // Format studies untuk React Select
    const formattedStudyOptions = studies.map((study) => ({
        value: study.id,
        label: study.name,
    }));

    // Fungsi untuk membuka modal tambah opsi
    const openAddOptionModal = () => {
        setIsAddOptionModalOpen(true);
    };

    // Fungsi untuk menutup modal tambah opsi
    const closeAddOptionModal = () => {
        setIsAddOptionModalOpen(false);
        setNewStudyTitle("");
        setNewStudyDescription("");
    };

    // Fungsi untuk membuka modal tambah data
    const openAddDataModal = (index = null) => {
        if (index !== null) {
            // Jika sedang edit, isi form dengan data yang ada
            const study = officialStudies[index];
            setSelectedStudy({
                value: study.study_id,
                label: study.study_name,
            });
            setNamaSekolah(study.nama_sekolah);
            setAlamatSekolah(study.alamat_sekolah || "");
            setJurusan(study.jurusan || "");
            setTahunMasuk(study.tahun_masuk);
            setTahunKeluar(study.tahun_keluar || "");
            setDokumen(study.dokumen || null);
            setEditIndex(index);
        } else {
            // Jika sedang tambah, reset form
            setSelectedStudy(null);
            setNamaSekolah("");
            setAlamatSekolah("");
            setJurusan("");
            setTahunMasuk("");
            setTahunKeluar("");
            setDokumen(null);
            setEditIndex(null);
        }
        setIsAddDataModalOpen(true);
    };

    // Fungsi untuk menutup modal tambah data
    const closeAddDataModal = () => {
        setIsAddDataModalOpen(false);
        setSelectedStudy(null);
        setNamaSekolah("");
        setAlamatSekolah("");
        setJurusan("");
        setTahunMasuk("");
        setTahunKeluar("");
        setDokumen(null);
        setEditIndex(null);
    };

    // Fungsi untuk menambahkan opsi pendidikan baru
    const addStudyOption = async () => {
        if (!newStudyTitle.trim()) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Judul pendidikan tidak boleh kosong!",
            });
            return;
        }

        try {
            // Kirim data ke API
            const response = await axios.post("/village/official/study/store", {
                title: newStudyTitle,
                description: newStudyDescription,
            });

            // Pastikan response.data memiliki struktur yang benar
            if (response.data.success) {
                const newStudy = {
                    id: response.data.data.id, // Ambil ID dari response
                    name: response.data.data.title, // Ambil judul dari response
                    description: response.data.data.description, // Ambil deskripsi dari response
                };

                // Perbarui state `studies` dengan data baru dari API
                setStudies((prevStudies) => [...prevStudies, newStudy]);

                // Tutup modal
                closeAddOptionModal();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: "Gagal menambahkan pendidikan baru: " + response.data.message,
                });
            }
        } catch (error) {
            console.error("Gagal menambahkan pendidikan baru:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Terjadi kesalahan saat menambahkan pendidikan baru. Silakan coba lagi.",
            });
            closeAddOptionModal();
        }
    };

    // Fungsi untuk menambahkan atau mengedit riwayat pendidikan
    const saveStudyData = () => {
        if (!selectedStudy || !namaSekolah || !tahunMasuk) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Harap isi semua field yang diperlukan!",
            });
            return;
        }

        const newStudyData = {
            study_id: selectedStudy.value,
            study_name: selectedStudy.label,
            nama_sekolah: namaSekolah,
            alamat_sekolah: alamatSekolah,
            jurusan: jurusan,
            tahun_masuk: tahunMasuk,
            tahun_keluar: tahunKeluar,
            dokumen: dokumen,
        };

        if (editIndex !== null) {
            // Jika sedang edit, update data yang ada
            const updatedStudies = [...officialStudies];
            updatedStudies[editIndex] = newStudyData;
            setOfficialStudies(updatedStudies);
        } else {
            // Jika sedang tambah, tambahkan data baru
            setOfficialStudies([...officialStudies, newStudyData]);
        }

        closeAddDataModal();
    };

    // Fungsi untuk menghapus riwayat pendidikan dengan konfirmasi
    const removeStudy = (index) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                const newStudies = officialStudies.filter((_, i) => i !== index);
                setOfficialStudies(newStudies);
                Swal.fire("Dihapus!", "Data telah dihapus.", "success");
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white w-full p-4 shadow rounded-lg mt-8"
        >
            <div className="space-y-8">
                <div className="flex justify-between items-center border-b">
                    <div className="space-y-0">
                        {/* Judul Form */}
                        <h1 className="text-2xl font-semibold text-gray-700">
                            E. Formulir Riwayat Pendidikan
                        </h1>
                        {/* Keterangan Formulir */}
                        <p className="text-sm text-gray-500">
                            Formulir ini digunakan untuk mengisi riwayat pendidikan pejabat desa.
                        </p>
                    </div>

                    <div className="flex gap-2 items-center">
                        {/* Tombol Tambah Jenis Pendidikan */}
                        <motion.button
                            type="button"
                            onClick={openAddOptionModal}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                        >
                            <HiPlus className="mr-2" /> Jenis Pendidikan
                        </motion.button>

                        {/* Tombol Tambah Riwayat Pendidikan */}
                        <motion.button
                            type="button"
                            onClick={() => openAddDataModal()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                        >
                            <HiPlus className="mr-2" /> Tambah
                        </motion.button>
                    </div>
                </div>

                {/* Tabel Riwayat Pendidikan */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3">Pendidikan</th>
                                <th scope="col" className="px-4 py-3">Nama Sekolah</th>
                                <th scope="col" className="px-4 py-3">Alamat Sekolah</th>
                                <th scope="col" className="px-4 py-3">Jurusan</th>
                                <th scope="col" className="px-4 py-3">Tahun Masuk</th>
                                <th scope="col" className="px-4 py-3">Tahun Keluar</th>
                                <th scope="col" className="px-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {officialStudies.length > 0 ? (
                                officialStudies.map((study, index) => (
                                    <tr key={index} className="bg-white border-b">
                                        <td className="px-4 py-3">{study.study_name}</td>
                                        <td className="px-4 py-3">{study.nama_sekolah}</td>
                                        <td className="px-4 py-3">{study.alamat_sekolah}</td>
                                        <td className="px-4 py-3">{study.jurusan}</td>
                                        <td className="px-4 py-3">{study.tahun_masuk}</td>
                                        <td className="px-4 py-3">{study.tahun_keluar}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openAddDataModal(index)}
                                                    className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center"
                                                >
                                                    <HiPencil className="mr-1" /> Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeStudy(index)}
                                                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                                                >
                                                    <HiTrash className="mr-1" /> Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-3 text-center">Tidak ada data riwayat pendidikan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah Jenis Pendidikan */}
            <AnimatePresence>
                {isAddOptionModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="bg-white p-6 rounded-lg w-1/3"
                        >
                            <h2 className="text-lg font-semibold mb-4">
                                Tambah Jenis Pendidikan Baru
                            </h2>
                            {/* Input Judul Pendidikan */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Judul Pendidikan
                                </label>
                                <input
                                    type="text"
                                    value={newStudyTitle}
                                    onChange={(e) => setNewStudyTitle(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Judul Pendidikan"
                                />
                            </div>
                            {/* Input Deskripsi */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={newStudyDescription}
                                    onChange={(e) => setNewStudyDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Deskripsi Pendidikan"
                                    rows="3"
                                />
                            </div>
                            {/* Tombol Aksi */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeAddOptionModal}
                                    className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={addStudyOption}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Simpan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Tambah/Edit Riwayat Pendidikan */}
            <AnimatePresence>
                {isAddDataModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="bg-white p-6 rounded-lg w-1/2 max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-lg font-semibold mb-4">
                                {editIndex !== null ? "Edit Riwayat Pendidikan" : "Tambah Riwayat Pendidikan"}
                            </h2>

                            {/* Field Pendidikan */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Pendidikan
                                </label>
                                <Select
                                    options={formattedStudyOptions}
                                    value={selectedStudy}
                                    onChange={setSelectedStudy}
                                    placeholder="Pilih Pendidikan"
                                    isClearable
                                    isSearchable
                                    className="mt-1"
                                />
                            </div>

                            {/* Field Nama Sekolah */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Nama Sekolah
                                </label>
                                <input
                                    type="text"
                                    value={namaSekolah}
                                    onChange={(e) => setNamaSekolah(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Nama Sekolah"
                                />
                            </div>

                            {/* Field Alamat Sekolah */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Alamat Sekolah
                                </label>
                                <input
                                    type="text"
                                    value={alamatSekolah}
                                    onChange={(e) => setAlamatSekolah(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Alamat Sekolah"
                                />
                            </div>

                            {/* Field Jurusan */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Jurusan
                                </label>
                                <input
                                    type="text"
                                    value={jurusan}
                                    onChange={(e) => setJurusan(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Jurusan"
                                />
                            </div>

                            {/* Field Tahun Masuk */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tahun Masuk
                                </label>
                                <input
                                    type="number"
                                    value={tahunMasuk}
                                    onChange={(e) => setTahunMasuk(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Tahun Masuk"
                                />
                            </div>

                            {/* Field Tahun Keluar */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tahun Keluar
                                </label>
                                <input
                                    type="number"
                                    value={tahunKeluar}
                                    onChange={(e) => setTahunKeluar(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Tahun Keluar"
                                />
                            </div>

                            {/* Field Dokumen */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Dokumen
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setDokumen(e.target.files[0])}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>

                            {/* Tombol Aksi */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeAddDataModal}
                                    className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={saveStudyData}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    {editIndex !== null ? "Simpan Perubahan" : "Simpan"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}