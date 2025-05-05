import React, { useState } from "react";
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

const ExcelImportModal = ({ onImport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi ekstensi file
            const allowedExtensions = [".xlsx", ".xls", ".csv"];
            const fileExtension = file.name
                .substring(file.name.lastIndexOf("."))
                .toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                alert(
                    "Format file tidak didukung! Harap unggah file Excel (.xlsx, .xls) atau CSV."
                );
                return;
            }

            // Validasi ukuran file (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran file terlalu besar! Maksimal 5MB.");
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            alert("Silakan pilih file terlebih dahulu!");
            return;
        }

        setIsLoading(true);
        try {
            // Panggil fungsi handleImportExcel dari props
            await onImport(selectedFile);
            setIsOpen(false);
            setSelectedFile(null);
        } catch (error) {
            console.error("Error importing file:", error);
            alert("Terjadi kesalahan saat mengimpor file");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Tombol Trigger Modal */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <FaFileUpload className="mr-2" /> Upload
            </motion.button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Import Dokumen Excel
                            </h3>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih File Excel
                                </label>
                                <div className="flex items-center">
                                    <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-600 cursor-pointer hover:bg-blue-50">
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                        <span className="mt-2 text-sm">
                                            Pilih File
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx, .xls, .csv"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    {selectedFile && (
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-700">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(
                                                    selectedFile.size / 1024
                                                ).toFixed(2)}{" "}
                                                KB
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                                <p className="font-medium mb-1">Catatan:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        Format file yang didukung: .xlsx, .xls,
                                        .csv
                                    </li>
                                    <li>Maksimal ukuran file: 5MB</li>
                                    <li>
                                        Pastikan struktur data sesuai template
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setSelectedFile(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!selectedFile || isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : (
                                    "Import"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExcelImportModal;
