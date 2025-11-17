import { useEffect, useState, useRef } from "react";
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
    FaMale,
    FaFemale,
    FaChartLine,
    FaDatabase,
    FaCalendarAlt,
    FaLayerGroup,
    FaList
} from "react-icons/fa";
import DataTable from "react-data-table-component";

Chart.register(...registerables);

export default function ContentSection({ regencies }) {
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [selectedRegency, setSelectedRegency] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedVillage, setSelectedVillage] = useState("");
    const [displayData, setDisplayData] = useState([]);
    const [modalData, setModalData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [districtsCache, setDistrictsCache] = useState({});
    const [villagesCache, setVillagesCache] = useState({});
    const [viewMode, setViewMode] = useState("card");
    const educationChartRef = useRef(null);
    const genderChartRef = useRef(null);
    const chartInstances = useRef([]);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isModalOpen]);

    useEffect(() => {
        setDisplayData(regencies);
    }, [regencies]);

    useEffect(() => {
        if (selectedRegency) {
            if (districtsCache[selectedRegency]) {
                setDistricts(districtsCache[selectedRegency]);
                setDisplayData(districtsCache[selectedRegency]);
            } else {
                setIsLoading(true);
                setError(null);
                axios
                    .get(`/member-list/kecamatan/${selectedRegency}`)
                    .then((response) => {
                        const data = response.data;
                        setDistricts(data);
                        setDisplayData(data);
                        setDistrictsCache((prev) => ({
                            ...prev,
                            [selectedRegency]: data,
                        }));
                    })
                    .catch((error) => {
                        console.error("Gagal mengambil data Kecamatan:", error);
                        setError("Gagal memuat data Kecamatan. Silakan coba lagi.");
                    })
                    .finally(() => setIsLoading(false));
            }
        } else {
            setDisplayData(regencies);
            setDistricts([]);
            setVillages([]);
            setSelectedDistrict("");
            setSelectedVillage("");
        }
    }, [selectedRegency, regencies, districtsCache]);

    useEffect(() => {
        if (selectedDistrict) {
            if (villagesCache[selectedDistrict]) {
                setVillages(villagesCache[selectedDistrict]);
                setDisplayData(villagesCache[selectedDistrict]);
            } else {
                setIsLoading(true);
                setError(null);
                axios
                    .get(`/member-list/desa/${selectedDistrict}`)
                    .then((response) => {
                        const data = response.data;
                        setVillages(data);
                        setDisplayData(data);
                        setVillagesCache((prev) => ({
                            ...prev,
                            [selectedDistrict]: data,
                        }));
                    })
                    .catch((error) => {
                        console.error("Gagal mengambil data Desa:", error);
                        setError("Gagal memuat data Desa. Silakan coba lagi.");
                    })
                    .finally(() => setIsLoading(false));
            }
        } else {
            setDisplayData(districts.length > 0 ? districts : regencies);
            setVillages([]);
            setSelectedVillage("");
        }
    }, [selectedDistrict, districts, regencies, villagesCache]);

    useEffect(() => {
        if (selectedVillage) {
            const villageDetail = villages.find(
                (village) => village.code_bps === selectedVillage
            );
            setDisplayData(villageDetail ? [villageDetail] : []);
        } else {
            setDisplayData(
                villages.length > 0
                    ? villages
                    : districts.length > 0
                    ? districts
                    : regencies
            );
        }
    }, [selectedVillage, villages, districts, regencies]);

    useEffect(() => {
        if (isModalOpen && modalData) {
            renderCharts(modalData);
        }

        return () => {
            // Clean up chart instances when component unmounts or modal closes
            chartInstances.current.forEach(chart => {
                if (chart) {
                    chart.destroy();
                }
            });
            chartInstances.current = [];
        };
    }, [isModalOpen, modalData]);

    const openModal = (data) => {
        setModalData(data);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);

        // Clean up chart instances
        chartInstances.current.forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        chartInstances.current = [];
    };

    const renderCharts = (data) => {
        // Clean up existing charts
        chartInstances.current.forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        chartInstances.current = [];

        const educationCtx = document.getElementById("educationChart")?.getContext("2d");
        if (educationCtx && data?.education_totals && Object.keys(data.education_totals).length > 0) {
            const educationChart = new Chart(educationCtx, {
                type: "bar",
                data: {
                    labels: Object.keys(data.education_totals),
                    datasets: [
                        {
                            label: "Pegawai Desa",
                            data: Object.values(data.education_totals),
                            backgroundColor: "rgba(34, 197, 94, 0.3)",
                            borderColor: "rgba(34, 197, 94, 1)",
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    },
                    plugins: {
                        legend: { display: true, position: "top" },
                    },
                },
            });
            chartInstances.current.push(educationChart);
        }

        const genderCtx = document.getElementById("genderChart")?.getContext("2d");
        if (genderCtx && data?.gender_totals && Object.keys(data.gender_totals).length > 0) {
            const genderChart = new Chart(genderCtx, {
                type: "pie",
                data: {
                    labels: Object.keys(data.gender_totals).map((g) =>
                        g === "L" ? "Laki-laki" : "Perempuan"
                    ),
                    datasets: [
                        {
                            label: "Pegawai Desa",
                            data: Object.values(data.gender_totals),
                            backgroundColor: [
                                "rgba(59, 130, 246, 0.3)",
                                "rgba(244, 63, 94, 0.3)",
                            ],
                            borderColor: [
                                "rgba(59, 130, 246, 1)",
                                "rgba(244, 63, 94, 1)",
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: "top" },
                    },
                },
            });
            chartInstances.current.push(genderChart);
        }
    };

    const columns = [
        {
            name: "Nama",
            selector: (row) => row.name_dagri || "-",
            sortable: true,
        },
        {
            name: "Kode",
            selector: (row) => row.code_dagri || "-",
            sortable: true,
        },
        {
            name: "Kecamatan",
            selector: (row) => row.total_districts || 0,
            sortable: true,
        },
        {
            name: "Desa",
            selector: (row) => row.total_villages || 0,
            sortable: true,
        },
        {
            name: "Aksi",
            cell: (row) => (
                <button
                    onClick={() => openModal(row)}
                    className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-all duration-300"
                >
                    <FaChevronRight className="text-green-600" />
                </button>
            ),
        },
    ];

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

    const educationData = modalData && modalData.education_totals
        ? Object.entries(modalData.education_totals).map(
              ([education, total]) => ({
                  category: education,
                  total: total,
              })
          )
        : [];

    const genderData = modalData && modalData.gender_totals
        ? Object.entries(modalData.gender_totals).map(([gender, total]) => ({
              category: gender === "L" ? "Laki-laki" : "Perempuan",
              total: total,
          }))
        : [];

    const calculateRemainingTime = (endDate) => {
        if (!endDate) return "Tidak ditentukan";

        const now = new Date();
        const end = new Date(endDate);
        const diffInMs = end - now;

        if (diffInMs <= 0) {
            return "Masa Jabatan Telah Berakhir";
        }

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
        <section className="relative py-32 min-h-screen text-gray-800">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/assets/images/bg-main.jpg')` }}
            />

            <div className={`absolute inset-0 backdrop-blur-lg bg-white/80 transition-all duration-300 ${isModalOpen ? 'backdrop-blur- bg-white/100' : ''}`} />

            <div className="relative max-w-7xl mx-auto">
                <div className="mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100"
                    >
                        <h2 className="text-3xl font-bold text-green-700 mb-3">Anggota Desa</h2>
                        <nav className="flex mb-4" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-2">
                                <li className="inline-flex items-center">
                                    <a
                                        href="/"
                                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-300"
                                    >
                                        <FaHome className="w-4 h-4 mr-1 text-gray-500" />
                                        Beranda
                                    </a>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <FaChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                                        <span className="text-sm font-medium text-gray-500">Anggota</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-100/90 backdrop-blur-sm text-red-700 p-4 rounded-xl text-center shadow-md"
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-100"
                    >
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <select
                                value={selectedRegency}
                                onChange={(e) => {
                                    setSelectedRegency(e.target.value);
                                    setSelectedDistrict("");
                                    setSelectedVillage("");
                                }}
                                className="w-full border-0 focus:ring-2 focus:ring-green-500 rounded-lg px-4 py-2 bg-white/80 hover:bg-white transition-all duration-300"
                            >
                                <option value="">Pilih Kabupaten</option>
                                {regencies.map((regency) => (
                                    <option key={regency.code_bps} value={regency.code_bps}>
                                        {regency.name_bps}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => {
                                    setSelectedDistrict(e.target.value);
                                    setSelectedVillage("");
                                }}
                                className="w-full border-0 focus:ring-2 focus:ring-green-500 rounded-lg px-4 py-2 bg-white/80 hover:bg-white transition-all duration-300"
                                disabled={!selectedRegency}
                            >
                                <option value="">Pilih Kecamatan</option>
                                {districts.map((district) => (
                                    <option key={district.code_bps} value={district.code_bps}>
                                        {district.name_bps}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedVillage}
                                onChange={(e) => setSelectedVillage(e.target.value)}
                                className="w-full border-0 focus:ring-2 focus:ring-green-500 rounded-lg px-4 py-2 bg-white/80 hover:bg-white transition-all duration-300"
                                disabled={!selectedDistrict}
                            >
                                <option value="">Pilih Desa/Kelurahan</option>
                                {villages.map((village) => (
                                    <option key={village.code_bps} value={village.code_bps}>
                                        {village.name_bps}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode("card")}
                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                        viewMode === "card" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    <FaTable className="text-lg" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg transition-all duration-300 ${
                                        viewMode === "list" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    <FaList className="text-lg" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="container mx-auto py-6"
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-16 gap-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100">
                                <FaSpinner className="animate-spin w-12 h-12 text-green-600" />
                                <p className="text-xl font-semibold text-gray-800">Memuat Data...</p>
                                <p className="text-sm text-gray-500">Harap tunggu sementara kami menyiapkan data.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {displayData.length > 0 ? (
                                    viewMode === "card" ? (
                                        displayData.map((item) => (
                                            <motion.div
                                                key={item.code_bps}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ scale: 1.03, backgroundColor: "rgba(34, 197, 94, 0.05)" }}
                                                className="flex justify-between items-center p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl cursor-pointer transition-all duration-300"
                                                onClick={() => openModal(item)}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-16 h-16 flex items-center justify-center bg-green-50 rounded-full hover:bg-green-100 transition-all duration-300">
                                                        {item.logo_path ? (
                                                            <motion.img
                                                                src={item.logo_path}
                                                                alt={`Logo ${item.name_dagri}`}
                                                                className="w-16 h-16 object-cover rounded-full"
                                                                whileHover={{ scale: 1.1 }}
                                                            />
                                                        ) : (
                                                            <FaBuilding className="w-8 h-8 text-green-600 hover:text-green-700" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h1 className="text-xl font-bold text-gray-800">{item.name_dagri}</h1>
                                                        <p className="text-sm text-gray-600">{item.code_dagri}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 w-[30%]">
                                                    <div className="grid gap-2 w-[80%]">
                                                        {item.total_districts > 0 && (
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                className="flex items-center gap-2 bg-green-50 py-2 px-4 rounded-lg hover:bg-green-100"
                                                            >
                                                                <FaMapMarkerAlt className="w-5 h-5 text-green-600" />
                                                                <div className="flex items-center justify-between w-full">
                                                                    <p className="text-sm text-gray-700">Kecamatan</p>
                                                                    <p className="font-semibold text-green-700">{item.total_districts}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                        {item.total_villages > 0 && (
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                className="flex items-center gap-2 bg-green-50 py-2 px-4 rounded-lg hover:bg-green-100"
                                                            >
                                                                <FaUsers className="w-5 h-5 text-green-600" />
                                                                <div className="flex items-center justify-between w-full">
                                                                    <p className="text-sm text-gray-700">Desa</p>
                                                                    <p className="font-semibold text-green-700">{item.total_villages}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        className="p-3 bg-green-50 rounded-full hover:bg-green-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openModal(item);
                                                        }}
                                                    >
                                                        <FaChevronRight className="w-6 h-6 text-green-600 hover:text-green-700" />
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-100">
                                            <DataTable
                                                columns={columns.map((col) => ({
                                                    ...col,
                                                    sortable: true,
                                                }))}
                                                data={displayData}
                                                pagination
                                                paginationPerPage={50}
                                                paginationRowsPerPageOptions={[50, 100, 500]}
                                                highlightOnHover
                                                striped
                                                responsive
                                                customStyles={{
                                                    headCells: {
                                                        style: {
                                                            backgroundColor: "rgba(34, 197, 94, 0.1)",
                                                            color: "#1f2937",
                                                            fontWeight: "bold",
                                                            fontSize: "14px",
                                                            padding: "16px",
                                                            borderBottom: "2px solid rgba(34, 197, 94, 0.2)",
                                                        },
                                                    },
                                                    cells: {
                                                        style: {
                                                            padding: "16px",
                                                            fontSize: "14px",
                                                            color: "#1f2937",
                                                        },
                                                    },
                                                    rows: {
                                                        style: {
                                                            backgroundColor: "white",
                                                            "&:hover": {
                                                                backgroundColor: "rgba(34, 197, 94, 0.05)",
                                                            },
                                                        },
                                                    },
                                                    pagination: {
                                                        style: {
                                                            borderTop: "1px solid rgba(34, 197, 94, 0.2)",
                                                            padding: "12px",
                                                            backgroundColor: "white",
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    )
                                ) : (
                                    <p className="text-gray-500 text-center bg-white/95 p-6 rounded-2xl shadow-lg border border-gray-100">
                                        Tidak ada data yang dipilih.
                                    </p>
                                )}
                            </div>
                        )}
                    </motion.div>

                    <AnimatePresence>
                        {isModalOpen && modalData && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50 backdrop-blur-sm"
                                onClick={closeModal}
                            >
                                <motion.div
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    className="bg-white/95 border backdrop-blur-sm p-6 rounded-xl w-full max-w-7xl max-h-[90vh] shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center mb-4 px-4">
                                        <h3 className="text-2xl font-bold text-green-700">{modalData.name_bps || modalData.name_dagri}</h3>
                                        <button
                                            onClick={closeModal}
                                            className="text-gray-500 hover:text-gray-700 transition-all duration-300"
                                        >
                                            <FaTimes size={24} />
                                        </button>
                                    </div>
                                    <motion.div className="space-y-6 px-4 max-h-[80vh] overflow-y-auto">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-green-50/80 p-6 rounded-lg border border-green-200 shadow-md">
                                                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700">
                                                    <FaMapMarkerAlt /> Lokasi
                                                </h4>
                                                <p><span className="font-semibold">Nama Dagri:</span> {modalData.name_dagri || "-"}</p>
                                                <p><span className="font-semibold">Nama BPS:</span> {modalData.name_bps || "-"}</p>
                                                <p><span className="font-semibold">Kode BPS:</span> {modalData.code_bps || "-"}</p>
                                                <p><span className="font-semibold">Kode Dagri:</span> {modalData.code_dagri || "-"}</p>
                                            </div>
                                            <div className="bg-blue-50/80 p-6 rounded-lg border border-blue-200 shadow-md">
                                                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
                                                    <FaInfoCircle /> Informasi Umum
                                                </h4>
                                                <p><span className="font-semibold">Total Pejabat:</span> {modalData.total_officials || 0}</p>
                                                <p><span className="font-semibold">Dibuat Pada:</span> {modalData.created_at ? new Date(modalData.created_at).toLocaleDateString() : "-"}</p>
                                                <p><span className="font-semibold">Diperbarui Pada:</span> {modalData.updated_at ? new Date(modalData.updated_at).toLocaleDateString() : "-"}</p>
                                            </div>
                                        </div>
                                        {modalData?.officials?.length > 0 && (
                                            <div className="space-y-4">
                                                <h2 className="text-2xl font-bold mb-4">Perangkat Desa</h2>
                                                {modalData.officials.map((official, index) => {
                                                    const position = official?.positions;
                                                    if (!position) return null;
                                                    return (
                                                        <div
                                                            key={index}
                                                            className="bg-white/80 p-6 rounded-lg shadow-sm border border-gray-100"
                                                        >
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                                                <div>
                                                                    <h3 className="text-xl font-semibold">
                                                                        {official.gelar_depan && `${official.gelar_depan} `}
                                                                        {official.nama_lengkap}
                                                                        {official.gelar_belakang && `, ${official.gelar_belakang}`}
                                                                    </h3>
                                                                    <p className="text-gray-600">{position?.position?.name || "Jabatan tidak tersedia"}</p>
                                                                </div>
                                                                <div className="mt-2 md:mt-0">
                                                                    <span
                                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                            official.jenis_kelamin === "L" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                                                                        }`}
                                                                    >
                                                                        {official.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-500">Tempat/Tanggal Lahir</p>
                                                                    <p>
                                                                        {official.tempat_lahir || "-"}, {official.tanggal_lahir ? new Date(official.tanggal_lahir).toLocaleDateString("id-ID") : "-"}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-500">Agama</p>
                                                                    <p>{official.agama || "-"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-500">Status Perkawinan</p>
                                                                    <p>{official.status_perkawinan || "-"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-500">NIK</p>
                                                                    <p>{official.nik || "-"}</p>
                                                                </div>
                                                            </div>
                                                            <div className="border-t pt-4">
                                                                <h4 className="font-medium text-lg mb-3">Informasi Jabatan</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">Nomor SK</p>
                                                                        <p>{position.nomor_sk || "-"}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">Penetap</p>
                                                                        <p>{position.penetap || "-"}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">Tanggal SK</p>
                                                                        <p>{position.tanggal_sk ? new Date(position.tanggal_sk).toLocaleDateString("id-ID") : "-"}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">TMT Jabatan</p>
                                                                        <p>{position.tmt_jabatan ? new Date(position.tmt_jabatan).toLocaleDateString("id-ID") : "-"}</p>
                                                                    </div>
                                                                    {position.tmt_selesai_jabatan && (
                                                                        <div>
                                                                            <p className="text-sm text-gray-500">Sisa Masa Jabatan</p>
                                                                            <p>{calculateRemainingTime(position.tmt_selesai_jabatan)}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {modalData.education_totals && Object.keys(modalData.education_totals).length > 0 && (
                                            <div className="bg-purple-50/80 p-6 rounded-lg border border-purple-200 shadow-md">
                                                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700">
                                                    <FaGraduationCap /> Pendidikan
                                                </h4>
                                                {Object.values(modalData.education_totals).some(val => val > 0) ? (
                                                    <>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {Object.entries(modalData.education_totals).map(([education, count]) => (
                                                                count > 0 && (
                                                                    <motion.div
                                                                        key={education}
                                                                        whileHover={{ scale: 1.05 }}
                                                                        className="bg-white/80 p-4 rounded-lg shadow-sm border border-gray-100"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="font-medium text-gray-700">{education}</span>
                                                                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                                                {count} pejabat
                                                                            </span>
                                                                        </div>
                                                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                                            <div
                                                                                className="bg-purple-600 h-2 rounded-full"
                                                                                style={{
                                                                                    width: modalData.total_officials > 0
                                                                                        ? `${(count / modalData.total_officials) * 100}%`
                                                                                        : "0%"
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </motion.div>
                                                                )
                                                            ))}
                                                        </div>
                                                        <div className="mt-6">
                                                            <canvas id="educationChart" className="max-h-64" />
                                                        </div>
                                                        <div className="mt-6">
                                                            <DataTable
                                                                columns={educationColumns}
                                                                data={educationData}
                                                                pagination
                                                                highlightOnHover
                                                                responsive
                                                                customStyles={{
                                                                    headCells: {
                                                                        style: {
                                                                            backgroundColor: "rgba(168, 85, 247, 0.1)",
                                                                            color: "#1f2937",
                                                                            fontWeight: "bold",
                                                                            fontSize: "14px",
                                                                            padding: "16px",
                                                                            borderBottom: "2px solid rgba(168, 85, 247, 0.2)",
                                                                        },
                                                                    },
                                                                    cells: {
                                                                        style: {
                                                                            padding: "16px",
                                                                            fontSize: "14px",
                                                                            color: "#1f2937",
                                                                        },
                                                                    },
                                                                    rows: {
                                                                        style: {
                                                                            backgroundColor: "white",
                                                                            "&:hover": {
                                                                                backgroundColor: "rgba(168, 85, 247, 0.05)",
                                                                            },
                                                                        },
                                                                    },
                                                                    pagination: {
                                                                        style: {
                                                                            borderTop: "1px solid rgba(168, 85, 247, 0.2)",
                                                                            padding: "12px",
                                                                            backgroundColor: "white",
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500">
                                                        <FaInfoCircle className="inline-block mr-2" />
                                                        Tidak ada data pendidikan yang tersedia
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {modalData.gender_totals && Object.keys(modalData.gender_totals).length > 0 && (
                                            <motion.div className="bg-blue-50/80 p-6 rounded-lg border border-blue-200 shadow-md">
                                                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
                                                    <FaVenusMars /> Jenis Kelamin
                                                </h4>
                                                {Object.values(modalData.gender_totals).some(val => val > 0) ? (
                                                    <>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                className="bg-white/80 p-4 rounded-lg shadow-sm border border-gray-100"
                                                            >
                                                                <div className="flex items-center mb-2">
                                                                    <FaMale className="text-blue-500 mr-2" />
                                                                    <span className="font-medium">Laki-laki</span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-2xl font-bold text-blue-600">
                                                                        {modalData.gender_totals['L'] || 0}
                                                                    </span>
                                                                    <span className="text-sm text-gray-500">
                                                                        {modalData.total_officials > 0
                                                                            ? Math.round((modalData.gender_totals['L'] / modalData.total_officials) * 100)
                                                                            : 0}%
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                className="bg-white/80 p-4 rounded-lg shadow-sm border border-gray-100"
                                                            >
                                                                <div className="flex items-center mb-2">
                                                                    <FaFemale className="text-pink-500 mr-2" />
                                                                    <span className="font-medium">Perempuan</span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-2xl font-bold text-pink-600">
                                                                        {modalData.gender_totals['P'] || 0}
                                                                    </span>
                                                                    <span className="text-sm text-gray-500">
                                                                        {modalData.total_officials > 0
                                                                            ? Math.round((modalData.gender_totals['P'] / modalData.total_officials) * 100)
                                                                            : 0}%
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                        <div className="mt-6">
                                                            <canvas id="genderChart" className="max-h-64" />
                                                        </div>
                                                        <div className="mt-6">
                                                            <DataTable
                                                                columns={genderColumns}
                                                                data={genderData}
                                                                pagination
                                                                highlightOnHover
                                                                responsive
                                                                customStyles={{
                                                                    headCells: {
                                                                        style: {
                                                                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                                                                            color: "#1f2937",
                                                                            fontWeight: "bold",
                                                                            fontSize: "14px",
                                                                            padding: "16px",
                                                                            borderBottom: "2px solid rgba(59, 130, 246, 0.2)",
                                                                        },
                                                                    },
                                                                    cells: {
                                                                        style: {
                                                                            padding: "16px",
                                                                            fontSize: "14px",
                                                                            color: "#1f2937",
                                                                        },
                                                                    },
                                                                    rows: {
                                                                        style: {
                                                                            backgroundColor: "white",
                                                                            "&:hover": {
                                                                                backgroundColor: "rgba(59, 130, 246, 0.05)",
                                                                            },
                                                                        },
                                                                    },
                                                                    pagination: {
                                                                        style: {
                                                                            borderTop: "1px solid rgba(59, 130, 246, 0.2)",
                                                                            padding: "12px",
                                                                            backgroundColor: "white",
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500">
                                                        <FaInfoCircle className="inline-block mr-2" />
                                                        Tidak ada data jenis kelamin yang tersedia
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
