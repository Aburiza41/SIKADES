import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Select from "react-select";
import {
    FaUserTie,
    FaFileSignature,
    FaCalendarAlt,
    FaFilePdf,
    FaTrash,
} from "react-icons/fa";
import { HiInformationCircle } from "react-icons/hi";

export default function PositionsForm({
    jabatan,
    position, // slug of the position (e.g. 'kepala-desa')
    positions, // array of position objects
    setOfficialPosition,
    officialPosition,
}) {
    // console.log(position, jabatan);
    position = position?.position?.slug || null;
    const [selectedPosition, setSelectedPosition] = useState(position || null);

    // Animation variants
    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    };

    const inputVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 },
        },
        focus: {
            scale: 1.02,
            boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
        },
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };

    // Create options for the select dropdown
    const positionOptions = positions.map((pos) => ({
        value: pos.id,
        label: pos.name,
        slug: pos.slug, // include slug for matching
    }));

    // Find the initial position based on the slug prop
    useEffect(() => {
        // Pilih berdasarkan slug (position) atau nama jabatan (jabatan.name)
        let foundPosition = null;
        if (position && positions.length > 0) {
            foundPosition = positions.find((pos) => pos.slug === position);
        }
        if (!foundPosition && jabatan?.name && positions.length > 0) {
            foundPosition = positions.find(
                (pos) => pos.name.toLowerCase() === jabatan.name.toLowerCase()
            );
        }
        if (foundPosition) {
            const selectedOption = {
                value: foundPosition.id,
                label: foundPosition.name,
                slug: foundPosition.slug,
            };
            setSelectedPosition(selectedOption);
            setOfficialPosition({
                ...officialPosition,
                namaJabatan: foundPosition.name,
                jabatanId: foundPosition.id,
            });
        }
    }, [position, jabatan, positions]);

    const { penetap, nomorSk, tanggalSk, period, tmtJabatan } =
        officialPosition;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white w-full p-6 shadow-lg rounded-xl mt-8 border border-gray-100"
        >
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                        >
                            <FaUserTie className="text-3xl text-blue-500" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                C. JABATAN SAAT INI {jabatan?.name?.toUpperCase()}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                                <HiInformationCircle className="mr-1 text-blue-500" />
                                Formulir {jabatan?.name} ini digunakan untuk mengisi jabatan
                                pejabat desa.
                            </p>
                        </div>
                    </div>
                </div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        className="col-span-2 grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaUserTie className="mr-2 text-blue-500" /> 1.
                                File
                            </label>
                            <input
                                type="file"
                                onChange={(e) => {
                                    if (
                                        e.target.files &&
                                        e.target.files.length > 0
                                    ) {
                                        const selectedFile = e.target.files[0];

                                        // Validate file type (example: allow only images and PDFs)
                                        const allowedTypes = [
                                            "image/jpeg",
                                            "image/png",
                                            "image/gif",
                                            "application/pdf",
                                        ];
                                        if (
                                            !allowedTypes.includes(
                                                selectedFile.type
                                            )
                                        ) {
                                            alert(
                                                "Hanya file gambar (JPEG, PNG, GIF) atau PDF yang diizinkan"
                                            );
                                            e.target.value = ""; // Clear the input
                                            return;
                                        }

                                        // Validate file size (example: max 5MB)
                                        const maxSize = 5 * 1024 * 1024; // 5MB
                                        if (selectedFile.size > maxSize) {
                                            alert("Ukuran file maksimal 5MB");
                                            e.target.value = ""; // Clear the input
                                            return;
                                        }

                                        setOfficialPosition({
                                            ...officialPosition,
                                            file: selectedFile,
                                        });
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="image/*,.pdf" // This shows only image and PDF files in file selector
                                required
                            />
                        </motion.div>

                        {officialPosition.file && (
                            <div className="mt-2 flex flex-col items-start">
                                {/* Show preview for images */}
                                {officialPosition.file.type &&
                                officialPosition.file.type.startsWith(
                                    "image/"
                                ) ? (
                                    <img
                                        src={URL.createObjectURL(
                                            officialPosition.file
                                        )}
                                        alt="Preview"
                                        className="h-20 object-cover rounded mb-2"
                                    />
                                ) : (
                                    <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                                        <FaFilePdf className="text-red-500 mr-2 text-xl" />
                                        <span>
                                            {officialPosition.file.name}
                                        </span>
                                    </div>
                                )}

                                {/* File info */}
                                <div className="text-xs text-gray-500 mt-1">
                                    {officialPosition.file.name} •{" "}
                                    {(
                                        officialPosition.file.size /
                                        1024 /
                                        1024
                                    ).toFixed(2)}{" "}
                                    MB
                                </div>

                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOfficialPosition({
                                            ...officialPosition,
                                            file: null,
                                        });
                                        // You might need to add a ref to clear the input value
                                    }}
                                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                                >
                                    <FaTrash className="inline mr-1" /> HAPUS
                                    FILE
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Pejabat yang Menetapkan */}
                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FaUserTie className="mr-2 text-blue-500" /> PEJABAT
                            YANG MENETAPKAN
                        </label>
                        <motion.input
                            type="text"
                            value={penetap ? penetap.toUpperCase() : ""}
                            onChange={(e) =>
                                setOfficialPosition({
                                    ...officialPosition,
                                    penetap: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="PEJABAT YANG MENETAPKAN"

                            variants={inputVariants}
                        />
                    </motion.div>

                    {/* SK Pelantikan */}
                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FaFileSignature className="mr-2 text-blue-500" />{" "}
                            SK PELANTIKAN
                        </label>
                        <div className="flex gap-2">
                            <motion.input
                                type="text"
                                value={nomorSk ? nomorSk.toUpperCase() : ""}
                                onChange={(e) =>
                                    setOfficialPosition({
                                        ...officialPosition,
                                        nomorSk: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="NOMOR SK"

                                variants={inputVariants}
                            />
                            <motion.input
                                type="date"
                                value={tanggalSk || ""}
                                onChange={(e) =>
                                    setOfficialPosition({
                                        ...officialPosition,
                                        tanggalSk: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

                                variants={inputVariants}
                            />
                        </div>
                    </motion.div>

                    {/* Nama Jabatan */}
                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FaUserTie className="mr-2 text-blue-500" /> NAMA
                            JABATAN
                        </label>
                        <motion.div  variants={inputVariants}>
                            <Select
                                options={positionOptions.map(opt => ({
                                    ...opt,
                                    label: opt.label.toUpperCase(),
                                }))}
                                value={
                                    selectedPosition
                                        ? {
                                              ...selectedPosition,
                                              label: selectedPosition.label
                                                  ? selectedPosition.label.toUpperCase()
                                                  : "",
                                          }
                                        : null
                                }
                                onChange={(selectedOption) => {
                                    setSelectedPosition(selectedOption);
                                    setOfficialPosition({
                                        ...officialPosition,
                                        namaJabatan: selectedOption.label,
                                        jabatanId: selectedOption.value,
                                    });
                                }}
                                placeholder="PILIH JABATAN"
                                isClearable
                                isSearchable
                                className="mt-0"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: "42px",
                                        borderColor: "#d1d5db",
                                        "&:hover": {
                                            borderColor: "#d1d5db",
                                        },
                                        boxShadow: "none",
                                        "&:focus-within": {
                                            boxShadow:
                                                "0 0 0 2px rgba(59, 130, 246, 0.5)",
                                            borderColor: "transparent",
                                        },
                                    }),
                                }}
                            />
                        </motion.div>
                    </motion.div>

                    {/* Period */}
                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            PERIOD KE-
                        </label>
                        <motion.input
                            type="text"
                            value={period ? period.toUpperCase() : ""}
                            onChange={(e) =>
                                setOfficialPosition({
                                    ...officialPosition,
                                    period: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="PERIOD KE-"

                            variants={inputVariants}
                        />
                    </motion.div>

                    {/* TMT Jabatan */}
                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FaCalendarAlt className="mr-2 text-blue-500" /> TMT
                            JABATAN
                        </label>
                        <motion.input
                            type="date"
                            value={tmtJabatan || ""}
                            onChange={(e) =>
                                setOfficialPosition({
                                    ...officialPosition,
                                    tmtJabatan: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

                            variants={inputVariants}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}
