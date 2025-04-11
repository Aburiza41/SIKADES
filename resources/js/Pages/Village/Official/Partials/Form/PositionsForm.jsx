import { motion, AnimatePresence } from "framer-motion";
import { HiTrash, HiPlus, HiPencil } from "react-icons/hi";
import { useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import axios from "axios";

export default function PositionsForm({
    positions = [],
    setPositions = () => {},
    officialPositions = [],
    setOfficialPositions = () => {},
}) {
    const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false);
    const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false);
    const [newPositionName, setNewPositionName] = useState("");
    const [newPositionDescription, setNewPositionDescription] = useState("");
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [penetap, setPenetap] = useState("");
    const [nomorSk, setNomorSk] = useState("");
    const [tanggalSk, setTanggalSk] = useState("");
    const [fileSk, setFileSk] = useState(null);
    const [mulaiJabatan, setMulaiJabatan] = useState("");
    const [selesaiJabatan, setSelesaiJabatan] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [editIndex, setEditIndex] = useState(null);

    console.log(officialPositions);

    const positionOptions = positions.map((pos) => ({
        value: pos.id,
        label: pos.name,
    }));

    const openAddOptionModal = () => {
        setIsAddOptionModalOpen(true);
    };

    const closeAddOptionModal = () => {
        setIsAddOptionModalOpen(false);
        setNewPositionName("");
        setNewPositionDescription("");
    };

    const openAddDataModal = (index = null) => {
        if (index !== null) {
            const position = officialPositions[index].position;
            setSelectedPosition({
                value: position.id,
                label: position.name,
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
            const response = await axios.post("/village/official/position/store", {
                name: newPositionName,
                description: newPositionDescription,
            });

            if (response.data.success) {
                const newPosition = {
                    id: response.data.data.id,
                    name: response.data.data.name,
                    description: response.data.data.description,
                };

                setPositions((prevPositions) => [...prevPositions, newPosition]);
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
            const updatedPositions = [...officialPositions];
            updatedPositions[editIndex] = newPositionData;
            setOfficialPositions(updatedPositions);
        } else {
            setOfficialPositions([...officialPositions, newPositionData]);
        }

        closeAddDataModal();
    };

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
                        <h1 className="text-2xl font-semibold text-gray-700">
                            F. Formulir Riwayat Jabatan
                        </h1>
                        <p className="text-sm text-gray-500">
                            Formulir ini digunakan untuk mengisi riwayat jabatan pejabat desa.
                        </p>
                    </div>

                    <div className="flex gap-2 items-center">
                        <motion.button
                            type="button"
                            onClick={openAddOptionModal}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                        >
                            <HiPlus className="mr-2" />Jenis Posisi
                        </motion.button>

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

                {/* Regular HTML Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penetap</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor SK</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal SK</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mulai Jabatan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selesai Jabatan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {officialPositions.length > 0 ? (
                                officialPositions.map((position, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.position_name || position.position?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{position.penetap}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{position.nomor_sk}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{position.tanggal_sk}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{position.mulai}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{position.selesai || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{position.keterangan || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                        Tidak ada data riwayat jabatan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Position Option Modal */}
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

            {/* Add/Edit Position Data Modal */}
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
