import { motion, AnimatePresence } from "framer-motion";
import { HiTrash, HiPlus, HiPencil } from "react-icons/hi";
import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import axios from "axios";

export default function StudiesForm({
    studies = [],
    setStudies = () => {},
    officialStudies = [],
    setOfficialStudies = () => {},
}) {
    // State untuk modal dan form
    const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false);
    const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false);
    const [newStudyTitle, setNewStudyTitle] = useState("");
    const [newStudyDescription, setNewStudyDescription] = useState("");
    const [selectedStudy, setSelectedStudy] = useState(null);
    const [namaSekolah, setNamaSekolah] = useState("");
    const [alamatSekolah, setAlamatSekolah] = useState("");
    const [jurusan, setJurusan] = useState("");
    const [tahunMasuk, setTahunMasuk] = useState("");
    const [tahunKeluar, setTahunKeluar] = useState("");
    const [dokumen, setDokumen] = useState(null);
    const [editIndex, setEditIndex] = useState(null);

    // Format options untuk Select dengan memoization
    const formattedStudyOptions = useMemo(() => {
        return studies.map(study => ({
            value: study.id,
            label: study.name
        }));
    }, [studies]);

    // Effect untuk auto-select saat edit
    useEffect(() => {
        if (editIndex !== null && officialStudies[editIndex]) {
            const currentStudy = officialStudies[editIndex];
            const selected = formattedStudyOptions.find(
                option => option.value === currentStudy.study_id
            );

            if (selected) {
                setSelectedStudy(selected);
            }

            // Set nilai form lainnya
            setNamaSekolah(currentStudy.nama_sekolah || "");
            setAlamatSekolah(currentStudy.alamat_sekolah || "");
            setJurusan(currentStudy.jurusan || "");
            setTahunMasuk(currentStudy.tahun_masuk || "");
            setTahunKeluar(currentStudy.tahun_keluar || "");
            setDokumen(currentStudy.dokumen || null);
        }
    }, [editIndex, officialStudies, formattedStudyOptions]);

    // Fungsi modal jenis pendidikan
    const openAddOptionModal = () => setIsAddOptionModalOpen(true);
    const closeAddOptionModal = () => {
        setIsAddOptionModalOpen(false);
        setNewStudyTitle("");
        setNewStudyDescription("");
    };

    // Fungsi modal data pendidikan
    const openAddDataModal = (index = null) => {
        setEditIndex(index);
        setIsAddDataModalOpen(true);

        if (index === null) {
            // Reset form untuk mode tambah baru
            setSelectedStudy(null);
            setNamaSekolah("");
            setAlamatSekolah("");
            setJurusan("");
            setTahunMasuk("");
            setTahunKeluar("");
            setDokumen(null);
        }
    };

    const closeAddDataModal = () => {
        setIsAddDataModalOpen(false);
        setEditIndex(null);
    };

    // Tambah jenis pendidikan baru
    const addStudyOption = async () => {
        if (!newStudyTitle.trim()) {
            Swal.fire("Error", "Judul pendidikan tidak boleh kosong!", "error");
            return;
        }

        try {
            const response = await axios.post("/village/official/study/store", {
                title: newStudyTitle,
                description: newStudyDescription,
            });

            if (response.data.success) {
                const newStudy = {
                    id: response.data.data.id,
                    name: response.data.data.title,
                    description: response.data.data.description,
                };

                setStudies(prev => [...prev, newStudy]);
                closeAddOptionModal();
                Swal.fire("Sukses", "Jenis pendidikan berhasil ditambahkan", "success");
            }
        } catch (error) {
            Swal.fire("Error", "Gagal menambahkan jenis pendidikan", "error");
        }
    };

    // Simpan data pendidikan
    const saveStudyData = () => {
        if (!selectedStudy || !namaSekolah || !tahunMasuk) {
            Swal.fire("Error", "Harap isi data wajib!", "error");
            return;
        }

        const studyData = {
            study_id: selectedStudy.value,
            study_name: selectedStudy.label,
            nama_sekolah: namaSekolah,
            alamat_sekolah: alamatSekolah,
            jurusan: jurusan,
            tahun_masuk: tahunMasuk,
            tahun_keluar: tahunKeluar,
            dokumen: dokumen,
            ...(officialStudies[editIndex]?.study && { study: officialStudies[editIndex].study })
        };

        if (editIndex !== null) {
            // Update existing data
            const updated = [...officialStudies];
            updated[editIndex] = studyData;
            setOfficialStudies(updated);
        } else {
            // Add new data
            setOfficialStudies(prev => [...prev, studyData]);
        }

        closeAddDataModal();
    };

    // Hapus data pendidikan
    const removeStudy = (index) => {
        Swal.fire({
            title: "Hapus Data?",
            text: "Data tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal"
        }).then((result) => {
            if (result.isConfirmed) {
                setOfficialStudies(prev => prev.filter((_, i) => i !== index));
                Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white w-full p-4 shadow rounded-lg mt-8"
        >
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-700">
                        E. RIWAYAT PENDIDIKAN UMUM
                        </h1>
                        <p className="text-sm text-gray-500">
                            Isi riwayat pendidikan pejabat desa
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openAddOptionModal}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md"
                        >
                            <HiPlus className="mr-2" /> Jenis Pendidikan
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openAddDataModal()}
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md"
                        >
                            <HiPlus className="mr-2" /> Tambah Data
                        </motion.button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Pendidikan</th>
                                <th className="px-4 py-3">Nama Sekolah</th>
                                <th className="px-4 py-3">Alamat</th>
                                <th className="px-4 py-3">Jurusan</th>
                                <th className="px-4 py-3">Tahun Masuk</th>
                                <th className="px-4 py-3">Tahun Keluar</th>
                                <th className="px-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {officialStudies.length > 0 ? (
                                officialStudies.map((study, index) => (
                                    <tr key={index} className="bg-white border-b">
                                        <td className="px-4 py-3">
                                            {study.study_name || study.study?.name}
                                        </td>
                                        <td className="px-4 py-3">{study.nama_sekolah}</td>
                                        <td className="px-4 py-3">{study.alamat_sekolah || "-"}</td>
                                        <td className="px-4 py-3">{study.jurusan || "-"}</td>
                                        <td className="px-4 py-3">{study.tahun_masuk}</td>
                                        <td className="px-4 py-3">{study.tahun_keluar || "-"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openAddDataModal(index)}
                                                    className="flex items-center px-2 py-1 bg-yellow-500 text-white rounded-md"
                                                >
                                                    <HiPencil className="mr-1" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => removeStudy(index)}
                                                    className="flex items-center px-2 py-1 bg-red-500 text-white rounded-md"
                                                >
                                                    <HiTrash className="mr-1" /> Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-3 text-center">
                                        Tidak ada data pendidikan
                                    </td>
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
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="bg-white rounded-lg p-6 w-full max-w-md"
                        >
                            <h2 className="text-lg font-semibold mb-4">Tambah Jenis Pendidikan</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Judul</label>
                                    <input
                                        type="text"
                                        value={newStudyTitle}
                                        onChange={(e) => setNewStudyTitle(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        placeholder="Contoh: SMA"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Deskripsi</label>
                                    <textarea
                                        value={newStudyDescription}
                                        onChange={(e) => setNewStudyDescription(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        rows={3}
                                        placeholder="Deskripsi pendidikan"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={closeAddOptionModal}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={addStudyOption}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                >
                                    Simpan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Tambah/Edit Data Pendidikan */}
            <AnimatePresence>
                {isAddDataModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-lg font-semibold mb-4">
                                {editIndex !== null ? "Edit Pendidikan" : "Tambah Pendidikan"}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Jenjang Pendidikan</label>
                                    <Select
                                        options={formattedStudyOptions}
                                        value={selectedStudy}
                                        onChange={setSelectedStudy}
                                        placeholder="Pilih jenjang"
                                        className="basic-single"
                                        classNamePrefix="select"
                                        isClearable
                                        isSearchable
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama Sekolah</label>
                                    <input
                                        type="text"
                                        value={namaSekolah}
                                        onChange={(e) => setNamaSekolah(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Alamat Sekolah</label>
                                    <input
                                        type="text"
                                        value={alamatSekolah}
                                        onChange={(e) => setAlamatSekolah(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Jurusan</label>
                                    <input
                                        type="text"
                                        value={jurusan}
                                        onChange={(e) => setJurusan(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Tahun Masuk</label>
                                    <input
                                        type="number"
                                        value={tahunMasuk}
                                        onChange={(e) => setTahunMasuk(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Tahun Keluar</label>
                                    <input
                                        type="number"
                                        value={tahunKeluar}
                                        onChange={(e) => setTahunKeluar(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Dokumen</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setDokumen(e.target.files[0])}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={closeAddDataModal}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={saveStudyData}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                >
                                    {editIndex !== null ? "Update" : "Simpan"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
