import { motion, AnimatePresence } from "framer-motion";
import { HiTrash, HiPlus, HiPencil, HiX, HiCheck, HiInformationCircle } from "react-icons/hi";
import { FaChild, FaBirthdayCake, FaVenusMars, FaUserTag, FaGraduationCap, FaBriefcase } from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";

export default function AnakForm({
    anak = [],
    setAnak = () => {},
}) {
    const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false);
    const [nama, setNama] = useState("");
    const [tempat, setTempat] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState("");
    const [status, setStatus] = useState("");
    const [pendidikan, setPendidikan] = useState("");
    const [pekerjaan, setPekerjaan] = useState("");
    const [editIndex, setEditIndex] = useState(null);

    const openAddDataModal = (index = null) => {
        if (index !== null) {
            const anakData = anak[index];
            setNama(anakData.nama);
            setTempat(anakData.tempat);
            setTanggalLahir(anakData.tanggalLahir);
            setJenisKelamin(anakData.jenisKelamin);
            setStatus(anakData.status);
            setPendidikan(anakData.pendidikan);
            setPekerjaan(anakData.pekerjaan);
            setEditIndex(index);
        } else {
            setNama("");
            setTempat("");
            setTanggalLahir("");
            setJenisKelamin("");
            setStatus("");
            setPendidikan("");
            setPekerjaan("");
            setEditIndex(null);
        }
        setIsAddDataModalOpen(true);
    };

    const closeAddDataModal = () => {
        setIsAddDataModalOpen(false);
        setNama("");
        setTempat("");
        setTanggalLahir("");
        setJenisKelamin("");
        setStatus("");
        setPendidikan("");
        setPekerjaan("");
        setEditIndex(null);
    };

    const saveAnakData = () => {
        if (!nama || !tempat || !tanggalLahir || !jenisKelamin || !status || !pendidikan || !pekerjaan) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Harap isi semua field yang diperlukan!",
                iconColor: '#ef4444',
                confirmButtonColor: '#3b82f6',
                background: '#ffffff',
            });
            return;
        }

        const newAnakData = {
            nama,
            tempat,
            tanggalLahir,
            jenisKelamin,
            status,
            pendidikan,
            pekerjaan,
        };

        if (editIndex !== null) {
            const updatedAnak = [...anak];
            updatedAnak[editIndex] = newAnakData;
            setAnak(updatedAnak);
            Swal.fire({
                title: "Berhasil!",
                text: "Data anak berhasil diperbarui.",
                icon: "success",
                iconColor: '#10b981',
                confirmButtonColor: '#3b82f6',
                background: '#ffffff',
            });
        } else {
            setAnak([...anak, newAnakData]);
            Swal.fire({
                title: "Berhasil!",
                text: "Data anak berhasil ditambahkan.",
                icon: "success",
                iconColor: '#10b981',
                confirmButtonColor: '#3b82f6',
                background: '#ffffff',
            });
        }

        closeAddDataModal();
    };

    const removeAnak = (index) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
            background: '#ffffff',
            iconColor: '#f59e0b',
        }).then((result) => {
            if (result.isConfirmed) {
                const newAnak = anak.filter((_, i) => i !== index);
                setAnak(newAnak);
                Swal.fire({
                    title: "Dihapus!",
                    text: "Data telah dihapus.",
                    icon: "success",
                    iconColor: '#10b981',
                    confirmButtonColor: '#3b82f6',
                    background: '#ffffff',
                });
            }
        });
    };

    const tableVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 }
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
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                        >
                            <FaChild className="text-3xl text-blue-500" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                I. DATA ANAK
                            </h1>
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                                <HiInformationCircle className="mr-1 text-blue-500" />
                                Formulir ini digunakan untuk mengisi data anak.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <motion.button
                            type="button"
                            onClick={() => openAddDataModal()}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center text-sm font-medium shadow-md"
                        >
                            <HiPlus className="mr-2 text-lg" /> Tambah Data Anak
                        </motion.button>
                    </div>
                </div>

                {/* Enhanced Table with Animations */}
                <motion.div
                    className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm"
                    variants={tableVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <FaChild className="mr-2" /> Nama Anak
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <FaBirthdayCake className="mr-2" /> Tempat/Tgl. Lahir
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <FaVenusMars className="mr-2" /> Jenis Kelamin
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <FaUserTag className="mr-2" /> Status
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <FaGraduationCap className="mr-2" /> Pendidikan Umum
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <FaBriefcase className="mr-2" /> Pekerjaan
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {anak.length > 0 ? (
                                anak.map((row, index) => (
                                    <motion.tr
                                        key={index}
                                        className="hover:bg-blue-50/50 transition-colors"
                                        variants={rowVariants}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {row.nama}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {`${row.tempat}, ${row.tanggalLahir}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                row.jenisKelamin === "Laki-laki"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-pink-100 text-pink-800"
                                            }`}>
                                                {row.jenisKelamin}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {row.pendidikan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {row.pekerjaan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <motion.button
                                                    type="button"
                                                    onClick={() => openAddDataModal(index)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 flex items-center text-xs shadow-sm"
                                                >
                                                    <HiPencil className="mr-1" /> Edit
                                                </motion.button>
                                                <motion.button
                                                    type="button"
                                                    onClick={() => removeAnak(index)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 flex items-center text-xs shadow-sm"
                                                >
                                                    <HiTrash className="mr-1" /> Hapus
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )))
                                : (
                                    <motion.tr
                                        variants={rowVariants}
                                    >
                                        <td colSpan="7" className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <HiInformationCircle className="text-4xl mb-2 text-blue-200" />
                                                <p className="text-sm font-medium">Tidak ada data anak.</p>
                                                <motion.button
                                                    type="button"
                                                    onClick={() => openAddDataModal()}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center text-sm font-medium shadow-md"
                                                >
                                                    <HiPlus className="mr-2" /> Tambah Data Anak
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )}
                        </tbody>
                    </table>
                </motion.div>
            </div>

            {/* Enhanced Add/Edit Anak Data Modal */}
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
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                        <FaChild className="mr-2 text-blue-500" />
                                        {editIndex !== null ? "Edit Data Anak" : "Tambah Data Anak"}
                                    </h2>
                                    <button
                                        onClick={closeAddDataModal}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <HiX className="text-gray-500 text-xl" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <FaChild className="mr-2 text-blue-500" /> Nama Anak
                                        </label>
                                        <input
                                            type="text"
                                            value={nama}
                                            onChange={(e) => setNama(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Nama Anak"
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <FaBirthdayCake className="mr-2 text-blue-500" /> Tempat/Tgl. Lahir
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={tempat}
                                                onChange={(e) => setTempat(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Tempat"
                                            />
                                            <input
                                                type="date"
                                                value={tanggalLahir}
                                                onChange={(e) => setTanggalLahir(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <FaVenusMars className="mr-2 text-blue-500" /> Jenis Kelamin
                                        </label>
                                        <select
                                            value={jenisKelamin}
                                            onChange={(e) => setJenisKelamin(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                        >
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <FaUserTag className="mr-2 text-blue-500" /> Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                        >
                                            <option value="">Pilih Status</option>
                                            <option value="Anak Kandung">Anak Kandung</option>
                                            <option value="Anak Angkat">Anak Angkat</option>
                                            <option value="Anak Tiri">Anak Tiri</option>
                                        </select>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <FaGraduationCap className="mr-2 text-blue-500" /> Pendidikan Umum
                                        </label>
                                        {/* <input
                                            type="text"
                                            value={pendidikan}
                                            onChange={(e) => setPendidikan(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Pendidikan Umum"
                                        /> */}
                                        <motion.select
                                            value={pendidikan}
                                            onChange={(e) =>
                                                setPendidikan(e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required

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
                                        </motion.select>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <FaBriefcase className="mr-2 text-blue-500" /> Pekerjaan
                                        </label>
                                        <input
                                            type="text"
                                            value={pekerjaan}
                                            onChange={(e) => setPekerjaan(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Pekerjaan"
                                        />
                                    </motion.div>
                                </div>

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
                                        onClick={saveAnakData}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center shadow-md"
                                    >
                                        <HiCheck className="mr-2" /> {editIndex !== null ? "Simpan Perubahan" : "Simpan"}
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
