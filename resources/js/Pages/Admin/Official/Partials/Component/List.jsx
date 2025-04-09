import { useState, useEffect } from "react";
import { FaFileExport, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Actions from "./Actions";

export default function List({ officials, fetchData, loading, onEdit, onDelete, onView, onPrint }) {
    const [filterText, setFilterText] = useState("");
    const [educationFilter, setEducationFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(officials?.current_page || 1);
    const [rowsPerPage, setRowsPerPage] = useState(officials?.per_page || 10);
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");

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

    useEffect(() => {
        fetchData({
            page: currentPage,
            perPage: rowsPerPage,
            search: filterText,
            filters: educationFilter,
            sortField: sortField,
            sortDirection: sortDirection,
        });
    }, [currentPage, rowsPerPage, filterText, educationFilter, sortField, sortDirection]);

    const handlePageChange = (page) => setCurrentPage(page);
    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleExportJSON = () => {
        const jsonData = JSON.stringify(officials.data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "officials.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(officials.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "officials");
        XLSX.writeFile(workbook, "officials.xlsx");
    };

    const renderSortIcon = (field) => {
        if (sortField !== field) return <FaSort className="ml-1" />;
        return sortDirection === "asc" ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            {/* Header dengan pencarian dan filter */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
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

            {/* Tabel biasa dengan overflow horizontal */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: '70px' }}
                            >
                                No
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: '250px' }}
                                onClick={() => handleSort("nama_lengkap")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    Nama Lengkap
                                    {renderSortIcon("nama_lengkap")}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: '150px' }}
                                onClick={() => handleSort("nik")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    NIK
                                    {renderSortIcon("nik")}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: '150px' }}
                                onClick={() => handleSort("niad")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    NIAD
                                    {renderSortIcon("niad")}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: '150px' }}
                                onClick={() => handleSort("pendidikan")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    Pendidikan
                                    {renderSortIcon("pendidikan")}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: '120px' }}
                            >
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : officials?.data?.length > 0 ? (
                            officials.data.map((row, index) => (
                                <tr key={row.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {(currentPage - 1) * rowsPerPage + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {row.nama_lengkap}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {row.nik}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {row.niad}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {row.pendidikan || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Actions
                                            row={row}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            onView={onView}
                                            onPrint={onPrint}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center">
                                    Tidak ada data yang ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4">
                <div className="mb-2 md:mb-0">
                    <span className="text-sm text-gray-700">
                        Menampilkan <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> sampai{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * rowsPerPage, officials?.total || 0)}
                        </span>{' '}
                        dari <span className="font-medium">{officials?.total || 0}</span> data
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <label htmlFor="rowsPerPage" className="mr-2 text-sm text-gray-700">
                            Baris per halaman:
                        </label>
                        <select
                            id="rowsPerPage"
                            value={rowsPerPage}
                            onChange={handleRowsPerPageChange}
                            className="border rounded p-1"
                        >
                            {[5, 10, 25, 50, 100].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.ceil((officials?.total || 0) / rowsPerPage) }, (_, i) => i + 1)
                            .slice(
                                Math.max(0, currentPage - 3),
                                Math.min(Math.ceil((officials?.total || 0) / rowsPerPage), currentPage + 2)
                            )
                            .map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-500 text-white' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === Math.ceil((officials?.total || 0) / rowsPerPage)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
