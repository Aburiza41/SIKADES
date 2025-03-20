import { motion, AnimatePresence } from "framer-motion";
import { HiTrash, HiPlus, HiPencil } from "react-icons/hi";
import { useState } from "react";
import Select from "react-select";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";

export default function PositionsForm({
    positions = [],
    setPositions = () => {},
    officialPositions = [],
    setOfficialPositions = () => {},
}) {
    const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false); // State untuk modal tambah opsi
    const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false); // State untuk modal tambah data
    const [newPositionName, setNewPositionName] = useState(""); // State untuk nama posisi baru
    const [newPositionDescription, setNewPositionDescription] = useState(""); // State untuk deskripsi posisi baru
    const [selectedPosition, setSelectedPosition] = useState(null); // State untuk posisi yang dipilih
    const [penetap, setPenetap] = useState(""); // State untuk penetap
    const [nomorSk, setNomorSk] = useState(""); // State untuk nomor SK
    const [tanggalSk, setTanggalSk] = useState(""); // State untuk tanggal SK
    const [fileSk, setFileSk] = useState(null); // State untuk file SK
    const [mulaiJabatan, setMulaiJabatan] = useState(""); // State untuk mulai jabatan
    const [selesaiJabatan, setSelesaiJabatan] = useState(""); // State untuk selesai jabatan
    const [keterangan, setKeterangan] = useState(""); // State untuk keterangan
    const [editIndex, setEditIndex] = useState(null); // State untuk indeks data yang sedang diedit

    // Format positions untuk React Select
    const positionOptions = positions.map((pos) => ({
        value: pos.id,
        label: pos.name,
    }));

    // Fungsi untuk membuka modal tambah opsi
    const openAddOptionModal = () => {
        setIsAddOptionModalOpen(true);
    };

    // Fungsi untuk menutup modal tambah opsi
    const closeAddOptionModal = () => {
        setIsAddOptionModalOpen(false);
        setNewPositionName("");
        setNewPositionDescription("");
    };

    // Fungsi untuk membuka modal tambah data
    const openAddDataModal = (index = null) => {
        if (index !== null) {
            // Jika sedang edit, isi form dengan data yang ada
            const position = officialPositions[index];
            setSelectedPosition({
                value: position.position_id,
                label: position.position_name,
            });
            setPenetap(position.penetap);
            setNomorSk(position.nomor_sk);
            setTanggalSk(position.tanggal_sk);
            setFileSk(position.file_sk || null);
            setMulaiJabatan(position.mulai);
            setSelesaiJabatan(position.selesai || "");
            setKeterangan(position.keterangan || "");
            setEditIndex(index);
        } else {
            // Jika sedang tambah, reset form
            setSelectedPosition(null);
            setPenetap("");
            setNomorSk("");
            setTanggalSk("");
            setFileSk(null);
            setMulaiJabatan("");
            setSelesaiJabatan("");
            setKeterangan("");
            setEditIndex(null);
        }
        setIsAddDataModalOpen(true);
    };

    // Fungsi untuk menutup modal tambah data
    const closeAddDataModal = () => {
        setIsAddDataModalOpen(false);
        setSelectedPosition(null);
        setPenetap("");
        setNomorSk("");
        setTanggalSk("");
        setFileSk(null);
        setMulaiJabatan("");
        setSelesaiJabatan("");
        setKeterangan("");
        setEditIndex(null);
    };

    // Fungsi untuk menambahkan opsi posisi baru
    const addPositionOption = async () => {
        if (!newPositionName.trim()) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Nama posisi tidak boleh kosong!",
            });
            return;
        }

        try {
            // Kirim data ke API
            const response = await axios.post("/village/official/position/store", {
                name: newPositionName,
                description: newPositionDescription,
            });

            // Pastikan response.data memiliki struktur yang benar
            if (response.data.success) {
                const newPosition = {
                    id: response.data.data.id, // Ambil ID dari response
                    name: response.data.data.name, // Ambil nama dari response
                    description: response.data.data.description, // Ambil deskripsi dari response
                };

                // Perbarui state `positions` dengan data baru dari API
                setPositions((prevPositions) => [...prevPositions, newPosition]);

                // Tutup modal
                closeAddOptionModal();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: "Gagal menambahkan posisi baru: " + response.data.message,
                });
            }
        } catch (error) {
            console.error("Gagal menambahkan posisi baru:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Terjadi kesalahan saat menambahkan posisi baru. Silakan coba lagi.",
            });
            closeAddOptionModal();
        }
    };

    // Fungsi untuk menambahkan atau mengedit riwayat jabatan
    const savePositionData = () => {
        if (!selectedPosition || !penetap || !nomorSk || !tanggalSk || !mulaiJabatan) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Harap isi semua field yang diperlukan!",
            });
            return;
        }

        const newPositionData = {
            position_id: selectedPosition.value,
            position_name: selectedPosition.label,
            penetap,
            nomor_sk: nomorSk,
            tanggal_sk: tanggalSk,
            file_sk: fileSk,
            mulai: mulaiJabatan,
            selesai: selesaiJabatan,
            keterangan,
        };

        if (editIndex !== null) {
            // Jika sedang edit, update data yang ada
            const updatedPositions = [...officialPositions];
            updatedPositions[editIndex] = newPositionData;
            setOfficialPositions(updatedPositions);
        } else {
            // Jika sedang tambah, tambahkan data baru
            setOfficialPositions([...officialPositions, newPositionData]);
        }

        closeAddDataModal();
    };

    // Fungsi untuk menghapus riwayat jabatan dengan konfirmasi
    const removePosition = (index) => {
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
                const newPositions = officialPositions.filter((_, i) => i !== index);
                setOfficialPositions(newPositions);
                Swal.fire("Dihapus!", "Data telah dihapus.", "success");
            }
        });
    };

    // Kolom untuk DataTable
    const columns = [
        {
            name: "Posisi",
            selector: (row) => row.position_name,
            sortable: true,
        },
        {
            name: "Penetap",
            selector: (row) => row.penetap,
            sortable: true,
        },
        {
            name: "Nomor SK",
            selector: (row) => row.nomor_sk,
            sortable: true,
        },
        {
            name: "Tanggal SK",
            selector: (row) => row.tanggal_sk,
            sortable: true,
        },
        {
            name: "Mulai Jabatan",
            selector: (row) => row.mulai,
            sortable: true,
        },
        {
            name: "Selesai Jabatan",
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
                        onClick={() => removePosition(index)}
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
                            F. Formulir Riwayat Jabatan
                        </h1>
                        {/* Keterangan Formulir */}
                        <p className="text-sm text-gray-500">
                            Formulir ini digunakan untuk mengisi riwayat jabatan pejabat desa.
                        </p>
                    </div>

                    <div className="flex gap-2 items-center">
                        {/* Tombol Tambah Jenis Posisi */}
                        <motion.button
                            type="button"
                            onClick={openAddOptionModal}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                        >
                            <HiPlus className="mr-2" />Jenis Posisi
                        </motion.button>

                        {/* Tombol Tambah Riwayat Jabatan */}
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
                {/* Tabel Riwayat Jabatan */}
                <DataTable
                    columns={columns}
                    data={officialPositions}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent="Tidak ada data riwayat jabatan."
                />
            </div>

            {/* Modal Tambah Jenis Posisi */}
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
                                Tambah Jenis Posisi Baru
                            </h2>
                            {/* Input Nama Posisi */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Nama Posisi
                                </label>
                                <input
                                    type="text"
                                    value={newPositionName}
                                    onChange={(e) => setNewPositionName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Nama Jenis Posisi"
                                />
                            </div>
                            {/* Input Deskripsi */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={newPositionDescription}
                                    onChange={(e) => setNewPositionDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Deskripsi Jenis Posisi"
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
                                    onClick={addPositionOption}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Simpan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Tambah/Edit Riwayat Jabatan */}
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
                                {editIndex !== null ? "Edit Riwayat Jabatan" : "Tambah Riwayat Jabatan"}
                            </h2>

                            {/* Field Posisi */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Posisi
                                </label>
                                <Select
                                    options={positionOptions}
                                    value={selectedPosition}
                                    onChange={setSelectedPosition}
                                    placeholder="Pilih Posisi"
                                    isClearable
                                    isSearchable
                                    className="mt-1"
                                />
                            </div>

                            {/* Field Penetap */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Penetap
                                </label>
                                <input
                                    type="text"
                                    value={penetap}
                                    onChange={(e) => setPenetap(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Penetap"
                                />
                            </div>

                            {/* Field Nomor SK */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Nomor SK
                                </label>
                                <input
                                    type="text"
                                    value={nomorSk}
                                    onChange={(e) => setNomorSk(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Nomor SK"
                                />
                            </div>

                            {/* Field Tanggal SK */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tanggal SK
                                </label>
                                <input
                                    type="date"
                                    value={tanggalSk}
                                    onChange={(e) => setTanggalSk(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>

                            {/* Field File SK */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    File SK
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setFileSk(e.target.files[0])}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>

                            {/* Field Mulai Jabatan */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Mulai Jabatan
                                </label>
                                <input
                                    type="date"
                                    value={mulaiJabatan}
                                    onChange={(e) => setMulaiJabatan(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>

                            {/* Field Selesai Jabatan */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Selesai Jabatan
                                </label>
                                <input
                                    type="date"
                                    value={selesaiJabatan}
                                    onChange={(e) => setSelesaiJabatan(e.target.value)}
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
                                    onClick={savePositionData}
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