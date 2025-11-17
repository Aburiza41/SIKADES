import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaFileExport } from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Actions from "./Actions";

export default function List({ organizations, fetchData, loading, onEdit, onDelete, onView }) {
    // State untuk pencarian
    const [filterText, setFilterText] = useState("");

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(organizations?.current_page || 1);
    const [rowsPerPage, setRowsPerPage] = useState(organizations?.per_page || 10);

    // State untuk sorting
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");

    // Fetch data saat parameter berubah
    useEffect(() => {
        fetchData({
            page: currentPage,
            perPage: rowsPerPage,
            search: filterText,
            sortField: sortField,
            sortDirection: sortDirection,
        });
    }, [currentPage, rowsPerPage, filterText, sortField, sortDirection]);

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

        const validSortFields = ["id", "title", "description", "created_at", "updated_at"];
        const field = validSortFields.includes(column.selector) ? column.selector : "id";

        setSortField(field);
        setSortDirection(direction);
    };

    // Handle ekspor data ke JSON
    const handleExportJSON = () => {
        const jsonData = JSON.stringify(organizations.data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "organizations.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle ekspor data ke Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(organizations.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "organizations");
        XLSX.writeFile(workbook, "organizations.xlsx");
    };



    // Kolom tabel
    const columns = [
        {
            name: "No",
            cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1, // Nomor berurutan
            width: "70px",
        },
        { name: "Judul", selector: (row) => row.title, sortable: true, width: "200px" },
        { name: "Deskripsi", selector: (row) => row.description, sortable: true},
        {
            name: "Aksi",
            cell: (row) => <Actions row={row} onEdit={onEdit} onDelete={onDelete} onView={onView} />,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "100px",
        },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            {/* Header dengan pencarian */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                {/* Input pencarian */}
                <motion.input
                    type="text"
                    placeholder="Cari judul..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                />

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
                    data={organizations?.data || []}
                    pagination
                    paginationServer
                    paginationTotalRows={organizations?.total || 0}
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
