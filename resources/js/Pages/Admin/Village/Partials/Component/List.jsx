import { useState, useEffect, useCallback } from "react";
import { FaFileExport, FaEdit, FaEye, FaSort, FaSortUp, FaSortDown, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Select from "react-select";
import { debounce } from "lodash";
import Swal from "sweetalert2";
import { router } from "@inertiajs/react";

export default function VillageList({ villages, fetchData, loading, onEdit, onDelete, onView }) {
    const [filterText, setFilterText] = useState("");
    const [selectedRegency, setSelectedRegency] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [currentPage, setCurrentPage] = useState(villages?.current_page || 1);
    const [rowsPerPage, setRowsPerPage] = useState(villages?.per_page || 10);
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");


    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    // Debounced fetchData
    const debouncedFetchData = useCallback(
        debounce((params) => fetchData(params), 300),
        [fetchData]
    );

    // Fetch regencies on mount
    useEffect(() => {
        fetch("/local/regencies", {
            headers: {
                'Accept': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    setRegencies(data.data);
                } else {
                    console.error("Error fetching regencies:", data.message);
                    Swal.fire("Error", data.message || "Gagal mengambil data kabupaten.", "error");
                }
            })
            .catch((error) => {
                console.error("Error fetching regencies:", error);
                Swal.fire("Error", "Gagal mengambil data kabupaten.", "error");
            });
    }, []);

    // Fetch districts when regency changes
    useEffect(() => {
        if (selectedRegency) {
            fetch(`/local/districts/${selectedRegency.value}`, {
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.success) {
                        setDistricts(data.data);
                    } else {
                        console.error("Error fetching districts:", data.message);
                        Swal.fire("Error", data.message || "Gagal mengambil data kecamatan.", "error");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching districts:", error);
                    Swal.fire("Error", "Gagal mengambil data kecamatan.", "error");
                });
        } else {
            setDistricts([]);
            setSelectedDistrict(null);
        }
    }, [selectedRegency]);

    // Fetch data when parameters change
    useEffect(() => {
        debouncedFetchData({
            page: currentPage,
            perPage: rowsPerPage,
            search: filterText,
            sortField: sortField,
            sortDirection: sortDirection,
            regency_id: selectedRegency?.value || "",
            district_id: selectedDistrict?.value || "",
        });
    }, [currentPage, rowsPerPage, filterText, sortField, sortDirection, selectedRegency, selectedDistrict, debouncedFetchData]);

    // Handle export to JSON
    const handleExportJSON = () => {
        const jsonData = JSON.stringify(villages.data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "villages.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle export to Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            villages.data.map((village) => ({
                Nama: village.name_bps,
                Kode: village.code,
                Kecamatan: village.district?.name_bps || "-",
                Kabupaten: village.district?.regency?.name_bps || "-",
                'Code BPS': village.code_bps,
                'Name DAGRI': village.name_dagri,
                'Code DAGRI': village.code_dagri,
                Website: village.website || "-",
                Active: village.active ? "Ya" : "Tidak",
                Description: village.description || "-",
                'Logo Path': village.logo_path || "-",
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "villages");
        XLSX.writeFile(workbook, "villages.xlsx");
    };



    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle rows per page change
    const handleRowsPerPageChange = (newRowsPerPage) => {
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(1);
    };

    // Handle sorting
    const handleSort = (field) => {
        const validSortFields = ["id", "district_id", "name_bps", "code"];
        const sortField = validSortFields.includes(field) ? field : "id";

        let direction = "asc";
        if (sortField === field) {
            direction = sortDirection === "asc" ? "desc" : "asc";
        }

        setSortField(sortField);
        setSortDirection(direction);
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
                            options={regencies}
                            value={selectedRegency}
                            onChange={(option) => {
                                setSelectedRegency(option);
                                setSelectedDistrict(null);
                            }}
                            placeholder="Pilih Kabupaten"
                            isClearable
                            styles={selectStyles}
                        />
                    </motion.div>
                    <motion.div
                        className="w-full md:w-64"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Select
                            options={districts}
                            value={selectedDistrict}
                            onChange={setSelectedDistrict}
                            placeholder="Pilih Kecamatan"
                            isClearable
                            isDisabled={!selectedRegency}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("name_bps")}>
                                Nama {renderSortIcon("name_bps")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("code")}>
                                Kode {renderSortIcon("code")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("district_id")}>
                                Kecamatan {renderSortIcon("district_id")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kabupaten</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : (villages?.data || []).length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                    Tidak ada data
                                </td>
                            </tr>
                        ) : (
                            (villages?.data || []).map((village, index) => (
                                <tr key={village.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(currentPage - 1) * rowsPerPage + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {village.name_bps || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {village.code || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {village.district?.name_bps || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {village.district?.regency?.name_bps || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => onView(village)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => onEdit(village)}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => onDelete(village.id)}
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
                        Page {currentPage} of {villages?.last_page || 1}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === (villages?.last_page || 1)}
                        className="px-3 py-1 border rounded ml-2 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
