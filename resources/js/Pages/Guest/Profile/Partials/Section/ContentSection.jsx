import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import {
    FaTimes,
    FaChartBar,
    FaTable,
    FaSpinner,
    FaMapMarkerAlt,
    FaUsers,
    FaVenusMars,
    FaGraduationCap,
    FaBuilding,
    FaChevronRight,
    FaInfoCircle,
    FaHome,
    FaUserTie,
    FaMale,
    FaFemale, FaChartLine,
    FaDatabase,
    FaCalendarAlt,
    FaLayerGroup
} from "react-icons/fa";
import DataTable from "react-data-table-component";

Chart.register(...registerables);

export default function ContentSection() {
    // State untuk menyimpan data
    const [regencies, setRegencies] = useState([]); // Data Kabupaten
    const [districts, setDistricts] = useState([]); // Data Kecamatan
    const [villages, setVillages] = useState([]); // Data Desa
    const [selectedRegency, setSelectedRegency] = useState(""); // Kabupaten yang dipilih
    const [selectedDistrict, setSelectedDistrict] = useState(""); // Kecamatan yang dipilih
    const [selectedVillage, setSelectedVillage] = useState(""); // Desa yang dipilih
    const [displayData, setDisplayData] = useState([]); // Data yang akan ditampilkan di card
    const [modalData, setModalData] = useState(null); // Data untuk modal
    const [isModalOpen, setIsModalOpen] = useState(false); // State untuk membuka/menutup modal
    const [isLoading, setIsLoading] = useState(false); // State untuk loading

    // Cache untuk menyimpan data yang sudah diambil
    const [districtsCache, setDistrictsCache] = useState({}); // Cache kecamatan
    const [villagesCache, setVillagesCache] = useState({}); // Cache desa

    // Ambil data Kabupaten saat halaman dimuat
    useEffect(() => {
        setIsLoading(true);
        axios
            .get("/profile-village/kabupaten")
            .then((response) => {
                const data = response.data;
                setRegencies(data);
                setDisplayData(data);
            })
            .catch((error) => {
                console.error("Gagal mengambil data Kabupaten:", error);
            })
            .finally(() => setIsLoading(false));
    }, []);

    // Ambil data Kecamatan saat Kabupaten dipilih
    useEffect(() => {
        if (selectedRegency) {
            // Cek apakah data kecamatan sudah ada di cache
            if (districtsCache[selectedRegency]) {
                setDistricts(districtsCache[selectedRegency]); // Gunakan data dari cache
                setDisplayData(districtsCache[selectedRegency]);
            } else {
                setIsLoading(true);
                axios
                    .get(`/profile-village/kecamatan/${selectedRegency}`)
                    .then((response) => {
                        const data = response.data;

                        setDistricts(data);
                        setDisplayData(data);
                        // Simpan data ke cache
                        setDistrictsCache((prev) => ({
                            ...prev,
                            [selectedRegency]: data,
                        }));
                    })
                    .catch((error) => {
                        console.error("Gagal mengambil data Kecamatan:", error);
                    })
                    .finally(() => setIsLoading(false));
            }
        } else {
            setDisplayData(regencies); // Tampilkan data kabupaten jika tidak ada kabupaten yang dipilih
        }
    }, [selectedRegency, regencies, districtsCache]);

    // Ambil data Desa saat Kecamatan dipilih
    useEffect(() => {
        if (selectedDistrict) {
            // Cek apakah data desa sudah ada di cache
            if (villagesCache[selectedDistrict]) {
                setVillages(villagesCache[selectedDistrict]); // Gunakan data dari cache
                setDisplayData(villagesCache[selectedDistrict]);
            } else {
                setIsLoading(true);
                axios
                    .get(`/profile-village/desa/${selectedDistrict}`)
                    .then((response) => {
                        const data = response.data;
                        setVillages(data);
                        setDisplayData(data);
                        // Simpan data ke cache
                        setVillagesCache((prev) => ({
                            ...prev,
                            [selectedDistrict]: data,
                        }));
                    })
                    .catch((error) => {
                        console.error("Gagal mengambil data Desa:", error);
                    })
                    .finally(() => setIsLoading(false));
            }
        } else {
            if (districts.length > 0) {
                setDisplayData(districts); // Tampilkan data kecamatan jika ada
            } else {
                setDisplayData(regencies); // Tampilkan data kabupaten jika tidak ada data kecamatan
            }
        }
    }, [selectedDistrict, districts, regencies, villagesCache]);

    // Tampilkan detail Desa saat Desa dipilih
    useEffect(() => {
        if (selectedVillage) {
            const villageDetail = villages.find(
                (village) => village.code_bps === selectedVillage
            );
            setDisplayData(villageDetail ? [villageDetail] : []); // Tampilkan detail Desa di card
        } else {
            if (villages.length > 0) {
                setDisplayData(villages); // Tampilkan data desa jika ada
            } else if (districts.length > 0) {
                setDisplayData(districts); // Tampilkan data kecamatan jika ada
            } else {
                setDisplayData(regencies); // Tampilkan data kabupaten jika tidak ada data desa atau kecamatan
            }
        }
    }, [selectedVillage, villages, districts, regencies]);

    // Fungsi untuk membuka modal dan menyiapkan data
    const openModal = (data) => {
        setModalData(data);
        setIsModalOpen(true);
    };

    // Fungsi untuk menutup modal
    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
    };

    // Efek untuk menggambar grafik saat modal dibuka
    useEffect(() => {
        if (isModalOpen && modalData) {
            renderCharts(modalData);
        }
    }, [isModalOpen, modalData]);

    // Fungsi untuk menggambar grafik
    const renderCharts = (data) => {
        // Grafik Pendidikan
        const educationCtx = document
            .getElementById("educationChart")
            ?.getContext("2d");
        if (educationCtx) {
            new Chart(educationCtx, {
                type: "bar",
                data: {
                    labels: Object.keys(data?.education_totals || {}),
                    datasets: [
                        {
                            label: "Jumlah Perangkat Desa",
                            data: Object.values(data?.education_totals || {}),
                            backgroundColor: "rgba(153, 102, 255, 0.2)",
                            borderColor: "rgba(153, 102, 255, 1)",
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        }

        // Grafik Jenis Kelamin
        const genderCtx = document
            .getElementById("genderChart")
            ?.getContext("2d");
        if (genderCtx) {
            new Chart(genderCtx, {
                type: "pie",
                data: {
                    labels: Object.keys(data?.gender_totals || {}).map((g) =>
                        g === "L" ? "Laki-laki" : "Perempuan"
                    ),
                    datasets: [
                        {
                            label: "Jumlah Perangkat Desa",
                            data: Object.values(data?.gender_totals || {}),
                            backgroundColor: [
                                "rgba(255, 99, 132, 0.2)",
                                "rgba(54, 162, 235, 0.2)",
                            ],
                            borderColor: [
                                "rgba(255, 99, 132, 1)",
                                "rgba(54, 162, 235, 1)",
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        }
    };

    const educationColumns = [
        {
            name: "Pendidikan",
            selector: (row) => row.category,
            sortable: true,
        },
        {
            name: "Jumlah",
            selector: (row) => row.total,
            sortable: true,
        },
    ];

    const genderColumns = [
        {
            name: "Jenis Kelamin",
            selector: (row) => row.category,
            sortable: true,
        },
        {
            name: "Jumlah",
            selector: (row) => row.total,
            sortable: true,
        },
    ];

    const educationData = modalData
        ? Object.entries(modalData?.education_totals || {}).map(
              ([education, total]) => ({
                  category: education,
                  total: total,
              })
          )
        : [];

    const genderData = modalData
        ? Object.entries(modalData?.gender_totals || {}).map(([gender, total]) => ({
              category: gender === "L" ? "Laki-laki" : "Perempuan",
              total: total,
          }))
        : [];

    return (
        <section className="py-32 text-green-900 min-h-screen bg-gradient-to-b from-green-50 to-white">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Judul dan Deskripsi */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="w-full bg-white rounded-lg shadow-lg p-6 border"
                >
                    <h2 className="text-4xl font-bold mb-2">Profil Desa</h2>
                    <nav className="flex mb-2" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-2">
                            <li className="inline-flex items-center">
                                <a
                                    href="/"
                                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-green-600"
                                >
                                    <FaHome className="w-4 h-4 mr-1 text-gray-500" />
                                    Beranda
                                </a>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <FaChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                                    <span className="text-sm font-medium text-gray-500">
                                        Profil
                                    </span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                    <p className="text-sm text-gray-600 mt-4 text-justify">
                        Profil Desa dalam SIKADES (Sistem Informasi Kumpulan
                        Data Aparatur Desa) berisi data lengkap mengenai
                        struktur pemerintahan desa, informasi kependudukan,
                        serta berbagai aspek pembangunan desa. Sistem ini
                        dirancang untuk menyediakan akses mudah terhadap data
                        aparatur desa, potensi wilayah, serta program dan
                        kegiatan yang sedang berlangsung. Dengan SIKADES,
                        pengelolaan administrasi desa menjadi lebih efisien,
                        transparan, dan dapat diakses oleh masyarakat serta
                        pihak terkait untuk mendukung pembangunan desa yang
                        berkelanjutan.
                    </p>
                </motion.div>

                {/* Card Dropdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="w-full"
                >
                    <div className="flex gap-2 justify-center w-full">
                        <div className="w-full bg-gradient-to-r from-green-50 to-green-100 flex gap-2 p-4 rounded-lg border border-green-200 hover:border-green-300 transition-all duration-300 shadow-md hover:shadow-lg">
                            {/* Dropdown Kabupaten */}
                            <select
                                value={selectedRegency}
                                onChange={(e) => {
                                    setSelectedRegency(e.target.value);
                                    setSelectedDistrict(""); // Reset Kecamatan
                                    setSelectedVillage(""); // Reset Desa
                                }}
                                className="w-full border-0 focus:ring-2 focus:ring-green-500 focus:outline-none rounded-md px-3 py-2 transition-all duration-300 bg-white"
                            >
                                <option value="">Pilih Kabupaten</option>
                                {regencies.map((regency) => (
                                    <option
                                        key={regency.code_bps}
                                        value={regency.code_bps}
                                    >
                                        {regency.name_bps}
                                    </option>
                                ))}
                            </select>

                            {/* Dropdown Kecamatan */}
                            <select
                                value={selectedDistrict}
                                onChange={(e) => {
                                    setSelectedDistrict(e.target.value);
                                    setSelectedVillage(""); // Reset Desa
                                }}
                                className="w-full border-0 focus:ring-2 focus:ring-green-500 focus:outline-none rounded-md px-3 py-2 transition-all duration-300 bg-white"
                                disabled={!selectedRegency} // Nonaktifkan jika Kabupaten belum dipilih
                            >
                                <option value="">Pilih Kecamatan</option>
                                {districts.map((district) => (
                                    <option
                                        key={district.code_bps}
                                        value={district.code_bps}
                                    >
                                        {district.name_bps}
                                    </option>
                                ))}
                            </select>

                            {/* Dropdown Desa */}
                            <select
                                value={selectedVillage}
                                onChange={(e) =>
                                    setSelectedVillage(e.target.value)
                                }
                                className="w-full border-0 focus:ring-2 focus:ring-green-500 focus:outline-none rounded-md px-3 py-2 transition-all duration-300 bg-white"
                                disabled={!selectedDistrict} // Nonaktifkan jika Kecamatan belum dipilih
                            >
                                <option value="">Pilih Desa/Kelurahan</option>
                                {villages.map((village) => (
                                    <option
                                        key={village.code_bps}
                                        value={village.code_bps}
                                    >
                                        {village.name_bps}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Card untuk Menampilkan Data */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="w-full"
                >
                    <div>
                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center p-16 gap-4 text-gray-900">
                                {/* Spinner dengan animasi dan ukuran lebih besar */}
                                <FaSpinner className="animate-spin text-5xl text-green-600" />

                                {/* Teks Loading dengan animasi dan styling */}
                                <p className="text-xl font-semibold text-gray-700 animate-pulse">
                                    Memuat Data...
                                </p>

                                {/* Pesan tambahan untuk memberikan kesan lebih interaktif */}
                                <p className="text-sm text-gray-500">
                                    Harap tunggu sebentar, kami sedang
                                    menyiapkan data untuk Anda.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 text-left">
                                {displayData.length > 0 ? (
                                    displayData.map((item) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                            viewport={{ once: true }}
                                            key={item.code_bps}
                                            whileHover={{ scale: 1.02 }}
                                            className="flex justify-between items-center p-6 bg-white border rounded-lg shadow-lg hover:shadow-xl cursor-pointer hover:bg-gradient-to-r hover:from-green-700 hover:to-green-800 hover:text-white transition-all duration-300"
                                            onClick={() => openModal(item)}
                                        >
                                            {/* Bagian Kiri: Logo dan Nama Kabupaten */}
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="flex items-center space-x-4"
                                            >
                                                {/* Logo atau Ikon Kabupaten */}
                                                <div className="relative w-16 h-16 flex items-center justify-center bg-green-100 rounded-full hover:bg-green-200 transition-all duration-300">
                                                    {item.logo_path ? (
                                                        <motion.img
                                                            src={item.logo_path}
                                                            alt={`Logo ${item.name_dagri}`}
                                                            className="w-16 h-16 object-cover rounded-full hover:scale-110 transition-all duration-300"
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                        />
                                                    ) : (
                                                        <FaBuilding className="text-2xl text-green-600 hover:text-green-700 transition-all duration-300" />
                                                    )}
                                                </div>

                                                {/* Judul Kabupaten */}
                                                <div>
                                                    <h1 className="text-xl font-bold text-gray-800 hover:text-white transition-all duration-300">
                                                        {item.name_dagri}
                                                    </h1>
                                                    <p className="text-sm text-gray-600 hover:text-gray-200 transition-all duration-300">
                                                        {item.code_dagri}
                                                    </p>
                                                </div>
                                            </motion.div>

                                            {/* Bagian Tengah: Informasi Statistik */}
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.5,
                                                    delay: 0.2,
                                                }}
                                                className="flex justify-between items-center space-x-4 w-[30%]"
                                            >
                                                <div className="grid gap-2 w-[80%]">
                                                    {/* Total Kecamatan */}
                                                    {item.total_districts >
                                                        0 && (
                                                        <motion.div
                                                            whileHover={{
                                                                scale: 1.05,
                                                            }}
                                                            transition={{
                                                                duration: 0.2,
                                                            }}
                                                            className="flex items-center gap-2 w-full bg-green-100 py-2 px-4 rounded-lg hover:bg-green-200 transition-all duration-300"
                                                        >
                                                            <FaMapMarkerAlt className="text-lg text-green-600" />
                                                            <div className="flex items-center justify-between gap-2 w-full">
                                                                <p className="text-sm text-gray-700 hover:text-gray-900 transition-all duration-300">
                                                                    Kecamatan
                                                                </p>
                                                                <p className="font-semibold text-green-700 hover:text-green-900 transition-all duration-300">
                                                                    {
                                                                        item.total_districts
                                                                    }
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {/* Total Desa */}
                                                    {item.total_villages >
                                                        0 && (
                                                        <motion.div
                                                            whileHover={{
                                                                scale: 1.05,
                                                            }}
                                                            transition={{
                                                                duration: 0.2,
                                                            }}
                                                            className="flex items-center gap-2 w-full bg-green-100 py-2 px-4 rounded-lg hover:bg-green-200 transition-all duration-300"
                                                        >
                                                            <FaUsers className="text-lg text-green-600" />
                                                            <div className="flex items-center justify-between gap-2 w-full">
                                                                <p className="text-sm text-gray-700 hover:text-gray-900 transition-all duration-300">
                                                                    Desa
                                                                </p>
                                                                <p className="font-semibold text-green-700 hover:text-green-900 transition-all duration-300">
                                                                    {
                                                                        item.total_villages
                                                                    }
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {/* Bagian Kanan: Tombol untuk Menampilkan Modal */}
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{
                                                        duration: 0.2,
                                                    }}
                                                    className="flex items-center justify-center p-3 bg-green-100 rounded-full hover:bg-green-200 transition-all duration-300"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Mencegah event bubbling ke parent
                                                        openModal(item);
                                                    }}
                                                >
                                                    <FaChevronRight className="text-2xl text-green-600 hover:text-green-700 transition-all duration-300" />
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">
                                        Tidak ada data yang dipilih.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Modal untuk Menampilkan Grafik dan Tabel */}
                <AnimatePresence>
                    {isModalOpen && modalData && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-start justify-center pt-20 shadow-lg"
                        >
                            <motion.div
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -50, opacity: 0 }}
    className="bg-white p-6 rounded-lg w-full max-w-5xl max-h-[80vh]"
>
    {/* Header Modal */}
    <div className="flex justify-between items-center mb-3 px-5">
        <h3 className="text-2xl font-bold">
            Profil {modalData.name_bps}
        </h3>
        <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 transition-all duration-300"
        >
            <FaTimes size={24} />
        </button>
    </div>

    <div className="max-h-[65vh] overflow-y-auto p-5">
        {/* Informasi Umum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-md">
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt /> Lokasi
                </h4>
                <p className="text-gray-700">
                    <span className="font-semibold">Nama Dagri:</span> {modalData.name_dagri}
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Nama BPS:</span> {modalData.name_bps}
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Kode BPS:</span> {modalData.code_bps}
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Kode Dagri:</span> {modalData.code_dagri}
                </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-md">
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaInfoCircle /> Informasi Umum
                </h4>
                <p className="text-gray-700">
                    <span className="font-semibold">Total Perangkat:</span> {modalData.total_officials || 0}
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Dibuat Pada:</span> {new Date(modalData.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Diperbarui Pada:</span> {new Date(modalData.updated_at).toLocaleDateString()}
                </p>
            </div>
        </div>

        {/* Data Pendidikan Perangkat */}
        {modalData.education_totals && (
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 shadow-md mt-6">
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaGraduationCap /> Pendidikan Perangkat Desa
                </h4>

                {Object.values(modalData.education_totals).some(val => val > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(modalData.education_totals).map(([education, count]) => (
                            count > 0 && (
                                <div key={education} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">{education}</span>
                                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                                            {count} orang
                                        </span>
                                    </div>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: `${(count / modalData.total_officials) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500">
                        <FaInfoCircle className="inline-block mr-2" />
                        Data pendidikan perangkat tidak tersedia
                    </div>
                )}
            </div>
        )}

        {/* Data Gender Perangkat */}
        {modalData.gender_totals && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-md mt-6">
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaVenusMars /> Gender Perangkat Desa
                </h4>

                {Object.values(modalData.gender_totals).some(val => val > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Laki-laki */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center mb-2">
                                <FaMale className="text-blue-500 mr-2" />
                                <span className="font-medium">Laki-laki</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-blue-600">
                                    {modalData.gender_totals['L'] || 0}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {Math.round((modalData.gender_totals['L'] / modalData.total_officials) * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Perempuan */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center mb-2">
                                <FaFemale className="text-pink-500 mr-2" />
                                <span className="font-medium">Perempuan</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-pink-600">
                                    {modalData.gender_totals['P'] || 0}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {Math.round((modalData.gender_totals['P'] / modalData.total_officials) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500">
                        <FaInfoCircle className="inline-block mr-2" />
                        Data gender perangkat tidak tersedia
                    </div>
                )}
            </div>
        )}

        {/* Informasi IDM Terbaru */}
        {modalData.village_idm_latest ? (
            <div className="space-y-6 mt-6">
                {/* Ringkasan Utama */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <FaChartLine />
                            <span className="font-medium">Skor IDM</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-bold">
                                {modalData.village_idm_latest.score_idm}
                            </span>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                modalData.village_idm_latest.score_idm >= 80 ? 'bg-green-100 text-green-800' :
                                modalData.village_idm_latest.score_idm >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {modalData.village_idm_latest.status_idm}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 shadow-sm">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <FaCalendarAlt />
                            <span className="font-medium">Tahun</span>
                        </div>
                        <span className="text-3xl font-bold">
                            {modalData.village_idm_latest.year}
                        </span>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <FaLayerGroup />
                            <span className="font-medium">Klasifikasi</span>
                        </div>
                        <span className="text-xl font-semibold capitalize">
                            {modalData.village_idm_latest.classification}
                        </span>
                    </div>
                </div>

                {/* Detail Skor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FaChartBar className="text-blue-500" />
                            Skor Prodeskel
                        </h4>
                        <div className="flex items-center gap-4">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-blue-600 h-4 rounded-full"
                                    style={{ width: `${modalData.village_idm_latest.score_prodeskel}%` }}
                                ></div>
                            </div>
                            <span className="font-bold text-blue-600 whitespace-nowrap">
                                {modalData.village_idm_latest.score_prodeskel}%
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FaChartBar className="text-green-500" />
                            Skor Epdeskel
                        </h4>
                        <div className="flex items-center gap-4">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-green-600 h-4 rounded-full"
                                    style={{ width: `${modalData.village_idm_latest.score_epdeskel}%` }}
                                ></div>
                            </div>
                            <span className="font-bold text-green-600 whitespace-nowrap">
                                {modalData.village_idm_latest.score_epdeskel}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status dan Keterangan */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaInfoCircle className="text-yellow-600" />
                        Status Pengembangan
                    </h4>
                    <p className="text-gray-700">
                        {modalData.village_idm_latest.status || 'Tidak ada informasi status'}
                    </p>
                </div>
            </div>
        ) : (
            <div className="text-center py-8">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
                    <FaDatabase className="text-gray-400 text-2xl" />
                </div>
                <h4 className="text-lg font-medium text-gray-600 mb-1">
                    Data IDM Tidak Tersedia
                </h4>
                <p className="text-gray-500 text-sm">
                    Desa ini belum memiliki data Indeks Desa Membangun
                </p>
            </div>
        )}

    </div>
</motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
