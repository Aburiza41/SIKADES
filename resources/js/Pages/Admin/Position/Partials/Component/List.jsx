import { useState, useEffect, useCallback } from "react";
import { FaFileExport, FaEdit, FaEye, FaSort, FaSortUp, FaSortDown, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { router } from "@inertiajs/react";

export default function PositionList({
    positions,
    fetchData,
    loading,
    onEdit,
    onView,
    onDelete,
    handleSort,
    sortField,
    sortDirection,
    filterText,
    setFilterText,
    currentPage,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange
}) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    // Handle export to JSON
    const handleExportJSON = () => {
        const jsonData = JSON.stringify(positions.data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "positions.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle export to Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            positions.data.map((position) => ({
                Nama: position.name,
                Slug: position.slug,
                Deskripsi: position.description,
                Level: position.level,
                Min: position.min,
                Max: position.max,
                'Parent ID': position.parent_id || "-",
                'Parent Name': position.parent?.name || "-",
                Keterangan: position.keterangan || "-",
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "positions");
        XLSX.writeFile(workbook, "positions.xlsx");
    };

    // Handle page change
    const handlePageChangeLocal = (page) => {
        handlePageChange(page);
    };

    // Handle rows per page change
    const handleRowsPerPageChangeLocal = (newRowsPerPage) => {
        handleRowsPerPageChange(newRowsPerPage);
    };

    // Handle sorting
    const handleSortLocal = (field) => {
        handleSort(field);
    };

    // react-select styles (if needed for future filters)
    const selectStyles = {
        control: (base) => ({
            ...base,
            borderColor: '#d1d5db',
            borderRadius: '0.375rem',
            padding: '0.25rem',
            '&:hover': {
                borderColor: '#3b82f6',
            },
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };

    // Render sort icon
    const renderSortIcon = (field) => {
        if (sortField !== field) {
            return <FaSort className="ml-1" />;
        }
        return sortDirection === "asc" ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <motion.input
                        type="text"
                        placeholder="Cari nama, slug, atau deskripsi..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                        whileHover={{ scale: 1.02 }}
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    />
                </div>
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
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortLocal("name")}>
                                Nama {renderSortIcon("name")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortLocal("slug")}>
                                Slug {renderSortIcon("slug")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortLocal("description")}>
                                Deskripsi {renderSortIcon("description")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortLocal("level")}>
                                Level {renderSortIcon("level")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortLocal("min")}>
                                Min {renderSortIcon("min")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortLocal("max")}>
                                Max {renderSortIcon("max")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : (positions?.data || []).length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                                    Tidak ada data
                                </td>
                            </tr>
                        ) : (
                            (positions?.data || []).map((position, index) => (
                                <tr key={position.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(currentPage - 1) * rowsPerPage + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.name || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.slug || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.description || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.level || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.min || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.max || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.parent?.name || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => onView(position)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => onEdit(position)}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => onDelete(position.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                    <label className="mr-2">Rows per page:</label>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => handleRowsPerPageChangeLocal(parseInt(e.target.value))}
                        className="border p-1 rounded"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => handlePageChangeLocal(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded mr-2 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="mx-2">
                        Page {currentPage} of {positions?.last_page || 1}
                    </span>
                    <button
                        onClick={() => handlePageChangeLocal(currentPage + 1)}
                        disabled={currentPage === (positions?.last_page || 1)}
                        className="px-3 py-1 border rounded ml-2 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
