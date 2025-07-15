import { motion, AnimatePresence } from "framer-motion";
import { HiTrash, HiPlus, HiPencil } from "react-icons/hi";
import { useState } from "react";
import Select from "react-select";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";

export default function TrainingsForm({
    trainings = [],
    setTrainings = () => {},
    officialTrainings = [],
    setOfficialTrainings = () => {},
}) {
    const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false); // State untuk modal tambah opsi
    const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false); // State untuk modal tambah data
    const [newTrainingTitle, setNewTrainingTitle] = useState(""); // State untuk judul pelatihan baru
    const [newTrainingDescription, setNewTrainingDescription] = useState(""); // State untuk deskripsi pelatihan baru
    const [selectedTraining, setSelectedTraining] = useState(null); // State untuk pelatihan yang dipilih
    const [nama, setNama] = useState(""); // State untuk nama
    const [mulai, setMulai] = useState(""); // State untuk tanggal mulai
    const [selesai, setSelesai] = useState(""); // State untuk tanggal selesai
    const [docScan, setDocScan] = useState(null); // State untuk dokumen scan
    const [keterangan, setKeterangan] = useState(""); // State untuk keterangan
    const [editIndex, setEditIndex] = useState(null); // State untuk indeks data yang sedang diedit

    // Format trainings untuk React Select
    const trainingOptions = trainings.map((training) => ({
        value: training.id,
        label: training.title,
    }));

    // Fungsi untuk membuka modal tambah opsi
    const openAddOptionModal = () => {
        setIsAddOptionModalOpen(true);
    };

    // Fungsi untuk menutup modal tambah opsi
    const closeAddOptionModal = () => {
        setIsAddOptionModalOpen(false);
        setNewTrainingTitle("");
        setNewTrainingDescription("");
    };

    // Fungsi untuk membuka modal tambah data
    const openAddDataModal = (index = null) => {
        if (index !== null) {
            // Jika sedang edit, isi form dengan data yang ada
            const training = officialTrainings[index];
            setSelectedTraining({
                value: training.training_id,
                label: training.training_title,
            });
            setNama(training.nama);
            setMulai(training.mulai);
            setSelesai(training.selesai || "");
            setDocScan(training.doc_scan || null);
            setKeterangan(training.keterangan || "");
            setEditIndex(index);
        } else {
            // Jika sedang tambah, reset form
            setSelectedTraining(null);
            setNama("");
            setMulai("");
            setSelesai("");
            setDocScan(null);
            setKeterangan("");
            setEditIndex(null);
        }
        setIsAddDataModalOpen(true);
    };

    // Fungsi untuk menutup modal tambah data
    const closeAddDataModal = () => {
        setIsAddDataModalOpen(false);
        setSelectedTraining(null);
        setNama("");
        setMulai("");
        setSelesai("");
        setDocScan(null);
        setKeterangan("");
        setEditIndex(null);
    };

    // Fungsi untuk menambahkan opsi pelatihan baru
    const addTrainingOption = async () => {
        if (!newTrainingTitle.trim()) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Judul pelatihan tidak boleh kosong!",
            });
            return;
        }

        try {
            // Kirim data ke API
            const response = await axios.post("/village/official/training/store", {
                title: newTrainingTitle,
                description: newTrainingDescription,
            });

            // Pastikan response.data memiliki struktur yang benar
            if (response.data.success) {
                const newTraining = {
                    id: response.data.data.id, // Ambil ID dari response
                    title: response.data.data.title, // Ambil judul dari response
                    description: response.data.data.description, // Ambil deskripsi dari response
                };

                // Perbarui state `trainings` dengan data baru dari API
                setTrainings((prevTrainings) => [...prevTrainings, newTraining]);

                // Tutup modal
                closeAddOptionModal();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: "Gagal menambahkan pelatihan baru: " + response.data.message,
                });
            }
        } catch (error) {
            console.error("Gagal menambahkan pelatihan baru:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Terjadi kesalahan saat menambahkan pelatihan baru. Silakan coba lagi.",
            });
            closeAddOptionModal();
        }
    };

    // Fungsi untuk menambahkan atau mengedit riwayat pelatihan
    const saveTrainingData = () => {
        if (!selectedTraining || !nama || !mulai) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Harap isi semua field yang diperlukan!",
            });
            return;
        }

        const newTrainingData = {
            training_id: selectedTraining.value,
            training_title: selectedTraining.label,
            nama,
            mulai,
            selesai,
            doc_scan: docScan,
            keterangan,
        };

        if (editIndex !== null) {
            // Jika sedang edit, update data yang ada
            const updatedTrainings = [...officialTrainings];
            updatedTrainings[editIndex] = newTrainingData;
            setOfficialTrainings(updatedTrainings);
        } else {
            // Jika sedang tambah, tambahkan data baru
            setOfficialTrainings([...officialTrainings, newTrainingData]);
        }

        closeAddDataModal();
    };

    // Fungsi untuk menghapus riwayat pelatihan dengan konfirmasi
    const removeTraining = (index) => {
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
                const newTrainings = officialTrainings.filter((_, i) => i !== index);
                setOfficialTrainings(newTrainings);
                Swal.fire("Dihapus!", "Data telah dihapus.", "success");
            }
        });
    };

    // Kolom untuk DataTable
    const columns = [
        {
            name: "Pelatihan",
            selector: (row) => row.training_title,
            sortable: true,
        },
        {
            name: "Nama",
            selector: (row) => row.nama,
            sortable: true,
        },
        {
            name: "Mulai",
            selector: (row) => row.mulai,
            sortable: true,
        },
        {
            name: "Selesai",
            selector: (row) => row.selesai,
            sortable: true,
        },
        {
            name: "Keterangan",
            selector: (row) => row.keterangan,
            sortable: true,
        },
        {
            name: "Aksi",
            cell: (row, index) => (
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
                        onClick={() => removeTraining(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                    >
                        <HiTrash className="mr-1" /> Hapus
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

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
                            G. Formulir Riwayat Pelatihan
                        </h1>
                        {/* Keterangan Formulir */}
                        <p className="text-sm text-gray-500">
                            Formulir ini digunakan untuk mengisi riwayat pelatihan pejabat desa.
                        </p>
                    </div>

                    <div className="flex gap-2 items-center">
                        {/* Tombol Tambah Jenis Pelatihan */}
                        <motion.button
                            type="button"
                            onClick={openAddOptionModal}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                        >
                            <HiPlus className="mr-2" /> Jenis Pelatihan
                        </motion.button>

                        {/* Tombol Tambah Riwayat Pelatihan */}
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
                {/* Tabel Riwayat Pelatihan */}
                <DataTable
                    columns={columns}
                    data={officialTrainings}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent="Tidak ada data riwayat pelatihan."
                />
            </div>

            {/* Modal Tambah Jenis Pelatihan */}
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
                                Tambah Jenis Pelatihan Baru
                            </h2>
                            {/* Input Judul Pelatihan */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Judul Pelatihan
                                </label>
                                <input
                                    type="text"
                                    value={newTrainingTitle}
                                    onChange={(e) => setNewTrainingTitle(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Judul Pelatihan"
                                />
                            </div>
                            {/* Input Deskripsi */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={newTrainingDescription}
                                    onChange={(e) => setNewTrainingDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Deskripsi Pelatihan"
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
                                    onClick={addTrainingOption}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Simpan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Tambah/Edit Riwayat Pelatihan */}
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
                                {editIndex !== null ? "Edit Riwayat Pelatihan" : "Tambah Riwayat Pelatihan"}
                            </h2>

                            {/* Field Pelatihan */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Pelatihan
                                </label>
                                <Select
                                    options={trainingOptions}
                                    value={selectedTraining}
                                    onChange={setSelectedTraining}
                                    placeholder="Pilih Pelatihan"
                                    isClearable
                                    isSearchable
                                    className="mt-1"
                                />
                            </div>

                            {/* Field Nama */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Nama
                                </label>
                                <input
                                    type="text"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Nama"
                                />
                            </div>

                            {/* Field Mulai */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Mulai
                                </label>
                                <input
                                    type="date"
                                    value={mulai}
                                    onChange={(e) => setMulai(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>

                            {/* Field Selesai */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Selesai
                                </label>
                                <input
                                    type="date"
                                    value={selesai}
                                    onChange={(e) => setSelesai(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>

                            {/* Field Dokumen */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Dokumen
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setDocScan(e.target.files[0])}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>

                            {/* Field Keterangan */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Keterangan
                                </label>
                                <textarea
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Keterangan"
                                    rows="3"
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
                                    onClick={saveTrainingData}
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
