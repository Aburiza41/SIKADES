import { motion, AnimatePresence } from "framer-motion";
import {
    HiTrash,
    HiPlus,
    HiPencil,
    HiOutlineOfficeBuilding,
    HiUserGroup,
    HiCalendar,
    HiLocationMarker,
    HiDocumentText,
    HiInformationCircle,
    HiX,
    HiCheck,
} from "react-icons/hi";
import { FaUserTie } from "react-icons/fa";
import { useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import axios from "axios";

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
};

const inputVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3 },
    },
    focus: {
        scale: 1.02,
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
    },
};

const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
    },
};

const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "-";

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) return "Tanggal mulai tidak valid";
    if (isNaN(end.getTime())) return "Tanggal selesai tidak valid";

    const diffInMs = end - start;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return "Tanggal tidak valid";

    const years = Math.floor(diffInDays / 365);
    const months = Math.floor((diffInDays % 365) / 30);
    const days = diffInDays % 30;

    let result = [];
    if (years > 0) result.push(`${years} tahun`);
    if (months > 0) result.push(`${months} bulan`);
    if (days > 0 && years < 1) result.push(`${days} hari`);

    return result.length > 0 ? result.join(" ") : "Kurang dari 1 hari";
};

export default function OrganizationForm({
    organizations = [],
    setOrganizations = () => {},
    officialOrganizations = [],
    setOfficialOrganizations = () => {},
}) {
    // State management
    const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false);
    const [newOrganizationInput, setNewOrganizationInput] = useState("");
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [formData, setFormData] = useState({
        nama: "",
        posisi: "",
        mulai: "",
        selesai: "",
        pimpinan: "",
        tempat: "",
        docScan: null,
    });
    const [editIndex, setEditIndex] = useState(null);
    const [tempOptions, setTempOptions] = useState([]);

    // Prepare organization options
    const organizationOptions = [
        ...organizations.map((org) => ({
            value: org.id,
            label: org.title,
        })),
        ...tempOptions,
    ];

    // Modal handlers
    const openAddDataModal = (index = null) => {
        if (index !== null) {
            const organization = officialOrganizations[index];
            setSelectedOrganization({
                value: organization.organization_id,
                label: organization.organization_title,
            });
            setFormData({
                nama: organization.nama,
                posisi: organization.posisi,
                mulai: organization.mulai,
                selesai: organization.selesai,
                pimpinan: organization.pimpinan,
                tempat: organization.tempat,
                docScan: organization.doc_scan || null,
            });
            setEditIndex(index);
        } else {
            setSelectedOrganization(null);
            setFormData({
                nama: "",
                posisi: "",
                mulai: "",
                selesai: "",
                pimpinan: "",
                tempat: "",
                docScan: null,
            });
            setEditIndex(null);
        }
        setIsAddDataModalOpen(true);
    };

    const closeAddDataModal = () => {
        setIsAddDataModalOpen(false);
        setSelectedOrganization(null);
        setFormData({
            nama: "",
            posisi: "",
            mulai: "",
            selesai: "",
            pimpinan: "",
            tempat: "",
            docScan: null,
        });
        setEditIndex(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Organization data handlers
    const saveOrganizationData = () => {
        if (!selectedOrganization || !formData.nama || !formData.posisi) {
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
            ...formData,
            doc_scan: formData.docScan,
        };

        if (editIndex !== null) {
            const updatedOrganizations = [...officialOrganizations];
            updatedOrganizations[editIndex] = newOrganizationData;
            setOfficialOrganizations(updatedOrganizations);
            showSuccessAlert("Data organisasi berhasil diperbarui.");
        } else {
            setOfficialOrganizations([
                ...officialOrganizations,
                newOrganizationData,
            ]);
            showSuccessAlert("Data organisasi berhasil ditambahkan.");
        }

        closeAddDataModal();
    };

    const showSuccessAlert = (message) => {
        Swal.fire({
            title: "Berhasil!",
            text: message,
            icon: "success",
            iconColor: "#10b981",
            confirmButtonColor: "#3b82f6",
            background: "#ffffff",
        });
    };

    const removeOrganization = (index) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
            background: "#ffffff",
            iconColor: "#f59e0b",
        }).then((result) => {
            if (result.isConfirmed) {
                const newOrganizations = officialOrganizations.filter(
                    (_, i) => i !== index
                );
                setOfficialOrganizations(newOrganizations);
                showSuccessAlert("Data telah dihapus.");
            }
        });
    };

    const handleAddNewOrganization = async (inputValue) => {
        const exists = organizationOptions.some(
            (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
        );

        if (exists) {
            Swal.fire({
                icon: "info",
                title: "Organisasi sudah ada",
                text: "Organisasi ini sudah tersedia di daftar pilihan",
            });
            return;
        }

        try {
            const response = await axios.post(
                "/village/official/organization/store",
                {
                    title: inputValue,
                    description:
                        "Ditambahkan secara otomatis dari input pencarian",
                }
            );

            if (response.data.success) {
                const newOrg = {
                    id: response.data.data.id,
                    title: response.data.data.title,
                    description: response.data.data.description,
                };

                setOrganizations([...organizations, newOrg]);
                setSelectedOrganization({
                    value: newOrg.id,
                    label: newOrg.title,
                });

                showSuccessAlert("Organisasi baru berhasil ditambahkan");
            }
        } catch (error) {
            console.error("Gagal menambahkan organisasi:", error);
            const newOption = {
                label: inputValue,
                value: `temp-${Date.now()}`,
            };

            setTempOptions([...tempOptions, newOption]);
            setSelectedOrganization(newOption);

            Swal.fire({
                icon: "warning",
                title: "Organisasi ditambahkan sementara",
                text: "Organisasi ini belum tersimpan di database. Silakan tambahkan melalui menu 'Jenis Organisasi' untuk menyimpan permanen.",
            });
        }
    };

    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

            if (!allowedTypes.includes(file.type)) {
                alert("Hanya file PDF, JPEG, atau PNG yang diizinkan");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran file maksimal 5MB");
                return;
            }

            setFormData((prev) => ({ ...prev, docScan: file }));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white w-full p-6 shadow-lg rounded-xl mt-8 border border-gray-100"
        >
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                        >
                            <HiUserGroup className="text-3xl text-blue-500" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                D. KEANGGOTAAN ORGANISASI
                            </h1>
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                                <HiInformationCircle className="mr-1 text-blue-500" />
                                Formulir ini digunakan untuk mengisi riwayat
                                organisasi pejabat desa.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <motion.button
                            type="button"
                            onClick={() => openAddDataModal()}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center text-sm font-medium shadow-md"
                        >
                            <HiPlus className="mr-2 text-lg" /> Tambah Riwayat
                        </motion.button>
                    </div>
                </div>

                {/* Table Section */}
                <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
                >
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Organisasi
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Posisi
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dokumen
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lama Jabatan
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pimpinan
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tempat
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {officialOrganizations.length > 0 ? (
                                officialOrganizations.map((row, index) => (
                                    <motion.tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                        variants={rowVariants}
                                    >
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                                            {row.organization_title}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                                            {row.nama}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                                            {row.posisi}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                                            {row.doc_scan ? (
                                                typeof row.doc_scan === "string" ? (
                                                    <a
                                                        href={row.doc_scan}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                                    >
                                                        <HiDocumentText className="mr-1" />
                                                        Lihat
                                                    </a>
                                                ) : (row.doc_scan instanceof Blob) ? (
                                                    <a
                                                        href={URL.createObjectURL(row.doc_scan)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                                    >
                                                        <HiDocumentText className="mr-1" />
                                                        Lihat
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        -
                                                    </span>
                                                )
                                            ) : (
                                                <span className="text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                                            {calculateDuration(
                                                row.mulai,
                                                row.selesai
                                            )}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                                            {row.pimpinan || "-"}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-800">
                                            {row.tempat || "-"}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <motion.button
                                                    type="button"
                                                    onClick={() =>
                                                        openAddDataModal(index)
                                                    }
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 flex items-center text-xs shadow-sm"
                                                >
                                                    <HiPencil className="mr-1" />{" "}
                                                    Edit
                                                </motion.button>
                                                <motion.button
                                                    type="button"
                                                    onClick={() =>
                                                        removeOrganization(
                                                            index
                                                        )
                                                    }
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 flex items-center text-xs shadow-sm"
                                                >
                                                    <HiTrash className="mr-1" />{" "}
                                                    Hapus
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <motion.tr variants={rowVariants}>
                                    <td
                                        colSpan="8"
                                        className="px-2 py-2 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <HiInformationCircle className="text-4xl mb-2 text-blue-200" />
                                            <p className="text-sm font-medium">
                                                Tidak ada data riwayat
                                                organisasi.
                                            </p>
                                            <motion.button
                                                type="button"
                                                onClick={() =>
                                                    openAddDataModal()
                                                }
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center text-sm font-medium shadow-md"
                                            >
                                                <HiPlus className="mr-2" />{" "}
                                                Tambah Riwayat
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>
            </div>

            {/* Add/Edit Organization Data Modal */}
            <AnimatePresence>
                {isAddDataModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200"
                        >
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <HiUserGroup className="mr-2 text-blue-500" />
                                    {editIndex !== null
                                        ? "Edit Riwayat Organisasi"
                                        : "Tambah Riwayat Organisasi"}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* Organization Type Select */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="col-span-2"
                                    >
                                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <HiOutlineOfficeBuilding className="mr-2 text-blue-500" />
                                            Jenis Organisasi
                                        </label>
                                        <motion.div

                                            variants={inputVariants}
                                        >
                                            <Select
                                                options={organizationOptions}
                                                value={selectedOrganization}
                                                onChange={
                                                    setSelectedOrganization
                                                }
                                                onInputChange={
                                                    setNewOrganizationInput
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter" &&
                                                        newOrganizationInput.trim()
                                                    ) {
                                                        handleAddNewOrganization(
                                                            newOrganizationInput
                                                        );
                                                        event.preventDefault();
                                                    }
                                                }}
                                                placeholder="Pilih Organisasi atau ketik untuk menambahkan baru"
                                                isClearable
                                                isSearchable
                                                noOptionsMessage={() =>
                                                    "Tidak ada opsi, tekan Enter untuk menambahkan"
                                                }
                                                className="basic-single"
                                                classNamePrefix="select"
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: "42px",
                                                        borderColor: "#d1d5db",
                                                        "&:hover": {
                                                            borderColor:
                                                                "#d1d5db",
                                                        },
                                                        borderRadius: "0.5rem",
                                                        boxShadow: "none",
                                                        "&:focus-within": {
                                                            boxShadow:
                                                                "0 0 0 2px rgba(59, 130, 246, 0.5)",
                                                            borderColor:
                                                                "transparent",
                                                        },
                                                    }),
                                                }}
                                            />
                                        </motion.div>
                                    </motion.div>

                                    {/* Organization Name */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <HiUserGroup className="mr-2 text-blue-500" />
                                            Nama Organisasi
                                        </label>
                                        <motion.input
                                            type="text"
                                            name="nama"
                                            value={formData.nama}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Nama"

                                            variants={inputVariants}
                                        />
                                    </motion.div>

                                    {/* Position */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <FaUserTie className="mr-2 text-blue-500" />
                                            Kedudukan/Jabatan
                                        </label>
                                        <motion.input
                                            type="text"
                                            name="posisi"
                                            value={formData.posisi}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Posisi"

                                            variants={inputVariants}
                                        />
                                    </motion.div>

                                    {/* Start Date */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="col-span-1"
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <HiCalendar className="mr-2 text-blue-500" />
                                            Tanggal Mulai
                                        </label>
                                        <motion.input
                                            type="date"
                                            name="mulai"
                                            value={formData.mulai}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                if (!formData.selesai) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        selesai: e.target.value,
                                                    }));
                                                }
                                            }}
                                            max={formData.selesai}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

                                            variants={inputVariants}
                                        />
                                    </motion.div>

                                    {/* End Date */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="col-span-1"
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <HiCalendar className="mr-2 text-blue-500" />
                                            Tanggal Selesai
                                        </label>
                                        <motion.input
                                            type="date"
                                            name="selesai"
                                            value={formData.selesai}
                                            onChange={handleInputChange}
                                            min={formData.mulai}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

                                            variants={inputVariants}
                                        />
                                    </motion.div>

                                    {/* Duration Preview */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="col-span-2"
                                    >
                                        <div className="text-sm text-gray-600 mt-2">
                                            <span className="font-medium">
                                                Durasi:{" "}
                                            </span>
                                            {calculateDuration(
                                                formData.mulai,
                                                formData.selesai
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Leader */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <FaUserTie className="mr-2 text-blue-500" />
                                            Nama Pimpinan
                                        </label>
                                        <motion.input
                                            type="text"
                                            name="pimpinan"
                                            value={formData.pimpinan}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Pimpinan"

                                            variants={inputVariants}
                                        />
                                    </motion.div>

                                    {/* Location */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <HiLocationMarker className="mr-2 text-blue-500" />
                                            Tempat
                                        </label>
                                        <motion.input
                                            type="text"
                                            name="tempat"
                                            value={formData.tempat}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Tempat"

                                            variants={inputVariants}
                                        />
                                    </motion.div>

                                    {/* Document */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.9 }}
                                        className="col-span-2"
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <HiDocumentText className="mr-2 text-blue-500" />
                                            Dokumen
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <motion.input
                                                type="file"
                                                onChange={handleFileUpload}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                accept=".pdf,.jpg,.jpeg,.png"

                                                variants={inputVariants}
                                            />
                                            {formData.docScan && (
                                                <button
                                                    onClick={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            docScan: null,
                                                        }))
                                                    }
                                                    className="p-2 text-red-500 hover:text-red-700"
                                                    title="Hapus dokumen"
                                                >
                                                    <HiTrash />
                                                </button>
                                            )}
                                        </div>
                                        {formData.docScan && (
                                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                                <HiDocumentText className="mr-2" />
                                                <span>
                                                    {formData.docScan.name}
                                                </span>
                                                <span className="ml-2 text-gray-400">
                                                    (
                                                    {(
                                                        formData.docScan.size /
                                                        1024
                                                    ).toFixed(1)}{" "}
                                                    KB)
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Modal Footer */}
                                <div className="mt-6 flex justify-end space-x-3">
                                    <motion.button
                                        type="button"
                                        onClick={closeAddDataModal}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                                    >
                                        <HiX className="mr-2" /> Batal
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        onClick={saveOrganizationData}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center shadow-md"
                                    >
                                        <HiCheck className="mr-2" />
                                        {editIndex !== null
                                            ? "Simpan Perubahan"
                                            : "Simpan"}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
