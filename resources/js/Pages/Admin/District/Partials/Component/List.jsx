import { useState, useEffect } from "react";
import { FaFileExport, FaTrash, FaEdit, FaEye, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Select from "react-select";

export default function DistrictList({ districts, fetchData, loading, onEdit, onDelete, onView, regencies, selectedRegency, setSelectedRegency }) {
    // State untuk pencarian
    const [filterText, setFilterText] = useState("");

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(districts?.current_page || 1);
    const [rowsPerPage, setRowsPerPage] = useState(districts?.per_page || 10);

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
            regency_id: selectedRegency?.value || "",
        });
    }, [currentPage, rowsPerPage, filterText, sortField, sortDirection, selectedRegency]);

    // Handle perubahan halaman
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle perubahan jumlah baris per halaman
    const handleRowsPerPageChange = (newRowsPerPage) => {
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(1);
    };

    // Handle sorting
    const handleSort = (field) => {
        const validSortFields = ["id", "regency_id", "code_bps", "name_bps", "code_dagri", "name_dagri", "active", "code", "created_at", "updated_at"];
        const sortField = validSortFields.includes(field) ? field : "id";

        let direction = "asc";
        if (sortField === field) {
            direction = sortDirection === "asc" ? "desc" : "asc";
        }

        setSortField(sortField);
        setSortDirection(direction);
    };

    // Handle ekspor data ke JSON
    const handleExportJSON = () => {
        const jsonData = JSON.stringify(districts.data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "districts.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle ekspor data ke Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(districts.data.map(district => ({
            ...district,
            regency_name: district.regency?.name_bps || '',
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "districts");
        XLSX.writeFile(workbook, "districts.xlsx");
    };

    // react-select styles
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
                    <motion.div
                        className="w-full md:w-64"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Select
                            options={regencies.map(regency => ({ value: regency.id, label: regency.name_bps }))}
                            value={selectedRegency}
                            onChange={setSelectedRegency}
                            placeholder="Pilih Kabupaten"
                            isClearable
                            styles={selectStyles}
                        />
                    </motion.div>
                    <motion.input
                        type="text"
                        placeholder="Cari nama atau kode..."
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("regency_id")}>
                                Kabupaten {renderSortIcon("regency_id")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("code_bps")}>
                                Code BPS {renderSortIcon("code_bps")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("name_bps")}>
                                Name BPS {renderSortIcon("name_bps")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("code_dagri")}>
                                Code DAGRI {renderSortIcon("code_dagri")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("name_dagri")}>
                                Name DAGRI {renderSortIcon("name_dagri")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("active")}>
                                Active {renderSortIcon("active")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("code")}>
                                Code {renderSortIcon("code")}
                            </th>
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
                        ) : (districts?.data || []).length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                                    Tidak ada data
                                </td>
                            </tr>
                        ) : (
                            (districts?.data || []).map((district, index) => (
                                <tr key={district.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(currentPage - 1) * rowsPerPage + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {district.regency?.name_bps || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {district.code_bps || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {district.name_bps || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {district.code_dagri || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {district.name_dagri || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {district.active ? "Ya" : "Tidak"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {district.code || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => onView(district)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => onEdit(district)}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => onDelete(district.id)}
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
                        onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value))}
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
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded mr-2 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="mx-2">
                        Page {currentPage} of {districts?.last_page || 1}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === (districts?.last_page || 1)}
                        className="px-3 py-1 border rounded ml-2 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
