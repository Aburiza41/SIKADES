import { motion, AnimatePresence } from "framer-motion";
import { HiTrash, HiPlus, HiPencil } from "react-icons/hi";
import { useState } from "react";
import Select from "react-select";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";

export default function OrganizationForm({
    organizations = [],
    setOrganizations = () => {},
    officialOrganizations = [],
    setOfficialOrganizations = () => {},
}) {
    const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false); // State untuk modal tambah opsi
    const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false); // State untuk modal tambah data
    const [newOrganizationTitle, setNewOrganizationTitle] = useState(""); // State untuk judul organisasi baru
    const [newOrganizationDescription, setNewOrganizationDescription] = useState(""); // State untuk deskripsi organisasi baru
    const [selectedOrganization, setSelectedOrganization] = useState(null); // State untuk organisasi yang dipilih
    const [nama, setNama] = useState(""); // State untuk nama
    const [posisi, setPosisi] = useState(""); // State untuk posisi
    const [docScan, setDocScan] = useState(null); // State untuk dokumen scan
    const [keterangan, setKeterangan] = useState(""); // State untuk keterangan
    const [editIndex, setEditIndex] = useState(null); // State untuk indeks data yang sedang diedit

    // Format organizations untuk React Select
    const organizationOptions = organizations.map((org) => ({
        value: org.id,
        label: org.title,
    }));

    // Fungsi untuk membuka modal tambah opsi
    const openAddOptionModal = () => {
        setIsAddOptionModalOpen(true);
    };

    // Fungsi untuk menutup modal tambah opsi
    const closeAddOptionModal = () => {
        setIsAddOptionModalOpen(false);
        setNewOrganizationTitle("");
        setNewOrganizationDescription("");
    };

    // Fungsi untuk membuka modal tambah data
    const openAddDataModal = (index = null) => {
        if (index !== null) {
            // Jika sedang edit, isi form dengan data yang ada
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
            // Jika sedang tambah, reset form
            setSelectedOrganization(null);
            setNama("");
            setPosisi("");
            setDocScan(null);
            setKeterangan("");
            setEditIndex(null);
        }
        setIsAddDataModalOpen(true);
    };

    // Fungsi untuk menutup modal tambah data
    const closeAddDataModal = () => {
        setIsAddDataModalOpen(false);
        setSelectedOrganization(null);
        setNama("");
        setPosisi("");
        setDocScan(null);
        setKeterangan("");
        setEditIndex(null);
    };

    // Fungsi untuk menambahkan opsi organisasi baru
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
            // Kirim data ke API
            const response = await axios.post("/village/official/organization/store", {
                title: newOrganizationTitle,
                description: newOrganizationDescription,
            });

            // Pastikan response.data memiliki struktur yang benar
            if (response.data.success) {
                const newOrganization = {
                    id: response.data.data.id, // Ambil ID dari response
                    title: response.data.data.title, // Ambil judul dari response
                    description: response.data.data.description, // Ambil deskripsi dari response
                };

                // Perbarui state `organizations` dengan data baru dari API
                setOrganizations((prevOrganizations) => [...prevOrganizations, newOrganization]);

                // Tutup modal
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

    // Fungsi untuk menambahkan atau mengedit riwayat organisasi
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
            // Jika sedang edit, update data yang ada
            const updatedOrganizations = [...officialOrganizations];
            updatedOrganizations[editIndex] = newOrganizationData;
            setOfficialOrganizations(updatedOrganizations);
        } else {
            // Jika sedang tambah, tambahkan data baru
            setOfficialOrganizations([...officialOrganizations, newOrganizationData]);
        }

        closeAddDataModal();
    };

    // Fungsi untuk menghapus riwayat organisasi dengan konfirmasi
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

    // Kolom untuk DataTable
    const columns = [
        {
            name: "Organisasi",
            selector: (row) => row.organization_title,
            sortable: true,
        },
        {
            name: "Nama",
            selector: (row) => row.nama,
            sortable: true,
        },
        {
            name: "Posisi",
            selector: (row) => row.posisi,
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
                        onClick={() => removeOrganization(index)}
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
                            H. Formulir Riwayat Organisasi
                        </h1>
                        {/* Keterangan Formulir */}
                        <p className="text-sm text-gray-500">
                            Formulir ini digunakan untuk mengisi riwayat organisasi pejabat desa.
                        </p>
                    </div>

                    <div className="flex gap-2 items-center">
                        {/* Tombol Tambah Jenis Organisasi */}
                        <motion.button
                            type="button"
                            onClick={openAddOptionModal}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                        >
                            <HiPlus className="mr-2" /> Jenis Organisasi
                        </motion.button>

                        {/* Tombol Tambah Riwayat Organisasi */}
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
                {/* Tabel Riwayat Organisasi */}
                <DataTable
                    columns={columns}
                    data={officialOrganizations}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent="Tidak ada data riwayat organisasi."
                />
            </div>

            {/* Modal Tambah Jenis Organisasi */}
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
                                Tambah Jenis Organisasi Baru
                            </h2>
                            {/* Input Judul Organisasi */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Judul Organisasi
                                </label>
                                <input
                                    type="text"
                                    value={newOrganizationTitle}
                                    onChange={(e) => setNewOrganizationTitle(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Judul Organisasi"
                                />
                            </div>
                            {/* Input Deskripsi */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={newOrganizationDescription}
                                    onChange={(e) => setNewOrganizationDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Deskripsi Organisasi"
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
                                    onClick={addOrganizationOption}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Simpan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Tambah/Edit Riwayat Organisasi */}
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
                                {editIndex !== null ? "Edit Riwayat Organisasi" : "Tambah Riwayat Organisasi"}
                            </h2>

                            {/* Field Organisasi */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Organisasi
                                </label>
                                <Select
                                    options={organizationOptions}
                                    value={selectedOrganization}
                                    onChange={setSelectedOrganization}
                                    placeholder="Pilih Organisasi"
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

                            {/* Field Posisi */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Posisi
                                </label>
                                <input
                                    type="text"
                                    value={posisi}
                                    onChange={(e) => setPosisi(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Posisi"
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
                                    onClick={saveOrganizationData}
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