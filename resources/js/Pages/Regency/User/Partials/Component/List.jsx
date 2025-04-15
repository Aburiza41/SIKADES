import { useState, useEffect } from "react";
import { FaFileExport, FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Actions from "./Actions";
import { HiChevronLeft, HiChevronRight, HiEllipsisHorizontal } from "react-icons/hi2";

export default function List({ users, fetchData, loading, onEdit, onDelete, onView, onPrint }) {
    console.log(users);
    // State untuk pencarian
    const [filterText, setFilterText] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(users?.current_page || 1);
    const [rowsPerPage, setRowsPerPage] = useState(users?.per_page || 10);
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");

    useEffect(() => {
        fetchData({
            page: currentPage,
            perPage: rowsPerPage,
            search: filterText,
            filters: roleFilter,
            sortField: sortField,
            sortDirection: sortDirection,
        });
    }, [currentPage, rowsPerPage, filterText, roleFilter, sortField, sortDirection]);

    const handlePageChange = (page) => setCurrentPage(page);

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value));
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
        const jsonData = JSON.stringify(users?.data || [], null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "users.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(users?.data || []);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "users");
        XLSX.writeFile(workbook, "users.xlsx");
    };

    const CustomBadge = ({ role }) => {
        let badgeColor = '';
        let roleName = '';

        switch (role) {
            case 'admin': badgeColor = 'bg-red-500'; roleName = 'Admin'; break;
            case 'regency': badgeColor = 'bg-blue-500'; roleName = 'Kabupaten'; break;
            case 'district': badgeColor = 'bg-green-500'; roleName = 'Kecamatan'; break;
            case 'village': badgeColor = 'bg-yellow-500'; roleName = 'Desa'; break;
            default: badgeColor = 'bg-gray-500'; roleName = 'Unknown';
        }

        return (
            <span className={`px-2 py-1 text-xs text-white rounded-full ${badgeColor}`}>
                {roleName}
            </span>
        );
    };

    const renderSortableHeader = (field, label) => {
        const isSorted = sortField === field;
        return (
            <th
                className="border px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(field)}
            >
                <div className="flex items-center">
                    {label}
                    {isSorted ? (
                        sortDirection === "asc" ?
                        <FaSortUp className="ml-1" /> :
                        <FaSortDown className="ml-1" />
                    ) : (
                        <FaSort className="ml-1 text-gray-400" />
                    )}
                </div>
            </th>
        );
    };

    const Pagination = ({ currentPage, lastPage, handlePageChange }) => {
        const getPageNumbers = () => {
            const pages = [];
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(lastPage, currentPage + 2);

            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push("...");
            }

            for (let i = startPage; i <= endPage; i++) pages.push(i);

            if (endPage < lastPage) {
                if (endPage < lastPage - 1) pages.push("...");
                pages.push(lastPage);
            }

            return pages;
        };

        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-md border ${
                            currentPage === 1 ? "border-gray-200 text-gray-400 cursor-not-allowed" :
                            "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <HiChevronLeft className="w-4 h-4" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === "number" && handlePageChange(page)}
                            className={`p-2 min-w-[36px] rounded-md border text-sm ${
                                page === currentPage ?
                                "border-green-500 bg-green-50 text-green-600 font-medium" :
                                page === "..." ?
                                "border-transparent text-gray-500 cursor-default" :
                                "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                            disabled={page === "..."}
                        >
                            {page === "..." ? <HiEllipsisHorizontal /> : page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === lastPage}
                        className={`p-2 rounded-md border ${
                            currentPage === lastPage ?
                            "border-gray-200 text-gray-400 cursor-not-allowed" :
                            "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <HiChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    const getDaerahName = (row) => {
        if (row.role === 'regency') {
            return row.user_regency?.regency?.name_bps || 'N/A';
        } else if (row.role === 'district') {
            return row.user_district?.district?.name_bps || 'N/A';
        } else if (row.role === 'village') {
            return row.user_village?.village?.name_bps || 'N/A';
        } else {
            return 'Admin Pusat';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {/* Header dengan pencarian dan filter */}
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <motion.input
                            type="text"
                            placeholder="Cari nama..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    >
                        <option value="">Semua Role</option>
                        <option value="village">Desa</option>
                        <option value="district">Kecamatan</option>
                        <option value="regency">Kabupaten</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <motion.button
                        onClick={handleExportJSON}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaFileExport className="mr-2" /> JSON
                    </motion.button>

                    <motion.button
                        onClick={handleExportExcel}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <FaFileExport className="mr-2" /> Excel
                    </motion.button>
                </div>
            </div>

            {/* Tabel data */}
            <div className="overflow-x-auto w-full px-5 py-3">
                <table className="w-full divide-x divide-gray-200 text-sm border">
                    <thead className="bg-gray-50 border">
                        <tr>
                            <th className="border px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            {renderSortableHeader("name", "Nama")}
                            {renderSortableHeader("email", "Email")}
                            <th className="border px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daerah</th>
                            {renderSortableHeader("role", "Role")}
                            <th className="border px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-x divide-gray-200 border">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="border px-2 py-2 text-center text-sm text-gray-500">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : users?.data?.length > 0 ? (
                            users.data.map((row, index) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="border px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {row.id}
                                    </td>
                                    <td className="border px-2 py-2 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {row.name}
                                        </div>
                                    </td>
                                    <td className="border px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {row.email}
                                    </td>
                                    <td className="border px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {getDaerahName(row)}
                                    </td>
                                    <td className="border px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                                        <CustomBadge role={row.role} />
                                    </td>
                                    <td className="border px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
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
                                <td colSpan="6" className="border px-2 py-2 text-center text-sm text-gray-500">
                                    Tidak ada data yang ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center">
                    <span className="text-sm text-gray-700 mr-2">Baris per halaman:</span>
                    <select
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                        className="block w-20 pl-3 pr-10 py-1 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> sampai{' '}
                    <span className="font-medium">
                        {Math.min(currentPage * rowsPerPage, users?.total || 0)}
                    </span>{' '}
                    dari <span className="font-medium">{users?.total || 0}</span> data
                </div>

                <Pagination
                    currentPage={currentPage}
                    lastPage={users?.last_page || 1}
                    handlePageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
