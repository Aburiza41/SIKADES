import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
    FaFileExport,
    FaFileAlt,
    FaFilePdf,
    FaFileExcel
} from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Actions from "./Actions";

export default function List({
    users,
    fetchData,
    loading,
    onEdit,
    onDelete,
    onView,
    onPrint,
}) {
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
    }, [
        currentPage,
        rowsPerPage,
        filterText,
        roleFilter,
        sortField,
        sortDirection,
    ]);

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
        const direction = validDirections.includes(sortDirection)
            ? sortDirection
            : "asc";

        const validSortFields = [
            "id",
            "name",
            "email",
            "role",
            "created_at",
            "updated_at",
        ];
        const field = validSortFields.includes(column.selector)
            ? column.selector
            : "id";

        setSortField(field);
        setSortDirection(direction);
    };

    // Handle ekspor data ke JSON
    const handleExport = async (type) => {
        try {
            const params = {
                page: currentPage,
                per_page: rowsPerPage,
                search: filterText,
                filters: educationFilter,
                sort_field: sortField,
                sort_direction: sortDirection,
            };

            const response = await axios.get(
                `/admin/official/${position.slug}/export/${type}`,
                {
                    params,
                    responseType: "blob", // Important for file downloads
                }
            );

            // Determine file extension and content type
            const extensions = {
                json: "json",
                excel: "xlsx",
                pdf: "pdf",
            };
            const contentType = {
                json: "application/json",
                excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                pdf: "application/pdf",
            };

            // Create download link
            const url = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: contentType[type],
                })
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `Pejabat_${position.slug}_${new Date().toLocaleDateString()}.${
                    extensions[type]
                }`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Show success notification
            Swal.fire(
                "Success",
                `${type.toUpperCase()} exported successfully!`,
                "success"
            );
        } catch (error) {
            console.error(`Export ${type} error:`, error);
            Swal.fire(
                "Error",
                `Failed to export ${type.toUpperCase()}. Please try again.`,
                "error"
            );
        }
    };

    // Usage:
    const handleExportJSON = () => handleExport("json");
    const handleExportExcel = () => handleExport("excel");
    const handleExportPDF = () => handleExport("pdf");

    // Kolom tabel
    const columns = [
        {
            name: "ID",
            selector: (row) => row.id,
            sortable: true,
            width: "70px",
        },
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
                if (row.role === "regency") {
                    return row.user_regency?.regency?.name_bps || "N/A";
                } else if (row.role === "district") {
                    return row.user_district?.district?.name_bps || "N/A";
                } else if (row.role === "village") {
                    return row.user_village?.village?.name_bps || "N/A";
                } else {
                    return "Admin Pusat"; // Untuk role admin
                }
            },
            sortable: true,
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
            cell: (row) => (
                <Actions
                    row={row}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    onPrint={onPrint}
                />
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    // Komponen Badge Kustom
    const CustomBadge = ({ role }) => {
        let badgeColor = "";
        let roleName = "";

        // Mengubah warna badge dan nama role berdasarkan nilai role
        switch (role) {
            case "admin":
                badgeColor = "bg-red-500";
                roleName = "Admin";
                break;
            case "regency":
                badgeColor = "bg-blue-500";
                roleName = "Kabupaten";
                break;
            case "district":
                badgeColor = "bg-green-500";
                roleName = "Kecamatan";
                break;
            case "village":
                badgeColor = "bg-yellow-500";
                roleName = "Desa";
                break;
            default:
                badgeColor = "bg-gray-500";
                roleName = "Unknown";
        }

        return (
            <span
                className={`px-2 py-0 text-sm text-white rounded ${badgeColor}`}
            >
                {roleName}
            </span>
        );
    };

    const CustomDaerah = ({ row, role }) => {
        let badgeColor = "";
        let name = "";
        console.log(row);

        // Mengubah warna badge dan nama role berdasarkan nilai role
        switch (role) {
            case "admin":
                name = "";
                break;
            case "regency":
                name = row.user_regency?.regency?.name_bps;
                break;
            case "district":
                name = row.user_district?.district?.name_bps;
                break;
            case "village":
                name = row.user_village?.village?.name_bps;
                break;
            default:
                name = "Unknown";
        }

        return name;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            {/* Header dengan pencarian dan filter */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex flex-col gap-1 w-full">
                        <label htmlFor="search" className="text-sm font-medium">
                            Pecarian
                        </label>
                        <motion.input
                            type="text"
                            id="search"
                            name="search"
                            placeholder="Pencarian ..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-auto"
                            whileHover={{ scale: 1.02 }}
                            whileFocus={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="role" className="text-sm font-medium">
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Role</option>
                            <option value="village">Village</option>
                            <option value="district">District</option>
                            <option value="regency">Regency</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                {/* Tombol aksi (Export JSON, Export Excel) */}
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <motion.button
                        onClick={handleExportJSON}
                        className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaFileAlt className="mr-2" /> JSON
                    </motion.button>

                    <motion.button
                        onClick={handleExportPDF}
                        className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaFilePdf className="mr-2" /> PDF
                    </motion.button>

                    <motion.button
                        onClick={handleExportExcel}
                        className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaFileExcel className="mr-2" /> Excel
                    </motion.button>

                    {/* <ExcelImportModal onImport={handleImportExcel} /> */}

                    {/* <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Link
                            href={`/admin/official/${role}/create`}
                            className="bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <FaPlus className="mr-2" /> Tambah
                        </Link>
                    </motion.div> */}

                    {/* <input type="file" className="p-2 border rounded" placeholder="Cari..." /> */}
                </div>
            </div>

            {/* Tabel data */}
            <DataTable
                className="border border-gray-300"
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
                bordered
                responsive
                progressPending={loading}
            />

        </div>
    );
}
