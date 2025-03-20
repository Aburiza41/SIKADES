import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FaFileExport, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { debounce } from "lodash";
import Actions from "./Actions";
import { router } from "@inertiajs/react";

export default function List({ descriptions, onEdit, onDelete, onView, onPrint, onAdd }) {
    console.log("Data di List:", descriptions); // Debugging

    // State untuk pencarian
    const [filterText, setFilterText] = useState("");

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(descriptions?.current_page || 1);
    const [rowsPerPage, setRowsPerPage] = useState(descriptions?.per_page || 10);

    // Fungsi debounce untuk pencarian
    const handleSearch = useCallback(
        debounce((value) => {
            router.get(route('village.profile.index'), { search: value }, {
                preserveState: true,
                replace: true,
            });
        }, 300),
        [] // Dependency array kosong agar fungsi hanya dibuat sekali
    );

    // Handle perubahan halaman
    const handlePageChange = (page) => {
        setCurrentPage(page);
        router.get(route('village.profile.index'), { page }, {
            preserveState: true,
        });
    };

    // Handle perubahan jumlah baris per halaman
    const handleRowsPerPageChange = (newRowsPerPage, page) => {
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(page);
        router.get(route('village.profile.index'), { per_page: newRowsPerPage, page }, {
            preserveState: true,
        });
    };

    // Handle ekspor data ke JSON
    const handleExportJSON = () => {
        const jsonData = JSON.stringify(descriptions?.data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "descriptions.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle ekspor data ke Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(descriptions?.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "descriptions");
        XLSX.writeFile(workbook, "descriptions.xlsx");
    };

    // Kolom tabel
    const columns = [
        { name: "Score IDM", selector: (row) => row?.score_idm, sortable: true },
        { name: "Status IDM", selector: (row) => row?.status_idm, sortable: true },
        { name: "Score Prodeskel", selector: (row) => row?.score_prodeskel, sortable: true },
        { name: "Score Epdeskel", selector: (row) => row?.score_epdeskel, sortable: true },
        { name: "Status", selector: (row) => row?.status, sortable: true },
        { name: "Classification", selector: (row) => row?.classification, sortable: true },
        { name: "Year", selector: (row) => row?.year, sortable: true },
        {
            name: "Aksi",
            cell: (row) => <Actions row={row} onEdit={onEdit} onDelete={onDelete} onView={onView} onPrint={onPrint} />,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            {/* Header dengan pencarian */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                {/* Input pencarian */}
                <motion.input
                    type="text"
                    placeholder="Cari nama..."
                    value={filterText}
                    onChange={(e) => {
                        setFilterText(e.target.value); // Update state lokal
                        handleSearch(e.target.value); // Panggil fungsi debounce
                    }}
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                />

                {/* Tombol aksi (Export JSON, Export Excel, Add Description) */}
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    {/* Tombol Export JSON */}
                    <motion.button
                        onClick={handleExportJSON}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaFileExport className="mr-2" /> JSON
                    </motion.button>

                    {/* Tombol Export Excel */}
                    <motion.button
                        onClick={handleExportExcel}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaFileExport className="mr-2" /> Excel
                    </motion.button>

                    {/* Tombol Add Description */}
                    <motion.button
                        onClick={onAdd} // Panggil fungsi onAdd dari props
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaPlus />
                    </motion.button>
                </div>
            </div>

            {/* Tabel data */}
            <DataTable
                columns={columns}
                data={descriptions?.data || []}
                pagination
                paginationServer
                paginationTotalRows={descriptions?.total || 0}
                paginationDefaultPage={currentPage}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handleRowsPerPageChange}
                highlightOnHover
                pointerOnHover
                striped
                responsive
            />
        </div>
    );
}
