import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import OfficialList from "./Partials/Component/List";
import { HiUsers } from "react-icons/hi";
import Modal from "./Partials/Section/Modal";
import OfficialPDF from "./Partials/Component/PDF";
import { FiPrinter } from "react-icons/fi";
import {
    FiUser,
    FiHome,
    FiMail,
    FiPhone,
    FiFileText,
    FiMapPin,
    FiCalendar,
    FiDroplet,
    FiAward,
    FiBriefcase,
    FiX,
    FiChevronDown,
    FiChevronUp,
    FiImage,
    FiClock,
} from "react-icons/fi";
import {
    FaCity,
    FaBuilding,
    FaHome,
    FaUsers,
    FaInfoCircle,
} from "react-icons/fa";
import { MdTableChart } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import DataTable from "react-data-table-component";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Ambil token CSRF
const csrfToken =
    document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

export default function Official({
    initialOfficials,
    officials,
    role,
    position,
    selectFilteredOfficials,
    status_pejabat,
    trainings,
    jenis_kelamin,
    pendidikan,
    jabatan,
    organizations,
    agama,
    golongan_darah,
    status_perkawinan,
    official_count,
    total_posisi,
    total_terisi,
    kelengkapan_data,
    regency,
    districts,
    villages,
}) {
    const { flash } = usePage().props;
    const [officialsData, setOfficialsData] = useState(initialOfficials);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedOfficial, setSelectedOfficial] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [tableData1, setTableData1] = useState([]);
    const [filters, setFilters] = useState({
        search: "",
        kecamatan: "",
        desa: "",
        education: "",
        position: "",
        gender: "",
        religion: "",
        blood_type: "",
        training: "",
        organization: "",
        status: "",
    });
    const [kecamatan, setKecamatan] = useState([]);
    const [desa, setDesa] = useState([]);
    const [sortField, setSortField] = useState("");
    const [sortDirection, setSortDirection] = useState("");
    const [newOfficial, setNewOfficial] = useState({
        village_id: "",
        nik: "",
        niad: "",
        nama_lengkap: "",
        gelar_depan: "",
        gelar_belakang: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        jenis_kelamin: "",
        status_perkawinan: "",
        agama: "",
        alamat: "",
        rt: "",
        rw: "",
        regency_code: "",
        regency_name: "",
        district_code: "",
        district_name: "",
        village_code: "",
        village_name: "",
        handphone: "",
        gol_darah: "",
        pendidikan: "",
        bpjs_kesehatan: "",
        bpjs_ketenagakerjaan: "",
        npwp: "",
        status: "",
    });

    // Disable scroll when modal is open
    useEffect(() => {
        if (isModalOpen || isViewMode || modalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isModalOpen, isViewMode, modalOpen]);

    // Fetch kecamatan on mount
    useEffect(() => {
        fetch(`/local/districts/${regency.code_bps}`, {
            headers: {
                'Accept': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setKecamatan(data.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching kecamatan:", error);
            });
    }, [regency.code_bps]);

    // Fetch desa when kecamatan changes
    useEffect(() => {
        if (filters.kecamatan) {
            fetch(`/local/villages/${filters.kecamatan}`, {
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setDesa(data.data);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching desa:", error);
                });
        } else {
            setDesa([]);
            setFilters((prev) => ({ ...prev, desa: "" }));
        }
    }, [filters.kecamatan]);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) Swal.fire("Success", flash.success, "success");
        if (flash?.error) Swal.fire("Error", flash.error, "error");
    }, [flash]);

    // Data untuk chart
    const educationData = {
        labels: Object.keys(pendidikan),
        datasets: [
            {
                label: "Jumlah",
                data: Object.values(pendidikan),
                borderColor: "#4CAF50",
                pointBackgroundColor: "#4CAF50",
                tension: 0.1,
                backgroundColor: "rgba(76, 175, 80, 0.2)",
            },
        ],
    };

    const officialStatusData = {
        labels: ["Daftar", "Diproses", "Tervalidasi", "Ditolak"],
        datasets: [
            {
                label: "Status",
                data: status_pejabat,
                backgroundColor: ["#4CAF50", "#FFC107", "#2196F3", "#F44336"],
                borderColor: "#FFFFFF",
                borderWidth: 2,
            },
        ],
    };

    const genderData = {
        labels: ["Laki-Laki", "Perempuan"],
        datasets: [
            {
                label: "Jenis Kelamin",
                data: jenis_kelamin,
                backgroundColor: ["#2196F3", "#E91E63"],
                borderColor: "#FFFFFF",
                borderWidth: 2,
            },
        ],
    };

    const generateColors = (count, baseColors) => {
        return Array(count)
            .fill()
            .map((_, i) => baseColors[i % baseColors.length]);
    };

    const trainingsData = {
        labels: Object.keys(trainings),
        datasets: [
            {
                label: "Jumlah",
                data: Object.values(trainings),
                backgroundColor: generateColors(Object.keys(trainings).length, [
                    "#4CAF50",
                    "#FFC107",
                    "#2196F3",
                    "#F44336",
                    "#9C27B0",
                    "#00BCD4",
                    "#FF9800",
                    "#8BC34A",
                    "#E91E63",
                    "#607D8B",
                ]),
                borderColor: "#FFFFFF",
                borderWidth: 2,
            },
        ],
    };

    const organizationsData = {
        labels: Object.keys(organizations),
        datasets: [
            {
                label: "Jumlah",
                data: Object.values(organizations),
                backgroundColor: generateColors(Object.keys(organizations).length, [
                    "#4CAF50",
                    "#2196F3",
                    "#9C27B0",
                    "#FF9800",
                    "#607D8B",
                    "#F44336",
                    "#00BCD4",
                    "#8BC34A",
                    "#E91E63",
                    "#795548",
                ]),
                borderColor: "#FFFFFF",
                borderWidth: 2,
            },
        ],
    };

    const religionData = {
        labels: ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", "Kosong"],
        datasets: [
            {
                label: "Jumlah",
                data: agama,
                backgroundColor: [
                    "#4CAF50",
                    "#2196F3",
                    "#9C27B0",
                    "#FF9800",
                    "#607D8B",
                    "#F44336",
                    "#795548",
                ],
                borderColor: "#FFFFFF",
                borderWidth: 2,
            },
        ],
    };

    const bloodTypeData = {
        labels: ["A", "B", "AB", "O", "Kosong"],
        datasets: [
            {
                label: "Jumlah",
                data: golongan_darah,
                backgroundColor: ["#F44336", "#2196F3", "#4CAF50", "#FFC107", "#795548"],
                borderColor: "#FFFFFF",
                borderWidth: 2,
            },
        ],
    };

    const positionData = {
        labels: Object.keys(jabatan),
        datasets: [
            {
                label: "Jumlah",
                data: Object.values(jabatan),
                backgroundColor: generateColors(Object.keys(jabatan).length, [
                    "#4CAF50",
                    "#2196F3",
                    "#9C27B0",
                    "#FF9800",
                    "#607D8B",
                    "#F44336",
                    "#00BCD4",
                    "#8BC34A",
                    "#E91E63",
                    "#795548",
                ]),
                borderColor: "#FFFFFF",
                borderWidth: 2,
            },
        ],
    };

    const maritalStatusData = {
        labels: ["Belum Kawin", "Kawin", "Duda", "Janda", "Kosong"],
        datasets: [
            {
                label: "Jumlah",
                data: status_perkawinan,
                backgroundColor: ["#2196F3", "#4CAF50", "#FF9800", "#E91E63", "#795548"],
                borderColor: "#FFFFFF",
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top", labels: { color: "#333333" } },
            title: { display: true, color: "#333333", font: { size: 18 } },
        },
    };

    const column1s = [
        { name: "ID", selector: (row) => row.id, sortable: true, width: "80px" },
        { name: "Kategori", selector: (row) => row.kategori, sortable: true },
        { name: "Jumlah", selector: (row) => row.jumlah, sortable: true },
    ];

    // Fetch data from the server
    const fetchData = ({
        page = 1,
        perPage = 10,
        search = filters.search,
        filters: filterParams = JSON.stringify(filters),
        sortField: sort = sortField,
        sortDirection: direction = sortDirection,
    }) => {
        setLoading(true);
        router.get(
            `/regency/official/${role}`,
            {
                page,
                per_page: perPage,
                search,
                filters: filterParams,
                sort_field: sort,
                sort_direction: direction,
            },
            {
                preserveState: true,
                replace: true,
                onSuccess: (page) => {
                    setOfficialsData(page.props.officials);
                    setLoading(false);
                },
                onError: () => {
                    Swal.fire(
                        "Error",
                        "Failed to fetch data. Please try again.",
                        "error"
                    );
                    setLoading(false);
                },
            }
        );
    };

    // Handle view official
    const handleView = (official) => {
        setSelectedOfficial(official);
        setIsEdit(false);
        setIsViewMode(true);
        setIsModalOpen(true);
    };

    // Handle print official
    const handlePrint = (official) => {
        const data = {
            nama_lengkap: official.nama_lengkap,
            nik: official.nik,
            niad: official.niad,
            tempat_lahir: official.tempat_lahir,
            tanggal_lahir: official.tanggal_lahir,
            jenis_kelamin: official.jenis_kelamin,
            status_perkawinan: official.status_perkawinan,
            agama: official.agama,
            alamat: official.alamat,
            handphone: official.handphone,
            gol_darah: official.gol_darah,
            pendidikan: official.pendidikan,
            bpjs_kesehatan: official.bpjs_kesehatan,
            bpjs_ketenagakerjaan: official.bpjs_ketenagakerjaan,
            npwp: official.npwp,
            status: official.status,
        };
        OfficialPDF(data);
    };

    // Handle print page
    const handlePrintPage = () => {
        const printData = {
            title: `Laporan Pejabat ${position.name}`,
            regency: regency,
            filters: filters,
            officials: officialsData,
            statistics: {
                official_count,
                total_posisi,
                total_terisi,
                kelengkapan_data,
                status_pejabat,
                jenis_kelamin,
                pendidikan,
                jabatan,
                trainings,
                organizations,
                agama,
                golongan_darah,
                status_perkawinan,
            },
        };
        OfficialPDF(printData);
    };

    // Handle edit official
    const handleEdit = (official, role) => {
        window.location.href = `/regency/official/${role}/${official.nik}/edit`;
    };

    // Handle delete official
    const handleDelete = (official, role) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This data will be deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(
                    `/regency/official/${role}/${official.nik}/delete`,
                    {
                        headers: {
                            "X-CSRF-TOKEN": csrfToken,
                        },
                        onSuccess: () => {
                            Swal.fire(
                                "Deleted!",
                                "Data has been successfully deleted.",
                                "success"
                            );
                            fetchData({});
                        },
                        onError: () => {
                            Swal.fire(
                                "Error",
                                "An error occurred while deleting the data.",
                                "error"
                            );
                        },
                    }
                );
            }
        });
    };

    // Handle Accept Official
    const handleAccept = (official) => {
        Swal.fire({
            title: `Apakah anda yakin?`,
            text: `Pilih terima untuk menyetujui verifikasi ${official.nama_lengkap}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Terima",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(
                    `/regency/official/${official.nik}/accept`,
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire(
                                "Terima!",
                                `Verifikasi ${official.nama_lengkap} diterima`,
                                "success"
                            );
                            fetchData({});
                        },
                        onError: () => {
                            Swal.fire(
                                "Error",
                                `Verifikasi Terima ${official.nama_lengkap} dalam kendala`,
                                "error"
                            );
                        },
                    }
                );
            }
        });
    };

    // Handle Reject Official
    const handleReject = (official) => {
        Swal.fire({
            title: `Apakah anda yakin?`,
            text: `Pilih terima untuk menolak verifikasi ${official.nama_lengkap}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Terima",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(
                    `/regency/official/${official.nik}/reject`,
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire(
                                "Tolak!",
                                `Verifikasi ${official.nama_lengkap} ditolak`,
                                "success"
                            );
                            fetchData({});
                        },
                        onError: () => {
                            Swal.fire(
                                "Error",
                                `Verifikasi Tolak ${official.nama_lengkap} dalam kendala`,
                                "error"
                            );
                        },
                    }
                );
            }
        });
    };

    // Handle close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setIsViewMode(false);
        setSelectedOfficial(null);
        setNewOfficial({
            village_id: "",
            nik: "",
            niad: "",
            nama_lengkap: "",
            gelar_depan: "",
            gelar_belakang: "",
            tempat_lahir: "",
            tanggal_lahir: "",
            jenis_kelamin: "",
            status_perkawinan: "",
            agama: "",
            alamat: "",
            rt: "",
            rw: "",
            regency_code: "",
            regency_name: "",
            district_code: "",
            district_name: "",
            village_code: "",
            village_name: "",
            handphone: "",
            gol_darah: "",
            pendidikan: "",
            bpjs_kesehatan: "",
            bpjs_ketenagakerjaan: "",
            npwp: "",
            status: "",
        });
    };

    // Handle submit form (tambah/edit)
    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEdit
            ? `/regency/official/${role}/${selectedOfficial.id}`
            : `/regency/official/${role}`;
        const method = isEdit ? "put" : "post";

        const payload = {
            village_id: newOfficial.village_id,
            nik: newOfficial.nik,
            niad: newOfficial.niad,
            nama_lengkap: newOfficial.nama_lengkap,
            gelar_depan: newOfficial.gelar_depan,
            gelar_belakang: newOfficial.gelar_belakang,
            tempat_lahir: newOfficial.tempat_lahir,
            tanggal_lahir: newOfficial.tanggal_lahir,
            jenis_kelamin: newOfficial.jenis_kelamin,
            status_perkawinan: newOfficial.status_perkawinan,
            agama: newOfficial.agama,
            alamat: newOfficial.alamat,
            rt: newOfficial.rt,
            rw: newOfficial.rw,
            regency_code: newOfficial.regency_code,
            regency_name: newOfficial.regency_name,
            district_code: newOfficial.district_code,
            district_name: newOfficial.district_name,
            village_code: newOfficial.village_code,
            village_name: newOfficial.village_name,
            handphone: newOfficial.handphone,
            gol_darah: newOfficial.gol_darah,
            pendidikan: newOfficial.pendidikan,
            bpjs_kesehatan: newOfficial.bpjs_kesehatan,
            bpjs_ketenagakerjaan: newOfficial.bpjs_ketenagakerjaan,
            npwp: newOfficial.npwp,
            status: newOfficial.status,
        };

        router[method](url, payload, {
            headers: {
                "X-CSRF-TOKEN": csrfToken,
            },
            onSuccess: () => {
                Swal.fire(
                    "Success",
                    `Official ${isEdit ? "updated" : "added"} successfully.`,
                    "success"
                );
                setIsModalOpen(false);
                fetchData({});
            },
            onError: (errors) => {
                Swal.fire("Error", Object.values(errors).join(", "), "error");
            },
        });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        let updatedFilters = { ...filters, [name]: value };

        // Reset desa if kecamatan changes
        if (name === 'kecamatan' && value !== filters.kecamatan) {
            updatedFilters.desa = "";
        }

        setFilters(updatedFilters);
        fetchData({ filters: JSON.stringify(updatedFilters) });
    };

    const handleSort = (column, direction) => {
        setSortField(column.selector);
        setSortDirection(direction);
        fetchData({ sortField: column.selector, sortDirection: direction });
    };

    const openModal = (title, labels, data) => {
        setModalTitle(title);
        const newData = labels.map((label, index) => ({
            id: index + 1,
            kategori: label,
            jumlah: data[index],
        }));
        setTableData1(newData);
        setModalOpen(true);
    };

    const districtCount = districts?.length ?? 0;
    const villageCount = villages?.length ?? 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight text-white">
                    Daftar {position.name}
                    <p className="text-xs font-normal mt-1 text-white">
                        Daftar pejabat desa dengan jabatan {position.name}
                    </p>
                </div>
            }
            breadcrumb={[
                {
                    name: "Pejabat",
                    path: `/regency/official/${role}`,
                    active: true,
                    icon: <HiUsers className="w-5 h-5 mr-3" />,
                },
            ]}
        >
            <Head title="Official" />

            <div className="py-6 max-w-full px-4 mx-auto">
                {/* Statistik Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <motion.div
                        className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaCity size={40} className="text-white" />
                        <div className="text-right">
                            <h3 className="text-lg font-medium mb-2">Kabupaten</h3>
                            <p className="text-2xl font-semibold">{regency.name_bps}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        role="region"
                        aria-label={`Kecamatan count: ${districtCount}`}
                        >
                        <FaBuilding size={40} />
                        <div className="text-right">
                            <h3 className="text-lg font-medium mb-2">Kecamatan</h3>
                            <p className="text-2xl font-semibold">{districtCount}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        role="region"
                        aria-label={`Desa count: ${villageCount}`}
                        >
                        <FaHome size={40} />
                        <div className="text-right">
                            <h3 className="text-lg font-medium mb-2">Desa</h3>
                            <p className="text-2xl font-semibold">{villageCount}</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Statistik Cards */}
                {/* <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <motion.div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaUsers size={40} className="text-white" />
                        <div className="text-right">
                            <h3 className="text-lg font-medium mb-2">Aparatur</h3>
                            <p className="text-3xl font-semibold">{official_count.toLocaleString("id-ID")}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaInfoCircle size={40} className="text-white" />
                        <div className="text-right">
                            <h3 className="text-lg font-medium mb-2">Jabatan</h3>
                            <p className="text-3xl font-semibold">{posisi.toLocaleString("id-ID")}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaInfoCircle size={40} className="text-white" />
                        <div className="text-right">
                            <h3 className="text-lg font-medium mb-2">Minimal</h3>
                            <p className="text-xs font-semibold">{official_count.toLocaleString("id-ID")} AD - {posisi} APD</p>
                            <p className="text-3xl font-semibold">{(official_count - posisi).toLocaleString("id-ID")}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaInfoCircle size={40} className="text-white" />
                        <div className="text-right">
                            <h3 className="text-lg font-medium mb-2">Perbandingan</h3>
                            <p className="text-3xl font-semibold">{total_terisi.toLocaleString("id-ID")} / {total_posisi.toLocaleString("id-ID")}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="col-span-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaUsers size={40} className="text-white" />
                        <div className="text-right">
                            <h3 className="text-lg font-medium mb-2">Persentase</h3>
                            <p className="text-3xl font-semibold">{kelengkapan_data.toLocaleString("id-ID")} %</p>
                        </div>
                    </motion.div>
                </motion.div> */}

                {/* Active Officials Cards */}
                {/* <div className="my-6">
                    {selectFilteredOfficials && selectFilteredOfficials.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {selectFilteredOfficials.map((official, index) => (
                                <motion.div
                                    key={official.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => handleView(official)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {official.gelar_depan ? `${official.gelar_depan} ` : ""}
                                                {official.nama_lengkap}
                                                {official.gelar_belakang ? `, ${official.gelar_belakang}` : ""}
                                            </h3>
                                            <p className="text-sm text-blue-600 font-medium">
                                                {official.position_current?.position?.name ||
                                                official.positions?.[0]?.position?.name || "-"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                TMT Jabatan: {official.position_current?.tmt_jabatan ||
                                                            official.positions?.[0]?.tmt_jabatan || "-"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Umur: {calculateAge(official.tanggal_lahir)} tahun
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">
                            Tidak ada pejabat aktif untuk jabatan {position.name}.
                        </p>
                    )}
                </div> */}

                {/* Filter Section */}
                <motion.div
                    className="bg-white p-6 rounded-lg shadow-md my-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Filter Data
                        </h3>
                        <button
                            onClick={() => handlePrintPage()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FiPrinter size={16} />
                            Cetak PDF
                        </button>
                    </div> */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pencarian</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Cari nama atau NIK..."
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                            <select
                                name="kecamatan"
                                value={filters.kecamatan}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <option value="">Semua</option>
                                {kecamatan.map((kec) => (
                                    <option key={kec.value} value={kec.value}>{kec.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Desa</label>
                            <select
                                name="desa"
                                value={filters.desa}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                disabled={!filters.kecamatan}
                            >
                                <option value="">Semua</option>
                                {desa.map((des) => (
                                    <option key={des.value} value={des.value}>{des.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                            <select
                                name="education"
                                value={filters.education}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <option value="">Semua</option>
                                {Object.keys(pendidikan).map((edu) => (
                                    <option key={edu} value={edu}>{edu}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jabatan</label>
                            <select
                                name="position"
                                value={filters.position}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <option value="">Semua</option>
                                {Object.keys(jabatan).map((pos) => (
                                    <option key={pos} value={pos}>{pos}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                            <select
                                name="gender"
                                value={filters.gender}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <option value="">Semua</option>
                                <option value="L">Laki-Laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Agama</label>
                            <select
                                name="religion"
                                value={filters.religion}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <option value="">Semua</option>
                                {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", "Kosong"].map((rel) => (
                                    <option key={rel} value={rel}>{rel}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Golongan Darah</label>
                            <select
                                name="blood_type"
                                value={filters.blood_type}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <option value="">Semua</option>
                                {["A", "B", "AB", "O", "Kosong"].map((bt) => (
                                    <option key={bt} value={bt}>{bt}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pelatihan</label>
                            <select
                                name="training"
                                value={filters.training}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <option value="">Semua</option>
                                {Object.keys(trainings).map((tr) => (
                                    <option key={tr} value={tr}>{tr}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Organisasi</label>
                            <select
                                name="organization"
                                value={filters.organization}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <option value="">Semua</option>
                                {Object.keys(organizations).map((org) => (
                                    <option key={org} value={org}>{org}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status Aktif</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <option value="">Semua</option>
                                {["daftar", "proses", "validasi", "tolak"].map((bt) => (
                                    <option key={bt} value={bt}>{bt}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Official List Table */}
                <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <OfficialList
                        officials={officialsData}
                        fetchData={fetchData}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        onPrint={handlePrint}
                        position={position}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        role={role}
                        onSort={handleSort}
                    />
                </motion.div>

                {/* Chart Section */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    {/* Status Pejabat */}
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md col-span-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Status Pejabat
                            </h3>
                            <button
                                onClick={() =>
                                    openModal(
                                        "Status Pejabat",
                                        officialStatusData.labels,
                                        officialStatusData.datasets[0].data
                                    )
                                }
                            >
                                <MdTableChart className="text-green-600" size={24} />
                            </button>
                        </div>
                        <div className="relative" style={{ height: "300px" }}>
                            <Pie data={officialStatusData} options={chartOptions} />
                        </div>
                    </motion.div>

                    {/* Jenis Kelamin */}
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Jenis Kelamin
                            </h3>
                            <button
                                onClick={() =>
                                    openModal(
                                        "Jenis Kelamin",
                                        genderData.labels,
                                        genderData.datasets[0].data
                                    )
                                }
                            >
                                <MdTableChart className="text-green-600" size={24} />
                            </button>
                        </div>
                        <div className="relative" style={{ height: "300px" }}>
                            <Pie data={genderData} options={chartOptions} />
                        </div>
                    </motion.div>

                    {/* Status Perkawinan */}
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Status Perkawinan
                            </h3>
                            <button
                                onClick={() =>
                                    openModal(
                                        "Status Perkawinan",
                                        maritalStatusData.labels,
                                        maritalStatusData.datasets[0].data
                                    )
                                }
                            >
                                <MdTableChart className="text-green-600" size={24} />
                            </button>
                        </div>
                        <div className="relative" style={{ height: "300px" }}>
                            <Pie data={maritalStatusData} options={chartOptions} />
                        </div>
                    </motion.div>

                    {/* Pendidikan Terakhir */}
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md col-span-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Pendidikan Terakhir
                            </h3>
                            <button
                                onClick={() =>
                                    openModal(
                                        "Pendidikan Terakhir",
                                        educationData.labels,
                                        educationData.datasets[0].data
                                    )
                                }
                            >
                                <MdTableChart className="text-green-600" size={24} />
                            </button>
                        </div>
                        <div className="relative" style={{ height: "300px" }}>
                            <Bar
                                data={educationData}
                                options={{ ...chartOptions, indexAxis: "y" }}
                            />
                        </div>
                    </motion.div>

                    {/* Pelatihan */}
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Pelatihan
                            </h3>
                            <button
                                onClick={() =>
                                    openModal(
                                        "Pelatihan",
                                        trainingsData.labels,
                                        trainingsData.datasets[0].data
                                    )
                                }
                            >
                                <MdTableChart className="text-green-600" size={24} />
                            </button>
                        </div>
                        <div className="relative" style={{ height: "300px" }}>
                            <Doughnut data={trainingsData} options={chartOptions} />
                        </div>
                    </motion.div>

                    {/* Organisasi */}
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Organisasi
                            </h3>
                            <button
                                onClick={() =>
                                    openModal(
                                        "Organisasi",
                                        organizationsData.labels,
                                        organizationsData.datasets[0].data
                                    )
                                }
                            >
                                <MdTableChart className="text-green-600" size={24} />
                            </button>
                        </div>
                        <div className="relative" style={{ height: "300px" }}>
                            <Doughnut data={organizationsData} options={chartOptions} />
                        </div>
                    </motion.div>

                    {/* Agama */}
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Agama
                            </h3>
                            <button
                                onClick={() =>
                                    openModal(
                                        "Agama",
                                        religionData.labels,
                                        religionData.datasets[0].data
                                    )
                                }
                            >
                                <MdTableChart className="text-green-600" size={24} />
                            </button>
                        </div>
                        <div className="relative" style={{ height: "300px" }}>
                            <Pie data={religionData} options={chartOptions} />
                        </div>
                    </motion.div>

                    {/* Golongan Darah */}
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Golongan Darah
                            </h3>
                            <button
                                onClick={() =>
                                    openModal(
                                        "Golongan Darah",
                                        bloodTypeData.labels,
                                        bloodTypeData.datasets[0].data
                                    )
                                }
                            >
                                <MdTableChart className="text-green-600" size={24} />
                            </button>
                        </div>
                        <div className="relative" style={{ height: "300px" }}>
                            <Pie data={bloodTypeData} options={chartOptions} />
                        </div>
                    </motion.div>

                    {/* Jabatan */}
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-md col-span-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Jabatan
                            </h3>
                            <button
                                onClick={() =>
                                    openModal(
                                        "Jabatan",
                                        positionData.labels,
                                        positionData.datasets[0].data
                                    )
                                }
                            >
                                <MdTableChart className="text-green-600" size={24} />
                            </button>
                        </div>
                        <div className="relative" style={{ height: "300px" }}>
                            <Bar
                                data={positionData}
                                options={{ ...chartOptions, indexAxis: "y" }}
                            />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Modal untuk menampilkan data dalam tabel */}
                {modalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">{modalTitle}</h3>
                                <button
                                    className="p-1 bg-red-600 text-white rounded-lg font-bold"
                                    onClick={() => setModalOpen(false)}
                                >
                                    <FiX />
                                </button>
                            </div>
                            <DataTable
                                columns={column1s}
                                data={tableData1}
                                pagination
                                highlightOnHover
                            />
                        </motion.div>
                    </motion.div>
                )}

                {/* Modal for Viewing Details */}
                <Modal
                    isOpen={isModalOpen && isViewMode}
                    onClose={handleCloseModal}
                    title="Detail Pejabat Desa"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 overflow-y-auto max-h-[90vh]"
                    >
                        <div className="flex flex-col md:flex-row gap-6 items-start bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                            {selectedOfficial?.identities?.foto ? (
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    className="relative group cursor-pointer"
                                >
                                    <img
                                        src={`/private-images/${selectedOfficial?.identities?.foto}`}
                                        alt={`Foto ${selectedOfficial.nama_lengkap}`}
                                        className="w-32 h-32 rounded-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FiImage className="text-white text-2xl" />
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    <FiUser className="text-5xl" />
                                </div>
                            )}

                            <div className="flex-1">
                                <motion.h2
                                    className="text-2xl font-bold text-gray-800 mb-1"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {selectedOfficial?.gelar_depan &&
                                        `${selectedOfficial.gelar_depan} `}
                                    {selectedOfficial?.nama_lengkap}
                                    {selectedOfficial?.gelar_belakang &&
                                        `, ${selectedOfficial.gelar_belakang}`}
                                </motion.h2>

                                <motion.p
                                    className="text-lg text-blue-600 font-medium mb-3"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    {selectedOfficial?.position_current?.position?.name}
                                </motion.p>

                                <div className="flex flex-wrap gap-2">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                                    >
                                        <FiUser size={14} />{" "}
                                        {selectedOfficial?.jenis_kelamin === "L"
                                            ? "Laki-laki"
                                            : "Perempuan"}
                                    </motion.div>

                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.25 }}
                                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
                                    >
                                        <FiCalendar size={14} />{" "}
                                        {selectedOfficial?.tanggal_lahir} (
                                        {calculateAge(selectedOfficial?.tanggal_lahir)} tahun)
                                    </motion.div>

                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1"
                                    >
                                        <FiDroplet size={14} /> Gol. Darah:{" "}
                                        {selectedOfficial?.identities?.gol_darah || "-"}
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <AccordionSection
                                title="Informasi Pribadi"
                                icon={<FiUser className="text-blue-500" />}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    <InfoField label="NIK" value={selectedOfficial?.nik} />
                                    <InfoField label="NIPD" value={selectedOfficial?.niad} />
                                    <InfoField label="Tempat Lahir" value={selectedOfficial?.tempat_lahir} />
                                    <InfoField label="Tanggal Lahir" value={selectedOfficial?.tanggal_lahir} />
                                    <InfoField label="Agama" value={selectedOfficial?.agama} />
                                    <InfoField label="Status Perkawinan" value={selectedOfficial?.status_perkawinan} />
                                    <InfoField
                                        label="Pendidikan Terakhir"
                                        value={selectedOfficial?.identities?.pendidikan_terakhir}
                                    />
                                </div>
                            </AccordionSection>

                            <AccordionSection
                                title="Alamat"
                                icon={<FiMapPin className="text-green-500" />}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                    <InfoField
                                        label="Alamat"
                                        value={selectedOfficial?.addresses?.alamat}
                                        fullWidth
                                    />
                                    <div className="flex gap-4">
                                        <InfoField label="RT" value={selectedOfficial?.addresses?.rt} />
                                        <InfoField label="RW" value={selectedOfficial?.addresses?.rw} />
                                    </div>
                                    <InfoField
                                        label="Desa/Kelurahan"
                                        value={`${selectedOfficial?.addresses?.village_name} (${selectedOfficial?.village?.name_dagri})`}
                                    />
                                    <InfoField
                                        label="Kecamatan"
                                        value={`${selectedOfficial?.addresses?.district_name} (${selectedOfficial?.village?.district?.name_dagri})`}
                                    />
                                    <InfoField
                                        label="Kabupaten/Kota"
                                        value={`${selectedOfficial?.addresses?.regency_name} (${selectedOfficial?.village?.district?.regency?.name_dagri})`}
                                    />
                                    <InfoField
                                        label="Provinsi"
                                        value={selectedOfficial?.addresses?.province_name}
                                    />
                                </div>
                            </AccordionSection>

                            <AccordionSection
                                title="Kontak"
                                icon={<FiPhone className="text-purple-500" />}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                    <InfoField
                                        label="Nomor Handphone"
                                        value={selectedOfficial?.contacts?.handphone}
                                    />
                                    <InfoField
                                        label="Email"
                                        value={selectedOfficial?.contacts?.email || "-"}
                                    />
                                </div>
                            </AccordionSection>

                            <AccordionSection
                                title="Dokumen Identitas"
                                icon={<FiFileText className="text-yellow-500" />}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    <InfoField
                                        label="BPJS Kesehatan"
                                        value={selectedOfficial?.identities?.bpjs_kesehatan || "-"}
                                    />
                                    <InfoField
                                        label="BPJS Ketenagakerjaan"
                                        value={selectedOfficial?.identities?.bpjs_ketenagakerjaan || "-"}
                                    />
                                    <InfoField
                                        label="NPWP"
                                        value={selectedOfficial?.identities?.npwp || "-"}
                                    />
                                </div>
                            </AccordionSection>

                            <AccordionSection
                                title="Posisi & Jabatan"
                                icon={<FiBriefcase className="text-red-500" />}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    <InfoField
                                        label="Jabatan"
                                        value={selectedOfficial?.position_current?.position?.name}
                                    />
                                    <InfoField
                                        label="Penetap"
                                        value={selectedOfficial?.position_current?.penetap}
                                    />
                                    <InfoField
                                        label="Nomor SK"
                                        value={selectedOfficial?.position_current?.nomor_sk}
                                    />
                                    <InfoField
                                        label="Tanggal SK"
                                        value={selectedOfficial?.position_current?.tanggal_sk}
                                    />
                                    <InfoField
                                        label="TMT Jabatan"
                                        value={selectedOfficial?.position_current?.tmt_jabatan}
                                    />
                                    {selectedOfficial?.position_current?.file_sk && (
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm font-medium text-gray-500">
                                                File SK
                                            </label>
                                            <a
                                                href={selectedOfficial.position_current.file_sk}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 inline-flex items-center text-blue-600 hover:underline"
                                            >
                                                <FiFileText className="mr-1" /> Lihat Dokumen SK
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </AccordionSection>

                            <AccordionSection
                                title="History Status Log"
                                icon={<FiClock className="text-green-500" />}
                            >
                                {selectedOfficial?.status_logs?.length ? (
                                    <div className="p-4 space-y-6">
                                        {selectedOfficial.status_logs.map((log, idx) => (
                                            <div
                                                key={log.id}
                                                className="border rounded-lg shadow-sm p-4 bg-white"
                                            >
                                                <h4 className="font-semibold text-gray-700 mb-3">
                                                    #{idx + 1} – {log.status_baru?.toUpperCase()}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                                    <InfoField label="ID Log" value={log.id} />
                                                    <InfoField
                                                        label="Status Sebelumnya"
                                                        value={log.status_sebelumnya ?? "-"}
                                                    />
                                                    <InfoField label="Status Baru" value={log.status_baru} />
                                                    <InfoField label="User ID" value={log.user_id} />
                                                    <InfoField
                                                        label="Dibuat"
                                                        value={new Date(log.created_at).toLocaleString()}
                                                    />
                                                    <InfoField
                                                        label="Diubah"
                                                        value={new Date(log.updated_at).toLocaleString()}
                                                    />
                                                    {log.keterangan && (
                                                        <div className="md:col-span-2 lg:col-span-3">
                                                            <InfoField
                                                                label="Keterangan"
                                                                value={log.keterangan}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="p-4 text-gray-500 italic">
                                        Belum ada history perubahan status.
                                    </p>
                                )}
                            </AccordionSection>
                        </div>

                        <div className="flex justify-end pt-4 p-4">
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCloseModal}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 shadow-md"
                            >
                                <FiX size={18} /> Tutup
                            </motion.button>
                        </div>
                    </motion.div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}

// Komponen AccordionSection
const AccordionSection = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <motion.div
            className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 hover:bg-gray-100 bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="text-lg">{icon}</div>
                    <h3 className="text-lg font-medium text-gray-800">{title}</h3>
                </div>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Komponen InfoField
const InfoField = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "md:col-span-2 lg:col-span-3" : ""}>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        <p className="mt-1 text-gray-900 font-medium">{value || "-"}</p>
    </div>
);

// Helper untuk menghitung usia
const calculateAge = (birthDate) => {
    if (!birthDate) return "-";
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
        age--;
    }
    return age;
};
