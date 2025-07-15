import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaHome, FaPhone } from "react-icons/fa";
import { HiInformationCircle } from "react-icons/hi";

export default function OfficialTempatKerjaForm({
    tempat_kerja,
    setTempatKerja
}) {
    // State untuk data wilayah
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

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

    // Ambil data provinsi
    useEffect(() => {
        axios.get("/village/bps/wilayah")
            .then((response) => setProvinces(response.data))
            .catch((error) => console.error("Error fetching provinces:", error));
    }, []);

    // Handle perubahan provinsi
    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        const selectedProvince = provinces.find(province => province.kode_bps === e.target.value);
        setTempatKerja({
            ...tempat_kerja,
            province_code: selectedProvince?.kode_bps || "",
            province_name: selectedProvince?.nama_bps || "",
            regency_code: "",
            regency_name: "",
            district_code: "",
            district_name: "",
            village_code: "",
            village_name: "",
        });

        if (provinceCode) {
            axios.get(`/village/bps/wilayah/kabupaten/${provinceCode}`)
                .then((response) => setRegencies(response.data))
                .catch((error) => console.error("Error fetching regencies:", error));
        } else {
            setRegencies([]);
        }
        setDistricts([]);
        setVillages([]);
    };

    // Handle perubahan kabupaten
    const handleRegencyChange = (e) => {
        const regencyCode = e.target.value;
        const selectedRegency = regencies.find(regency => regency.kode_bps === e.target.value);
        setTempatKerja({
            ...tempat_kerja,
            regency_code: selectedRegency?.kode_bps || "",
            regency_name: selectedRegency?.nama_bps || "",
            district_code: "",
            district_name: "",
            village_code: "",
            village_name: "",
        });

        if (regencyCode) {
            axios.get(`/village/bps/wilayah/kecamatan/${regencyCode}`)
                .then((response) => setDistricts(response.data))
                .catch((error) => console.error("Error fetching districts:", error));
        } else {
            setDistricts([]);
        }
        setVillages([]);
    };

    // Handle perubahan kecamatan
    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        const selectedDistrict = districts.find(district => district.kode_bps === e.target.value);
        setTempatKerja({
            ...tempat_kerja,
            district_code: selectedDistrict?.kode_bps || "",
            district_name: selectedDistrict?.nama_bps || "",
            village_code: "",
            village_name: "",
        });

        if (districtCode) {
            axios.get(`/village/bps/wilayah/desa/${districtCode}`)
                .then((response) => setVillages(response.data))
                .catch((error) => console.error("Error fetching villages:", error));
        } else {
            setVillages([]);
        }
    };

    const handleVillageChange = (e) => {
        const selectedVillage = villages.find(village => village.kode_bps === e.target.value);
        setTempatKerja({
            ...tempat_kerja,
            village_code: selectedVillage?.kode_bps || "",
            village_name: selectedVillage?.nama_bps || "",
        });
    };

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
                            <FaMapMarkerAlt className="text-3xl text-blue-500" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                B. TEMPAT BEKERJA
                            </h1>
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                                <HiInformationCircle className="mr-1 text-blue-500" />
                                Formulir ini digunakan untuk mengisi tempat kerja pejabat desa.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alamat Lengkap */}
                <motion.div
                    className="grid grid-cols-1 gap-4 mb-6"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FaHome className="mr-2 text-blue-500" /> Alamat Lengkap
                        </label>
                        <motion.textarea
                            value={tempat_kerja.alamat}
                            onChange={(e) =>
                                setTempatKerja({
                                    ...tempat_kerja,
                                    alamat: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Contoh: Jl. Merdeka No. 123"
                            required

                            variants={inputVariants}
                            rows={3}
                        />
                    </motion.div>
                </motion.div>

                {/* RT, RW, Kode Pos */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            RT
                        </label>
                        <motion.input
                            type="number"
                            value={tempat_kerja.rt}
                            onChange={(e) =>
                                setTempatKerja({
                                    ...tempat_kerja,
                                    rt: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Contoh: 001"

                            variants={inputVariants}
                        />
                    </motion.div>
                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            RW
                        </label>
                        <motion.input
                            type="number"
                            value={tempat_kerja.rw}
                            onChange={(e) =>
                                setTempatKerja({
                                    ...tempat_kerja,
                                    rw: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Contoh: 002"

                            variants={inputVariants}
                        />
                    </motion.div>
                    <motion.div variants={rowVariants} className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kode Pos
                        </label>
                        <motion.input
                            type="number"
                            value={tempat_kerja.postal}
                            onChange={(e) =>
                                setTempatKerja({
                                    ...tempat_kerja,
                                    postal: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Contoh: 12345"

                            variants={inputVariants}
                        />
                    </motion.div>
                </motion.div>

                {/* Provinsi, Kabupaten, Kecamatan, Desa */}
                {/* <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Provinsi
                        </label>
                        <motion.select
                            value={tempat_kerja.province_code}
                            onChange={handleProvinceChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required

                            variants={inputVariants}
                        >
                            <option value="">Pilih Provinsi</option>
                            {provinces.map((province) => (
                                <option
                                    key={province.kode_bps}
                                    value={province.kode_bps}
                                >
                                    {province.nama_bps}
                                </option>
                            ))}
                        </motion.select>
                    </motion.div>

                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kabupaten/Kota
                        </label>
                        <motion.select
                            value={tempat_kerja.regency_code}
                            onChange={handleRegencyChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            disabled={!tempat_kerja.province_code}

                            variants={inputVariants}
                        >
                            <option value="">Pilih Kabupaten</option>
                            {regencies.map((regency) => (
                                <option
                                    key={regency.kode_bps}
                                    value={regency.kode_bps}
                                >
                                    {regency.nama_bps}
                                </option>
                            ))}
                        </motion.select>
                    </motion.div>

                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kecamatan
                        </label>
                        <motion.select
                            value={tempat_kerja.district_code}
                            onChange={handleDistrictChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            disabled={!tempat_kerja.regency_code}

                            variants={inputVariants}
                        >
                            <option value="">Pilih Kecamatan</option>
                            {districts.map((district) => (
                                <option
                                    key={district.kode_bps}
                                    value={district.kode_bps}
                                >
                                    {district.nama_bps}
                                </option>
                            ))}
                        </motion.select>
                    </motion.div>

                    <motion.div variants={rowVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Desa/Kelurahan
                        </label>
                        <motion.select
                            value={tempat_kerja.village_code}
                            onChange={handleVillageChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            disabled={!tempat_kerja.district_code}

                            variants={inputVariants}
                        >
                            <option value="">Pilih Desa</option>
                            {villages.map((village) => (
                                <option
                                    key={village.kode_bps}
                                    value={village.kode_bps}
                                >
                                    {village.nama_bps}
                                </option>
                            ))}
                        </motion.select>
                    </motion.div>
                </motion.div> */}
            </div>
        </motion.div>
    );
}
