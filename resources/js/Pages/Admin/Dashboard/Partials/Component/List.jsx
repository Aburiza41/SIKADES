import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
    FaFileExport,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaFileUpload,
    FaFileAlt,
    FaFileExcel,
    FaArrowLeft,
    FaArrowRight,
    FaFilePdf,
    FaPlus,
} from "react-icons/fa";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Actions from "./Actions";
import { router, usePage, Link } from "@inertiajs/react";
import Procces from "./Procces";
import ExcelImportModal from "../Form/ExcelImportModal";

export default function List({
    officials,
    fetchData,
    onView,
    onPrint,
}) {
    const user = usePage().props.auth.user;
    const [filterText, setFilterText] = useState("");
    const [educationFilter, setEducationFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(
        officials?.current_page || 1
    );
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
    }, [
        currentPage,
        rowsPerPage,
        filterText,
        educationFilter,
        sortField,
        sortDirection,
    ]);

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

    // const handleExport = async (type) => {
    //     try {
    //         const params = {
    //             page: currentPage,
    //             per_page: rowsPerPage,
    //             search: filterText,
    //             filters: educationFilter,
    //             sort_field: sortField,
    //             sort_direction: sortDirection,
    //         };

    //         const response = await axios.get(
    //             `/admin/official/${position.slug}/export/${type}`,
    //             {
    //                 params,
    //                 responseType: "blob", // Important for file downloads
    //             }
    //         );

    //         // Determine file extension and content type
    //         const extensions = {
    //             json: "json",
    //             excel: "xlsx",
    //             pdf: "pdf",
    //         };
    //         const contentType = {
    //             json: "application/json",
    //             excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //             pdf: "application/pdf",
    //         };

    //         // Create download link
    //         const url = window.URL.createObjectURL(
    //             new Blob([response.data], {
    //                 type: contentType[type],
    //             })
    //         );
    //         const link = document.createElement("a");
    //         link.href = url;
    //         link.setAttribute(
    //             "download",
    //             `Pejabat_${position.slug}_${new Date().toLocaleDateString()}.${
    //                 extensions[type]
    //             }`
    //         );
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();

    //         // Show success notification
    //         Swal.fire(
    //             "Success",
    //             `${type.toUpperCase()} exported successfully!`,
    //             "success"
    //         );
    //     } catch (error) {
    //         console.error(`Export ${type} error:`, error);
    //         Swal.fire(
    //             "Error",
    //             `Failed to export ${type.toUpperCase()}. Please try again.`,
    //             "error"
    //         );
    //     }
    // };

    // // Usage:
    // const handleExportJSON = () => handleExport("json");
    // const handleExportExcel = () => handleExport("excel");
    // const handleExportPDF = () => handleExport("pdf");

    const renderSortIcon = (field) => {
        if (sortField !== field) return <FaSort className="ml-1" />;
        return sortDirection === "asc" ? (
            <FaSortUp className="ml-1" />
        ) : (
            <FaSortDown className="ml-1" />
        );
    };

    // const handleImportExcel = async (file) => {
    //     // Tampilkan loading indicator
    //     // Swal.fire({
    //     //     title: "Memproses File",
    //     //     html: "Sedang mengupload dan memproses file Excel...",
    //     //     allowOutsideClick: false,
    //     //     didOpen: () => {
    //     //         Swal.showLoading();
    //     //     },
    //     // });

    //     try {
    //         const formData = new FormData();
    //         formData.append("file", file);

    //         const response = await axios.post(
    //             `/admin/official/${position.slug}/import/excel`,
    //             formData,
    //             {
    //                 headers: {
    //                     "Content-Type": "multipart/form-data",
    //                 },
    //             }
    //         );

    //         // Tutup loading dan tampilkan sukses
    //         Swal.fire({
    //             icon: "success",
    //             title: "Import Berhasil!",
    //             html: `
    //             <div class="text-left">
    //                 <p>File <strong>${file.name}</strong> berhasil diimport.</p>
    //                 ${
    //                     response.data.inserted
    //                         ? `<p>Total data: <strong>${response.data.inserted}</strong></p>`
    //                         : ""
    //                 }
    //             </div>
    //         `,
    //             confirmButtonText: "OK",
    //             willClose: () => {
    //                 // Lakukan sesuatu setelah alert ditutup
    //                 // Misalnya refresh data atau reset form
    //             },
    //         });

    //         return response.data;
    //     } catch (error) {
    //         let errorMessage = "Terjadi kesalahan saat mengimport file";

    //         if (error.response) {
    //             // Error dari server (4xx/5xx)
    //             errorMessage =
    //                 error.response.data.message ||
    //                 `Error ${error.response.status}: ${error.response.statusText}`;
    //         } else if (error.request) {
    //             // Tidak ada response dari server
    //             errorMessage =
    //                 "Tidak ada respon dari server. Silakan coba lagi.";
    //         } else if (error.message.includes("Network Error")) {
    //             errorMessage =
    //                 "Koneksi jaringan bermasalah. Periksa koneksi internet Anda.";
    //         }

    //         Swal.fire({
    //             icon: "error",
    //             title: "Import Gagal",
    //             html: `
    //             <div class="text-left">
    //                 <p>${errorMessage}</p>
    //                 ${file ? `<p>File: <strong>${file.name}</strong></p>` : ""}
    //             </div>
    //         `,
    //             confirmButtonText: "Tutup",
    //         });

    //         throw error;
    //     }
    // };

    const CustomBadge = ({ role }) => {
        let badgeColor = "";
        let roleName = "";

        switch (role) {
            case "tolak":
                badgeColor = "bg-red-500";
                roleName = "Tolak";
                break;
            case "daftar":
                badgeColor = "bg-blue-500";
                roleName = "Daftar";
                break;
            case "validasi":
                badgeColor = "bg-green-500";
                roleName = "Terima";
                break;
            case "proses":
                badgeColor = "bg-yellow-500";
                roleName = "Proses";
                break;
            default:
                badgeColor = "bg-gray-500";
                roleName = "Tidak Diketahui";
        }

        return (
            <span
                className={`px-2 py-1 text-xs text-white rounded-full ${badgeColor}`}
            >
                {roleName}
            </span>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg ">
            {/* Header dengan pencarian dan filter */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex flex-col gap-1 w-full">
                        <label htmlFor="search" className="text-sm font-medium">
                            Pencarian
                        </label>
                        <motion.input
                            type="text"
                            id="search"
                            name="search"
                            placeholder="Pencarian ..."
                            value={filterText}
                            onChange={(e) => {
                            e.persist(); // Add this for React synthetic event handling
                            setFilterText(e.target.value);
                            }}
                            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-auto"
                            whileHover={{ scale: 1.02 }}
                            whileFocus={{
                            scale: 1.02,
                            transition: { duration: 0.1 } // Faster transition for focus
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }} // Added damping
                            onFocus={(e) => {
                            e.target.select(); // Optional: selects all text when focused
                            }}
                        />
                        </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="education"
                            className="text-sm font-medium"
                        >
                            Pendidikan
                        </label>
                        <select
                            id="education"
                            name="education"
                            value={educationFilter}
                            onChange={(e) => setEducationFilter(e.target.value)}
                            className="border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua</option>
                            {educationOptions.map((education, index) => (
                                <option key={index} value={education}>
                                    {education}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

            </div>

            {/* Tabel biasa dengan overflow horizontal */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: "70px" }}
                            >
                                No
                            </th>
                            <th
                                scope="col"
                                className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: "250px" }}
                                onClick={() => handleSort("nama_lengkap")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    Nama Lengkap
                                    {/* {renderSortIcon("nama_lengkap")} */}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: "150px" }}
                                onClick={() => handleSort("nik")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    NIK
                                    {/* {renderSortIcon("nik")} */}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: "150px" }}
                                onClick={() => handleSort("nipd")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    NIPD
                                    {/* {renderSortIcon("nipd")} */}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: "150px" }}
                                onClick={() => handleSort("pendidikan")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    Pendidikan
                                    {/* {renderSortIcon("pendidikan")} */}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: "150px" }}
                                // onClick={() => handleSort("pendidikan")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    Jabatan
                                    {/* {renderSortIcon("pendidikan")} */}
                                </div>
                            </th>

                            <th
                                scope="col"
                                className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: "150px" }}
                                // onClick={() => handleSort("pendidikan")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    Pelatihan
                                    {/* {renderSortIcon("pendidikan")} */}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: "150px" }}
                                // onClick={() => handleSort("pendidikan")}
                            >
                                <div className="flex items-center cursor-pointer">
                                    Organisasi
                                    {/* {renderSortIcon("pendidikan")} */}
                                </div>
                            </th>
                            <th className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Desa
                            </th>
                            <th className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kecamatan
                            </th>
                            {/* <th className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kabupaten
                            </th> */}
                            <th className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            {/* { (user.role == 'regency')  (
                                    <th
                                        scope="col"
                                        className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        style={{ width: "120px" }}
                                    >
                                        Proses
                                    </th>
                                )
                            } */}
                            {/* <th
                                scope="col"
                                className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: "120px" }}
                            >
                                Proses
                            </th> */}
                            <th
                                scope="col"
                                className="px-2 py-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: "120px" }}
                            >
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        { officials?.data?.length > 0 ? (
                            officials.data.map((row, index) => (
                                <tr key={row.id}>
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        {(currentPage - 1) * rowsPerPage +
                                            index +
                                            1}
                                    </td>
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        <span className="font-semibold">{row.nama_lengkap}</span>  (
                                            {calculateAge(
                                                row?.tanggal_lahir
                                            )}{" "}
                                            th)
                                    </td>
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        {row.nik}
                                    </td>
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        {row.nipd}
                                    </td>
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        {row?.identities?.pendidikan_terakhir || "-"}
                                    </td>
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        {row?.positions?.position?.name || "-"}
                                    </td>
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        {row?.officialTrainings || "-"}
                                    </td>
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        {row?.officialOrganizations || "-"}
                                    </td>
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        {row.village.name_bps || "-"}
                                    </td>
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        {row.village.district.name_bps || "-"}
                                    </td>
                                    {/* <td className="px-2 py-2 border whitespace-nowrap">
                                        {row.village.district.regency
                                            .name_bps || "-"}
                                    </td> */}
                                    <td className="border px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                        <CustomBadge role={row.status} />
                                    </td>
                                    {/* <td className="border px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                        <Procces
                                            row={row}
                                            onAccept={onAccept}
                                            onReject={onReject}
                                        />
                                    </td> */}
                                    <td className="px-2 py-2 border whitespace-nowrap">
                                        <Actions
                                            row={row}
                                            // onEdit={onEdit}
                                            // onDelete={onDelete}
                                            onView={onView}
                                            onPrint={onPrint}
                                            // role={role}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-6 py-4 text-center"
                                >
                                    Tidak ada data yang ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4">
                <div className="mb-2 md:mb-0 flex items-center gap-4">
                    <div className="flex items-center">
                        <select
                            id="rowsPerPage"
                            value={rowsPerPage}
                            onChange={handleRowsPerPageChange}
                            className="border rounded"
                        >
                            {[5, 10, 25, 50, 100].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                    <span className="text-sm text-gray-700">
                        <span className="font-medium">
                            {(currentPage - 1) * rowsPerPage + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-medium">
                            {Math.min(
                                currentPage * rowsPerPage,
                                officials?.total || 0
                            )}
                        </span>{" "}
                        Total{" "}
                        <span className="font-medium">
                            {officials?.total || 0}
                        </span>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50 bg-green-700 text-white"
                        >
                            <FaArrowLeft />
                        </button>
                        {Array.from(
                            {
                                length: Math.ceil(
                                    (officials?.total || 0) / rowsPerPage
                                ),
                            },
                            (_, i) => i + 1
                        )
                            .slice(
                                Math.max(0, currentPage - 3),
                                Math.min(
                                    Math.ceil(
                                        (officials?.total || 0) / rowsPerPage
                                    ),
                                    currentPage + 2
                                )
                            )
                            .map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 border rounded ${
                                        currentPage === page
                                            ? "bg-green-700 text-white opacity-50"
                                            : ""
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={
                                currentPage ===
                                Math.ceil((officials?.total || 0) / rowsPerPage)
                            }
                            className="px-3 py-1 border rounded disabled:opacity-50 bg-green-700 text-white"
                        >
                            <FaArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper untuk menghitung usia
const calculateAge = (birthDate) => {
    if (!birthDate) return "-";
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
        age--;
    }
    return age;
};
