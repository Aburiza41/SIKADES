import { motion, AnimatePresence } from "framer-motion";
import { HiTrash, HiPlus, HiPencil, HiInformationCircle, HiX, HiCheck,
    HiLocationMarker, HiUserGroup, HiCalendar, HiDocumentText } from "react-icons/hi";
import { FaGraduationCap } from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";

export default function TrainingsForm({ officialTrainings = [], setOfficialTrainings }) {
  // State untuk form
  const [formData, setFormData] = useState({
    nama: "",
    tempat: "",
    pelatihan: "",
    penyelenggara: "",
    nomor: "",
    tanggal: "",
    docScan: null
  });

  const [editIndex, setEditIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: "",
      tempat: "",
      pelatihan: "",
      penyelenggara: "",
      nomor: "",
      tanggal: "",
      docScan: null
    });
    setEditIndex(null);
  };

  // Buka modal
  const openModal = (index = null) => {
    if (index !== null) {
      const training = officialTrainings[index];
      setFormData({
        nama: training.nama,
        tempat: training.tempat,
        pelatihan: training.pelatihan,
        penyelenggara: training.penyelenggara,
        nomor: training.nomor,
        tanggal: training.tanggal,
        docScan: training.docScan || null
      });
      setEditIndex(index);
    }
    setIsModalOpen(true);
  };

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle upload dokumen
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire("Error", "Hanya file PDF, JPEG, atau PNG yang diizinkan", "error");
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "Ukuran file maksimal 5MB", "error");
      return;
    }

    setFormData(prev => ({ ...prev, docScan: file }));
  };

  // Hapus dokumen
  const removeDocument = () => {
    setFormData(prev => ({ ...prev, docScan: null }));
  };

  // Submit form
  const handleSubmit = () => {
    // Validasi
    if (!formData.nama || !formData.tempat || !formData.pelatihan || !formData.penyelenggara) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Harap isi semua field yang diperlukan!",
      });
      return;
    }

    const trainingData = { ...formData };

    if (editIndex !== null) {
      // Update existing data
      const updated = [...officialTrainings];
      updated[editIndex] = trainingData;
      setOfficialTrainings(updated);
    } else {
      // Add new data
      setOfficialTrainings(prev => [...prev, trainingData]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Hapus data
  const deleteTraining = (index) => {
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
        setOfficialTrainings(prev => prev.filter((_, i) => i !== index));
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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <FaGraduationCap className="text-3xl text-blue-500" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                F. RIWAYAT PELATIHAN/BIMBINGAN TEKNIS/SOSIALISASI
              </h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center">
                <HiInformationCircle className="mr-1 text-blue-500" />
                Formulir ini digunakan untuk mengisi riwayat pelatihan pejabat desa.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              type="button"
              onClick={() => openModal()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center text-sm font-medium shadow-md"
            >
              <HiPlus className="mr-2 text-lg" /> Tambah Riwayat
            </motion.button>
          </div>
        </div>

        {/* Data Table */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          initial="hidden"
          animate="visible"
          className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NAMA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TEMPAT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PELATIHAN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PENYELENGGARA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOMOR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TANGGAL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {officialTrainings.length > 0 ? (
                officialTrainings.map((training, index) => (
                  <motion.tr
                    key={index}
                    className="hover:bg-gray-50"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {training.nama}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {training.tempat}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {training.pelatihan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {training.penyelenggara}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {training.nomor || "-"}
                      <a
                            href={URL.createObjectURL(training.docScan)}
                            target="_blank"
                            className="text-blue-500 hover:underline flex items-center"
                          >
                            <HiDocumentText className="mr-1" /> Lihat
                          </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {training.tanggal || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <motion.button
                          type="button"
                          onClick={() => openModal(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 flex items-center text-xs shadow-sm"
                        >
                          <HiPencil className="mr-1" /> Edit
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => deleteTraining(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 flex items-center text-xs shadow-sm"
                        >
                          <HiTrash className="mr-1" /> Hapus
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <HiInformationCircle className="text-4xl mb-2 text-blue-200" />
                      <p className="text-sm font-medium">
                        Tidak ada data riwayat pelatihan.
                      </p>
                      <motion.button
                        type="button"
                        onClick={() => openModal()}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center text-sm font-medium shadow-md"
                      >
                        <HiPlus className="mr-2" /> Tambah Riwayat
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                  <FaGraduationCap className="mr-2 text-blue-500" />
                  {editIndex !== null ? "Edit Riwayat Pelatihan" : "Tambah Riwayat Pelatihan"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Nama */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <HiUserGroup className="mr-2 text-blue-500" /> Nama *
                    </label>
                    <motion.input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nama"
                      required
                      whileFocus="focus"
                    />
                  </motion.div>

                  {/* Tempat */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <HiLocationMarker className="mr-2 text-blue-500" /> Tempat *
                    </label>
                    <motion.input
                      type="text"
                      name="tempat"
                      value={formData.tempat}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Tempat"
                      required
                      whileFocus="focus"
                    />
                  </motion.div>

                  {/* Pelatihan */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <HiCalendar className="mr-2 text-blue-500" /> Pelatihan *
                    </label>
                    <motion.input
                      type="text"
                      name="pelatihan"
                      value={formData.pelatihan}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Pelatihan"
                      required
                      whileFocus="focus"
                    />
                  </motion.div>

                  {/* Penyelenggara */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <HiCalendar className="mr-2 text-blue-500" /> Penyelenggara *
                    </label>
                    <motion.input
                      type="text"
                      name="penyelenggara"
                      value={formData.penyelenggara}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Penyelenggara"
                      required
                      whileFocus="focus"
                    />
                  </motion.div>

                  {/* Nomor */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <HiDocumentText className="mr-2 text-blue-500" /> Nomor
                    </label>
                    <motion.input
                      type="text"
                      name="nomor"
                      value={formData.nomor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nomor"
                      whileFocus="focus"
                    />
                  </motion.div>

                  {/* Tanggal */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <HiCalendar className="mr-2 text-blue-500" /> Tanggal
                    </label>
                    <motion.input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      whileFocus="focus"
                    />
                  </motion.div>

                  {/* Dokumen Scan */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="col-span-2"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <HiDocumentText className="mr-2 text-blue-500" /> Dokumen Scan
                    </label>
                    <div className="flex items-center gap-2">
                      <motion.input
                        type="file"
                        onChange={handleFileUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                        whileFocus="focus"
                      />
                      {formData.docScan && (
                        <button
                          onClick={removeDocument}
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
                        <span>{formData.docScan.name}</span>
                        <span className="ml-2 text-gray-400">
                          ({(formData.docScan.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                  >
                    <HiX className="mr-2" /> Batal
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleSubmit}
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
