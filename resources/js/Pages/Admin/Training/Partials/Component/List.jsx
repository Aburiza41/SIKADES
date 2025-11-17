import { useState, useEffect } from "react";
import { FaFileExport, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { HiEye, HiPencil, HiTrash } from "react-icons/hi";

export default function List({ trainings, fetchData, loading, onDelete, onEdit, onView }) {
    // State untuk pencarian
    const [filterText, setFilterText] = useState("");

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(trainings?.current_page || 1);
    const [rowsPerPage, setRowsPerPage] = useState(trainings?.per_page || 10);

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

    // Handle sorting
    const handleSort = (field) => {
        const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(direction);
    };

    // Get sort icon
    const getSortIcon = (field) => {
        if (sortField !== field) return <FaSort className="inline ml-1" />;
        return sortDirection === "asc" ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
    };

    // Handle ekspor data ke JSON
    const handleExportJSON = () => {
        const jsonData = JSON.stringify(trainings.data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "trainings.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle ekspor data ke Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(trainings.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "trainings");
        XLSX.writeFile(workbook, "trainings.xlsx");
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* Header dengan pencarian dan export */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Cari judul pelatihan, deskripsi..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            onClick={handleExportJSON}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaFileExport className="mr-2" /> JSON
                        </motion.button>
                        <motion.button
                            onClick={handleExportExcel}
                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaFileExport className="mr-2" /> Excel
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                No
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('title')}
                            >
                                Judul Pelatihan {getSortIcon('title')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('description')}
                            >
                                Deskripsi {getSortIcon('description')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : trainings?.data?.length > 0 ? (
                            trainings.data.map((training, index) => (
                                <tr key={training.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(currentPage - 1) * rowsPerPage + index + 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={training.title}>
                                        {training.title || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={training.description}>
                                        {training.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => onView(training)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Lihat Detail"
                                            >
                                                <HiEye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(training)}
                                                className="text-yellow-600 hover:text-yellow-900 p-1"
                                                title="Edit"
                                            >
                                                <HiPencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(training.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Hapus"
                                            >
                                                <HiTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                    Tidak ada data pelatihan ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {trainings?.last_page > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Menampilkan {trainings?.from || 0} sampai {trainings?.to || 0} dari {trainings?.total || 0} hasil
                        </div>
                        <div className="flex space-x-1">
                            {Array.from({ length: trainings?.last_page || 1 }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 text-sm border rounded ${
                                        page === currentPage
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
