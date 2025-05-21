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
} from "react-icons/fa";
import DataTable from "react-data-table-component";

Chart.register(...registerables);

export default function ContentSection({ regencies }) {
    // State untuk menyimpan data
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

    // Gunakan regencies langsung dari prop
    useEffect(() => {
        setDisplayData(regencies); // Tampilkan semua Kabupaten di card saat komponen dimuat
    }, [regencies]);

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
                    .get(`/member-list/kecamatan/${selectedRegency}`)
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
                    .get(`/member-list/desa/${selectedDistrict}`)
                    .then((response) => {
                        const data = response.data;
                        // console.log(response);
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
            .getContext("2d");
        new Chart(educationCtx, {
            type: "bar",
            data: {
                labels: Object.keys(data.education_totals),
                datasets: [
                    {
                        label: "Jumlah Perangkat Desa",
                        data: Object.values(data.education_totals),
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

        // Grafik Jenis Kelamin
        const genderCtx = document
            .getElementById("genderChart")
            .getContext("2d");
        new Chart(genderCtx, {
            type: "pie",
            data: {
                labels: Object.keys(data.gender_totals).map((g) =>
                    g === "L" ? "Laki-laki" : "Perempuan"
                ),
                datasets: [
                    {
                        label: "Jumlah Perangkat Desa",
                        data: Object.values(data.gender_totals),
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
        ? Object.entries(modalData.education_totals).map(
              ([education, total]) => ({
                  category: education,
                  total: total,
              })
          )
        : [];

    const genderData = modalData
        ? Object.entries(modalData.gender_totals).map(([gender, total]) => ({
              category: gender === "L" ? "Laki-laki" : "Perempuan",
              total: total,
          }))
        : [];

    const calculateRemainingTime = (endDate) => {
        const now = new Date(); // Tanggal saat ini
        const end = new Date(endDate); // Tanggal selesai menjabat
        const diffInMs = end - now; // Selisih waktu dalam milidetik

        if (diffInMs <= 0) {
            return "Masa Jabatan Telah Berakhir";
        }

        // Hitung sisa waktu dalam hari, bulan, dan tahun
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInMonths / 12);

        if (diffInYears > 0) {
            return `${diffInYears} tahun ${diffInMonths % 12} bulan`;
        } else if (diffInMonths > 0) {
            return `${diffInMonths} bulan ${diffInDays % 30} hari`;
        } else {
            return `${diffInDays} hari`;
        }
    };

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
                    <h2 className="text-4xl font-bold mb-2">Anggota Desa</h2>
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
                                        Anggota
                                    </span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                    <p className="text-sm text-gray-600 mt-4 text-justify">
                        Anggota desa atau aparatur desa dalam SIKADES terdiri
                        dari kepala desa, perangkat desa, serta lembaga
                        masyarakat yang berperan dalam pemerintahan dan
                        pembangunan desa. Mereka bertanggung jawab dalam
                        administrasi, pelayanan masyarakat, serta pengelolaan
                        sumber daya desa. Melalui SIKADES, pencatatan dan akses
                        informasi terkait struktur pemerintahan, kependudukan,
                        serta program desa menjadi lebih efisien dan transparan.
                        Sistem ini mempermudah pengelolaan administrasi,
                        memastikan akurasi data, serta meningkatkan keterlibatan
                        masyarakat dalam pembangunan desa secara berkelanjutan.
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
                                <div className="flex justify-between items-center px-5">
                                    <h3 className="text-2xl font-bold">
                                        Anggota {modalData.name_bps}
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
                                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-md">
                                            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                                <FaMapMarkerAlt /> Lokasi
                                            </h4>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">
                                                    Nama Dagri:
                                                </span>{" "}
                                                {modalData.name_dagri}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">
                                                    Nama BPS:
                                                </span>{" "}
                                                {modalData.name_bps}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">
                                                    Kode BPS:
                                                </span>{" "}
                                                {modalData.code_bps}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">
                                                    Kode Dagri:
                                                </span>{" "}
                                                {modalData.code_dagri}
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-md">
                                            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                                <FaInfoCircle /> Informasi Umum
                                            </h4>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">
                                                    Total Kecamatan:
                                                </span>{" "}
                                                {modalData.total_districts}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">
                                                    Total Desa:
                                                </span>{" "}
                                                {modalData.total_villages}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">
                                                    Total Pejabat:
                                                </span>{" "}
                                                {modalData.total_officials}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">
                                                    Dibuat Pada:
                                                </span>{" "}
                                                {new Date(
                                                    modalData.created_at
                                                ).toLocaleDateString()}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-semibold">
                                                    Diperbarui Pada:
                                                </span>{" "}
                                                {new Date(
                                                    modalData.updated_at
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div> */}

                                    {/* Perangkat Desa / Official - Tampilkan jika ada data officials */}
                                    {modalData?.officials?.length > 0 && (
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-bold mb-4">
                                                Perangkat Desa
                                            </h2>

                                            {modalData.officials.map(
                                                (official, index) => {
                                                    const position =
                                                        official?.positions;

                                                    // Skip jika tidak ada data position
                                                    if (!position) return null;

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="bg-white rounded-lg shadow p-6 border border-gray-100"
                                                        >
                                                            {/* Header dengan nama dan gelar */}
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                                                <div>
                                                                    <h3 className="text-xl font-semibold">
                                                                        {official.gelar_depan &&
                                                                            `${official.gelar_depan} `}
                                                                        {
                                                                            official.nama_lengkap
                                                                        }
                                                                        {official.gelar_belakang &&
                                                                            `, ${official.gelar_belakang}`}
                                                                    </h3>
                                                                    <p className="text-gray-600">
                                                                        {position
                                                                            ?.position
                                                                            ?.name ||
                                                                            "Jabatan tidak tersedia"}
                                                                    </p>
                                                                </div>

                                                                <div className="mt-2 md:mt-0">
                                                                    <span
                                                                        className={`px-3 py-1 rounded-full text-sm font-medium
                                ${
                                    official.jenis_kelamin === "L"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-pink-100 text-pink-800"
                                }`}
                                                                    >
                                                                        {official.jenis_kelamin ===
                                                                        "L"
                                                                            ? "Laki-laki"
                                                                            : "Perempuan"}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Informasi pribadi */}
                                                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        Tempat/Tanggal
                                                                        Lahir
                                                                    </p>
                                                                    <p>
                                                                        {
                                                                            official.tempat_lahir
                                                                        }
                                                                        ,{" "}
                                                                        {new Date(
                                                                            official.tanggal_lahir
                                                                        ).toLocaleDateString(
                                                                            "id-ID"
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        Agama
                                                                    </p>
                                                                    <p>
                                                                        {
                                                                            official.agama
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        Status
                                                                        Perkawinan
                                                                    </p>
                                                                    <p>
                                                                        {
                                                                            official.status_perkawinan
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        NIK
                                                                    </p>
                                                                    <p>
                                                                        {
                                                                            official.nik
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div> */}

                                                            {/* Informasi jabatan */}
                                                            {/* <div className="border-t pt-4">
                                                                <h4 className="font-medium text-lg mb-3">
                                                                    Informasi
                                                                    Jabatan
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Nomor
                                                                            SK
                                                                        </p>
                                                                        <p>
                                                                            {position.nomor_sk ||
                                                                                "-"}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Penetap
                                                                        </p>
                                                                        <p>
                                                                            {position.penetap ||
                                                                                "-"}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Tanggal
                                                                            SK
                                                                        </p>
                                                                        <p>
                                                                            {position.tanggal_sk
                                                                                ? new Date(
                                                                                      position.tanggal_sk
                                                                                  ).toLocaleDateString(
                                                                                      "id-ID"
                                                                                  )
                                                                                : "-"}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            TMT
                                                                            Jabatan
                                                                        </p>
                                                                        <p>
                                                                            {position.tmt_jabatan
                                                                                ? new Date(
                                                                                      position.tmt_jabatan
                                                                                  ).toLocaleDateString(
                                                                                      "id-ID"
                                                                                  )
                                                                                : "-"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div> */}
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}

                                    {/* Grid untuk Grafik dan Tabel */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        {/* Card Grafik Pendidikan */}
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg"
                                        >
                                            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                                <FaChartBar /> Pendidikan
                                            </h4>
                                            <div className="h-48">
                                                <canvas id="educationChart"></canvas>
                                            </div>
                                        </motion.div>

                                        {/* Card Grafik Jenis Kelamin */}
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:border-purple-300 shadow-md hover:shadow-lg"
                                        >
                                            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                                <FaChartBar /> Jenis Kelamin
                                            </h4>
                                            <div className="h-48">
                                                <canvas id="genderChart"></canvas>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Grid untuk Tabel */}
                                    <div className="grid grid-cols-1 gap-6 mt-6">
                                        {/* Card Tabel Pendidikan */}
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg"
                                        >
                                            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                                <FaTable /> Pendidikan
                                            </h4>
                                            <DataTable
                                                columns={educationColumns}
                                                data={educationData}
                                                pagination
                                                highlightOnHover
                                                responsive
                                            />
                                        </motion.div>

                                        {/* Card Tabel Jenis Kelamin */}
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:border-purple-300 shadow-md hover:shadow-lg"
                                        >
                                            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                                <FaTable /> Jenis Kelamin
                                            </h4>
                                            <DataTable
                                                columns={genderColumns}
                                                data={genderData}
                                                pagination
                                                highlightOnHover
                                                responsive
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
