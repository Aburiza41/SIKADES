import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
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
import DataTable from "react-data-table-component";
import { FiEdit, FiTrash, FiX } from "react-icons/fi";
import { FaCity, FaBuilding, FaHome, FaUsers, FaInfoCircle } from "react-icons/fa";
import { MdTableChart } from "react-icons/md";
import { motion } from "framer-motion";

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

export default function Dashboard({regency, district, village, official, status_pejabat, jenis_kelamin, pendidikan}) {
    // console.log(regency);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [tableData1, setTableData1] = useState([]); // Perbaikan: Ubah nama state menjadi tableData1

    console.log(status_pejabat);

    const educationData = {
        labels: ['SD/MI', 'SMP/MTS', 'SMA/SMK/MA', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'],
        datasets: [
            {
                label: "Jumlah",
                data: pendidikan,
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
                backgroundColor: ["#4CAF50", "#FFC107", "#2196F3", "#2196F3"],
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
                backgroundColor: ["#4CAF50", "#2196F3"],
                borderColor: "#FFFFFF",
                borderWidth: 2,
            },
        ],
    };

    const openModal = (title, labels, data) => {
        setModalTitle(title);
        // Perbaikan: Isi tableData1 dengan data yang benar
        const newData = labels.map((label, index) => ({
            id: index + 1,
            kategori: label,
            jumlah: data[index],
        }));
        setTableData1(newData); // Perbaikan: Gunakan setTableData1
        setModalOpen(true);
    };

    const column1s = [
        {
            name: "ID",
            selector: (row) => row.id,
            sortable: true,
            width: "80px",
        },
        { name: "Kategori", selector: (row) => row.kategori, sortable: true },
        { name: "Jumlah", selector: (row) => row.jumlah, sortable: true },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top", labels: { color: "#333333" } },
            title: { display: true, color: "#333333", font: { size: 18 } },
        },
    };

    // Dummy data untuk tabel
    const tableData = [
        { id: 1, name: "John Doe", sales: 123 },
        { id: 2, name: "Jane Smith", sales: 456 },
        { id: 3, name: "Alice Johnson", sales: 789 },
        { id: 4, name: "Bob Brown", sales: 101 },
        { id: 5, name: "Charlie Green", sales: 202 },
    ];

    // State untuk pencarian
    const [filterText, setFilterText] = useState("");

    // Filter data berdasarkan input pencarian (berdasarkan nama)
    const filteredItems = useMemo(() => {
        return tableData.filter(
            (item) =>
                item.name &&
                item.name.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [filterText, tableData]);

    // Fungsi untuk menangani aksi edit dan delete
    const handleEdit = (row) => {
        alert(`Edit row with id ${row.id}`);
    };

    const handleDelete = (row) => {
        alert(`Delete row with id ${row.id}`);
    };

    // Kolom untuk DataTable
    const column2s = [
        {
            name: "ID",
            selector: (row) => row.id,
            sortable: true,
            width: "80px",
        },
        {
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Sales",
            selector: (row) => row.sales,
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex space-x-2">
                    <button
                        className="text-blue-500 hover:text-blue-700 transition duration-300"
                        onClick={() => handleEdit(row)}
                    >
                        <FiEdit size={16} />
                    </button>
                    <button
                        className="text-red-500 hover:text-red-700 transition duration-300"
                        onClick={() => handleDelete(row)}
                    >
                        <FiTrash size={16} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Dashboard
                    <p className="text-xs font-thin mt-1">
                        Selamat datang di dashboard admin, Anda dapat mengelola
                    </p>
                </div>

            }
            breadcrumb={[
                { name: "Dashboard", path: "/admin/dashboard" },
            ]}
        >
            <Head title="Dashboard" />

            <div className="py-4 space-y-8">
                <div className="mx-auto max-w-7xl sm:px-4 lg:px-4 space-y-8">
                    {/* Statistik Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Kabupaten */}
                        <motion.div
                            className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <FaCity size={40} className="text-white" />
                            <div className="text-right">
                                <h3 className="text-lg font-medium mb-2">
                                    Kabupaten
                                </h3>
                                <p className="text-3xl font-semibold">{regency.toLocaleString('id-ID')}</p>
                            </div>
                        </motion.div>

                        {/* Kecamatan */}
                        <motion.div
                            className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <FaBuilding size={40} className="text-white" />
                            <div className="text-right">
                                <h3 className="text-lg font-medium mb-2">
                                    Kecamatan
                                </h3>
                                <p className="text-3xl font-semibold">{district.toLocaleString('id-ID')}</p>
                            </div>
                        </motion.div>

                        {/* Desa */}
                        <motion.div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <FaHome size={40} className="text-white" />
                            <div className="text-right">
                                <h3 className="text-lg font-medium mb-2">
                                    Desa
                                </h3>
                                <p className="text-3xl font-semibold">{village.toLocaleString('id-ID')}</p>
                            </div>
                        </motion.div>

                        {/* Aparatur */}
                        <motion.div
                            className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <FaUsers size={40} className="text-white" />
                            <div className="text-right">
                                <h3 className="text-lg font-medium mb-2">
                                    Aparatur
                                </h3>
                                <p className="text-3xl font-semibold">{official.toLocaleString('id-ID')}</p>
                            </div>
                        </motion.div>

                        {/* Informasi */}
                        <motion.div
                            className="col-span-2 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg shadow-lg p-6 flex items-center space-x-4 justify-between text-white"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {/* Mengganti ikon dengan FaInfoCircle */}
                            <FaInfoCircle size={40} className="text-white" />
                            <div className="text-right">
                                <h3 className="text-lg font-medium mb-2">
                                    Informasi
                                </h3>
                                <p className="text-xs font-semibold">
                                    Jumlah minimal AD : {village.toLocaleString('id-ID')} x 13 APD = {(village * 13).toLocaleString('id-ID')}
                                </p>
                                <p className="text-3xl font-semibold">
                                    {((village * 13) - official).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bagian Chart */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="flex justify-between items-center">
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
                                    <MdTableChart
                                        className="text-green-600"
                                        size={24}
                                    />
                                </button>
                            </div>
                            <div
                                className="relative"
                                style={{ height: "300px" }}
                            >
                                <Pie
                                    data={officialStatusData}
                                    options={chartOptions}
                                />
                            </div>
                        </motion.div>
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="flex justify-between items-center">
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
                                    <MdTableChart
                                        className="text-green-600"
                                        size={24}
                                    />
                                </button>
                            </div>
                            <div
                                className="relative"
                                style={{ height: "300px" }}
                            >
                                <Pie data={genderData} options={chartOptions} />
                            </div>
                        </motion.div>
                        <motion.div
                            className="col-span-2 bg-white p-6 rounded-lg shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="flex justify-between items-center">
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
                                    <MdTableChart
                                        className="text-green-600"
                                        size={24}
                                    />
                                </button>
                            </div>
                            <div
                                className="relative"
                                style={{ height: "300px" }}
                            >
                                <Line
                                    data={educationData}
                                    options={chartOptions}
                                />
                            </div>
                        </motion.div>

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
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            {modalTitle}
                                        </h3>

                                        <button
                                            className="p-1 bg-red-600 text-white rounded-lg font-bold"
                                            onClick={() => setModalOpen(false)}
                                        >
                                            <FiX></FiX>
                                        </button>
                                    </div>
                                    <DataTable
                                        columns={column1s}
                                        data={tableData1} // Perbaikan: Gunakan tableData1
                                        pagination
                                        highlightOnHover
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </div>

                    {/* Bagian Tabel Dinamis */}
                    {/* <motion.div
                        className="bg-white p-6 rounded-lg shadow-lg mt-8"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Dynamic Table
                        </h3>
                        <DataTable
                            columns={column2s}
                            data={filteredItems}
                            pagination
                            highlightOnHover
                            pointerOnHover
                            subHeader
                            subHeaderComponent={
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={filterText}
                                    onChange={(e) =>
                                        setFilterText(e.target.value)
                                    }
                                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            }
                        />
                    </motion.div> */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
