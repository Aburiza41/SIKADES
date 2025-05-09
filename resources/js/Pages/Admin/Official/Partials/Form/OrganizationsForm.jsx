import { motion, AnimatePresence } from "framer-motion";
import { HiTrash, HiPlus, HiPencil } from "react-icons/hi";
import { useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import axios from "axios";

export default function OrganizationForm({
    organizations = [],
    setOrganizations = () => {},
    officialOrganizations = [],
    setOfficialOrganizations = () => {},
}) {
    const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false);
    const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false);
    const [newOrganizationTitle, setNewOrganizationTitle] = useState("");
    const [newOrganizationDescription, setNewOrganizationDescription] = useState("");
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [nama, setNama] = useState("");
    const [posisi, setPosisi] = useState("");
    const [mulai, setMulai] = useState("");
    const [selesai, setSelesai] = useState("");
    const [pimpinan, setPimpinan] = useState("");
    const [tempat, setTempat] = useState("");
    const [docScan, setDocScan] = useState(null);
    const [keterangan, setKeterangan] = useState("");
    const [editIndex, setEditIndex] = useState(null);

    const organizationOptions = organizations.map((org) => ({
        value: org.id,
        label: org.title,
    }));

    const openAddOptionModal = () => setIsAddOptionModalOpen(true);
    const closeAddOptionModal = () => {
        setIsAddOptionModalOpen(false);
        setNewOrganizationTitle("");
        setNewOrganizationDescription("");
    };

    const openAddDataModal = (index = null) => {
        if (index !== null) {
            const organization = officialOrganizations[index];
            setSelectedOrganization({
                value: organization.organization_id,
                label: organization.organization_title,
            });
            setNama(organization.nama);
            setPosisi(organization.posisi);
            setDocScan(organization.doc_scan || null);
            setKeterangan(organization.keterangan || "");
            setEditIndex(index);
        } else {
            setSelectedOrganization(null);
            setNama("");
            setPosisi("");
            setMulai("");
            setSelesai("");
            setPimpinan("");
            setTempat("");
            setDocScan(null);
            setKeterangan("");
            setEditIndex(null);
        }
        setIsAddDataModalOpen(true);
    };

    const closeAddDataModal = () => {
        setIsAddDataModalOpen(false);
        setSelectedOrganization(null);
        setNama("");
        setPosisi("");
        setMulai("");
        setSelesai("");
        setPimpinan("");
        setTempat("");
        setDocScan(null);
        setKeterangan("");
        setEditIndex(null);
    };

    const addOrganizationOption = async () => {
        if (!newOrganizationTitle.trim()) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Judul organisasi tidak boleh kosong!",
            });
            return;
        }

        try {
            const response = await axios.post("/village/official/organization/store", {
                title: newOrganizationTitle,
                description: newOrganizationDescription,
            });

            if (response.data.success) {
                const newOrganization = {
                    id: response.data.data.id,
                    title: response.data.data.title,
                    description: response.data.data.description,
                };

                setOrganizations((prevOrganizations) => [...prevOrganizations, newOrganization]);
                closeAddOptionModal();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: "Gagal menambahkan organisasi baru: " + response.data.message,
                });
            }
        } catch (error) {
            console.error("Gagal menambahkan organisasi baru:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Terjadi kesalahan saat menambahkan organisasi baru. Silakan coba lagi.",
            });
            closeAddOptionModal();
        }
    };

    const saveOrganizationData = () => {
        if (!selectedOrganization || !nama || !posisi) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Harap isi semua field yang diperlukan!",
            });
            return;
        }

        const newOrganizationData = {
            organization_id: selectedOrganization.value,
            organization_title: selectedOrganization.label,
            nama,
            posisi,
            doc_scan: docScan,
            keterangan,
        };

        if (editIndex !== null) {
            const updatedOrganizations = [...officialOrganizations];
            updatedOrganizations[editIndex] = newOrganizationData;
            setOfficialOrganizations(updatedOrganizations);
        } else {
            setOfficialOrganizations([...officialOrganizations, newOrganizationData]);
        }

        closeAddDataModal();
    };

    const removeOrganization = (index) => {
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
                const newOrganizations = officialOrganizations.filter((_, i) => i !== index);
                setOfficialOrganizations(newOrganizations);
                Swal.fire("Dihapus!", "Data telah dihapus.", "success");
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white w-full p-6 shadow rounded-lg mt-8"
        >
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">
                        D. KEANGGOTAAN ORGANISASI
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Formulir ini digunakan untuk mengisi riwayat organisasi pejabat desa.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <motion.button
                            type="button"
                            onClick={openAddOptionModal}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
                        >
                            <HiPlus className="mr-2" /> Jenis Organisasi
                        </motion.button>

                        <motion.button
                            type="button"
                            onClick={() => openAddDataModal()}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                        >
                            <HiPlus className="mr-2" /> Tambah Riwayat
                        </motion.button>
                    </div>
                </div>

                {/* Regular HTML Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Organisasi
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Posisi
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Keterangan
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {officialOrganizations.length > 0 ? (
                                officialOrganizations.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {row.organization_title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {row.nama}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {row.posisi}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate">
                                            {row.keterangan || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openAddDataModal(index)}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center text-xs"
                                                >
                                                    <HiPencil className="mr-1" /> Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeOrganization(index)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center text-xs"
                                                >
                                                    <HiTrash className="mr-1" /> Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                        Tidak ada data riwayat organisasi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Organization Type Modal */}
            <AnimatePresence>
                {isAddOptionModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="bg-white rounded-lg shadow-xl w-full max-w-md"
                        >
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    Tambah Jenis Organisasi Baru
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Judul Organisasi
                                        </label>
                                        <input
                                            type="text"
                                            value={newOrganizationTitle}
                                            onChange={(e) => setNewOrganizationTitle(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Judul Organisasi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            value={newOrganizationDescription}
                                            onChange={(e) => setNewOrganizationDescription(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Deskripsi Organisasi"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={closeAddOptionModal}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addOrganizationOption}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add/Edit Organization Data Modal */}
            <AnimatePresence>
                {isAddDataModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    {editIndex !== null ? "Edit Riwayat Organisasi" : "Tambah Riwayat Organisasi"}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Jenis Organisasi
                                        </label>
                                        <Select
                                            options={organizationOptions}
                                            value={selectedOrganization}
                                            onChange={setSelectedOrganization}
                                            placeholder="Pilih Organisasi"
                                            isClearable
                                            isSearchable
                                            className="basic-single"
                                            classNamePrefix="select"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Organisasi
                                        </label>
                                        <input
                                            type="text"
                                            value={nama}
                                            onChange={(e) => setNama(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nama"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kedudukan / Jabatan
                                        </label>
                                        <input
                                            type="text"
                                            value={posisi}
                                            onChange={(e) => setPosisi(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Posisi"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Mulai Menjabat
                                        </label>
                                        <input
                                            type="date"
                                            value={mulai}
                                            onChange={(e) => setMulai(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tanggal Mulai Menjabat"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Selesai Menjabat
                                        </label>
                                        <input
                                            type="date"
                                            value={selesai}
                                            onChange={(e) => setSelesai(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tanggal Selesai Menjabat"
                                        />
                                    </div>

                                    {/* Nama Pimpinan */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Pimpinan
                                        </label>
                                        <input
                                            type="text"
                                            value={pimpinan}
                                            onChange={(e) => setPimpinan(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Pimpinan"
                                        />
                                    </div>

                                    {/* Tempat */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tempat
                                        </label>
                                        <input
                                            type="text"
                                            value={tempat}
                                            onChange={(e) => setTempat(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tempat"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dokumen
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => setDocScan(e.target.files[0])}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Keterangan
                                        </label>
                                        <textarea
                                            value={keterangan}
                                            onChange={(e) => setKeterangan(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Keterangan"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={closeAddDataModal}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={saveOrganizationData}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {editIndex !== null ? "Simpan Perubahan" : "Simpan"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
