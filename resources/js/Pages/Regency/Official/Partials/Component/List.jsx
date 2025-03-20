import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaFileExport } from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Actions from "./Actions";
import Procces from "./Procces";

export default function List({ officials, fetchData, loading, onEdit, onAccept, onReject, onPrint }) {
    // State untuk pencarian
    const [filterText, setFilterText] = useState("");

    // State untuk filter pendidikan
    const [educationFilter, setEducationFilter] = useState("");

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(officials?.current_page || 1);
    const [rowsPerPage, setRowsPerPage] = useState(officials?.per_page || 10);

    // State untuk sorting
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");

    // Daftar pendidikan sesuai enum
    const educationOptions = [
        "SD/MI",
        "SMP/MTS",
        "SMA/SMK/MA",
        "D1",
        "D2",
        "D3",
        "D4",
        "S1",
        "S2",
        "S3",
    ];

    // Fetch data saat parameter berubah
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData({
                page: currentPage,
                perPage: rowsPerPage,
                search: filterText,
                filters: educationFilter, // Kirim filter pendidikan ke backend
                sortField: sortField,
                sortDirection: sortDirection,
            });
        }, 300); // Delay 300ms untuk menghindari terlalu banyak request

        return () => clearTimeout(delayDebounceFn); // Clear timeout jika komponen unmount atau nilai berubah
    }, [currentPage, rowsPerPage, filterText, educationFilter, sortField, sortDirection]);

    // Handle perubahan halaman
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle perubahan jumlah baris per halaman
    const handleRowsPerPageChange = (newRowsPerPage, page) => {
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(page);
    };

    // Handle sorting
    const handleSort = (column, sortDirection) => {
        const validDirections = ["asc", "desc"];
        const direction = validDirections.includes(sortDirection) ? sortDirection : "asc";

        const validSortFields = ["id", "nama_lengkap", "nik", "niad", "pendidikan", "created_at", "updated_at"];
        const field = validSortFields.includes(column.selector) ? column.selector : "id";

        setSortField(field);
        setSortDirection(direction);
    };

    // Handle ekspor data ke JSON
    const handleExportJSON = () => {
        const jsonData = JSON.stringify(officials?.data || [], null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "officials.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle ekspor data ke Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(officials?.data || []);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "officials");
        XLSX.writeFile(workbook, "officials.xlsx");
    };

    // Kolom tabel
    const columns = [
        {
            name: "No",
            cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1, // Nomor berurutan
            width: "70px",
        },
        { name: "Nama Lengkap", selector: (row) => row.nama_lengkap || "-", sortable: true, width: "200px" },
        { name: "NIK", selector: (row) => row.nik || "-", sortable: true },
        { name: "NIAD", selector: (row) => row.niad || "-", sortable: true },
        { name: "Pendidikan", selector: (row) => row.pendidikan || "-", sortable: true },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => <CustomBadge role={row.status} />, // Menggunakan komponen CustomBadge
        },
        {
            name: "Proses",
            cell: (row) => <Procces row={row} onAccept={onAccept} onReject={onReject} />,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "100px",
        },

        {
            name: "Aksi",
            cell: (row) => <Actions row={row} onEdit={onEdit} onPrint={onPrint} />,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "100px",
        },
    ];

    // Komponen Badge Kustom
    const CustomBadge = ({ role }) => {
        let badgeColor = '';
        let roleName = '';

        // Mengubah warna badge dan nama role berdasarkan nilai role
        switch (role) {
            case 'tolak':
                badgeColor = 'bg-red-500';
                roleName = 'Tolak';
                break;
            case 'daftar':
                badgeColor = 'bg-blue-500';
                roleName = 'Daftar';
                break;
            case 'validasi':
                badgeColor = 'bg-green-500';
                roleName = 'Terima';
                break;
            case 'proses':
                badgeColor = 'bg-yellow-500';
                roleName = 'Proses';
                break;
            default:
                badgeColor = 'bg-gray-500';
                roleName = 'Tidak Diketahui';
        }

        return (
            <span className={`px-2 py-0 text-sm text-white rounded ${badgeColor}`}>
                {roleName}
            </span>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            {/* Header dengan pencarian dan filter */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                {/* Input pencarian */}
                <motion.input
                    type="text"
                    placeholder="Cari nama..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                />

                {/* Filter Pendidikan */}
                <select
                    name="education"
                    value={educationFilter}
                    onChange={(e) => setEducationFilter(e.target.value)}
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                >
                    <option value="">Semua Pendidikan</option>
                    {educationOptions.map((education, index) => (
                        <option key={index} value={education}>
                            {education}
                        </option>
                    ))}
                </select>

                {/* Tombol aksi (Export JSON, Export Excel) */}
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <motion.button
                        onClick={handleExportJSON}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaFileExport className="mr-2" /> Export JSON
                    </motion.button>

                    <motion.button
                        onClick={handleExportExcel}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaFileExport className="mr-2" /> Export Excel
                    </motion.button>
                </div>
            </div>

            {/* Tabel data dengan navigasi horizontal */}
            <div className="overflow-x-auto">
                <DataTable
                    columns={columns}
                    data={officials?.data || []}
                    pagination
                    paginationServer
                    paginationTotalRows={officials?.total || 0}
                    paginationDefaultPage={currentPage}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handleRowsPerPageChange}
                    onSort={handleSort}
                    highlightOnHover
                    pointerOnHover
                    striped
                    responsive
                    progressPending={loading}
                />
            </div>
        </div>
    );
}
