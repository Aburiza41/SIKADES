import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaFileExport } from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Actions from "./Actions";

export default function List({ users, fetchData, loading, onEdit, onDelete, onView, onPrint }) {
    // State untuk pencarian
    const [filterText, setFilterText] = useState("");

    // State untuk filter role
    const [roleFilter, setRoleFilter] = useState("");

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(users?.current_page || 1);
    const [rowsPerPage, setRowsPerPage] = useState(users?.per_page || 10);

    // State untuk sorting
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");

    // Fetch data saat parameter berubah
    useEffect(() => {
        fetchData({
            page: currentPage,
            perPage: rowsPerPage,
            search: filterText,
            filters: roleFilter, // Kirim filter role ke backend
            sortField: sortField,
            sortDirection: sortDirection,
        });
    }, [currentPage, rowsPerPage, filterText, roleFilter, sortField, sortDirection]);

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

        const validSortFields = ["id", "name", "email", "role", "created_at", "updated_at"];
        const field = validSortFields.includes(column.selector) ? column.selector : "id";

        setSortField(field);
        setSortDirection(direction);
    };

    // Handle ekspor data ke JSON
    const handleExportJSON = () => {
        const jsonData = JSON.stringify(users.data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "users.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle ekspor data ke Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(users.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "users");
        XLSX.writeFile(workbook, "users.xlsx");
    };

    // Kolom tabel
    const columns = [
        { name: "ID", selector: (row) => row.id, sortable: true, width: "70px" },
        { name: "Nama", selector: (row) => row.name, sortable: true },
        { name: "Email", selector: (row) => row.email, sortable: true },
        // {
        //     name: "Kode Daerah",
        //     selector: (row) => {
        //         if (row.role === 'regency') {
        //             return row.user_regency?.regency?.code_bps || 'N/A';
        //         } else if (row.role === 'district') {
        //             return row.user_district?.district?.code_bps || 'N/A';
        //         } else if (row.role === 'village') {
        //             return row.user_village?.village?.code_bps || 'N/A';
        //         } else {
        //             return 'Admin Pusat'; // Untuk role admin
        //         }
        //     },
        //     sortable: true
        // },
        {
            name: "Daerah",
            selector: (row) => {
                if (row.role === 'regency') {
                    return row.user_regency?.regency?.name_bps || 'N/A';
                } else if (row.role === 'district') {
                    return row.user_district?.district?.name_bps || 'N/A';
                } else if (row.role === 'village') {
                    return row.user_village?.village?.name_bps || 'N/A';
                } else {
                    return 'Admin Pusat'; // Untuk role admin
                }
            },
            sortable: true
        },
        {
            name: "Role",
            selector: (row) => row.role,
            sortable: true,
            cell: (row) => <CustomBadge role={row.role} />, // Menggunakan komponen CustomBadge
        },
        // { name: "Tanggal Dibuat", selector: (row) => new Date(row.created_at).toLocaleDateString(), sortable: true },
        // { name: "Tanggal Diperbarui", selector: (row) => new Date(row.updated_at).toLocaleDateString(), sortable: true },
        {
            name: "Aksi",
            cell: (row) => <Actions row={row} onEdit={onEdit} onDelete={onDelete} onView={onView} onPrint={onPrint} />,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    // Komponen Badge Kustom
    const CustomBadge = ({ role }) => {
        let badgeColor = '';
        let roleName = '';

        // Mengubah warna badge dan nama role berdasarkan nilai role
        switch (role) {
            case 'admin':
                badgeColor = 'bg-red-500';
                roleName = 'Admin';
                break;
            case 'regency':
                badgeColor = 'bg-blue-500';
                roleName = 'Kabupaten';
                break;
            case 'district':
                badgeColor = 'bg-green-500';
                roleName = 'Kecamatan';
                break;
            case 'village':
                badgeColor = 'bg-yellow-500';
                roleName = 'Desa';
                break;
            default:
                badgeColor = 'bg-gray-500';
                roleName = 'Unknown';
        }

        return (
            <span className={`px-2 py-0 text-sm text-white rounded ${badgeColor}`}>
                {roleName}
            </span>
        );
    };

    const CustomDaerah = ({ row, role }) => {
        let badgeColor = '';
        let name = '';
        console.log(row);

        // Mengubah warna badge dan nama role berdasarkan nilai role
        switch (role) {
            case 'admin':
                name = '';
                break;
            case 'regency':
                name = row.user_regency?.regency?.name_bps;
                break;
            case 'district':
                name = row.user_district?.district?.name_bps;
                break;
            case 'village':
                name = row.user_village?.village?.name_bps;
                break;
            default:
                name = 'Unknown';
        }

        return (
            name
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

                {/* Filter Role */}
                <select
                    name="role"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                >
                    <option value="">Semua Role</option>
                    <option value="village">Village</option>
                    <option value="district">District</option>
                    <option value="regency">Regency</option>
                    <option value="admin">Admin</option>
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

            {/* Tabel data */}
            <DataTable
                columns={columns}
                data={users?.data || []}
                pagination
                paginationServer
                paginationTotalRows={users?.total || 0}
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
    );
}
