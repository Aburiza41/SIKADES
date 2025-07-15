import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    FaIdCard,
    FaUser,
    FaBirthdayCake,
    FaVenusMars,
    FaPray,
    FaHome,
    FaPhone,
    FaGraduationCap,
    FaShieldAlt,
    FaBriefcase,
} from "react-icons/fa";
import { MdWork, MdBloodtype } from "react-icons/md";
import { GiFamilyHouse } from "react-icons/gi";
import { HiInformationCircle } from "react-icons/hi";

export default function OfficialIdentifyForm({ official, setOfficial }) {
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
        axios
            .get("/village/bps/wilayah")
            .then((response) => setProvinces(response.data))
            .catch((error) =>
                console.error("Error fetching provinces:", error)
            );
    }, []);

    // Handle perubahan provinsi
    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        const selectedProvince = provinces.find(
            (province) => province.kode_bps === e.target.value
        );
        setOfficial({
            ...official,
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
            axios
                .get(`/village/bps/wilayah/kabupaten/${provinceCode}`)
                .then((response) => setRegencies(response.data))
                .catch((error) =>
                    console.error("Error fetching regencies:", error)
                );
        } else {
            setRegencies([]);
        }
        setDistricts([]);
        setVillages([]);
    };

    // Handle perubahan kabupaten
    const handleRegencyChange = (e) => {
        const regencyCode = e.target.value;
        const selectedRegency = regencies.find(
            (regency) => regency.kode_bps === e.target.value
        );
        setOfficial({
            ...official,
            regency_code: selectedRegency?.kode_bps || "",
            regency_name: selectedRegency?.nama_bps || "",
            district_code: "",
            district_name: "",
            village_code: "",
            village_name: "",
        });

        if (regencyCode) {
            axios
                .get(`/village/bps/wilayah/kecamatan/${regencyCode}`)
                .then((response) => setDistricts(response.data))
                .catch((error) =>
                    console.error("Error fetching districts:", error)
                );
        } else {
            setDistricts([]);
        }
        setVillages([]);
    };

    // Handle perubahan kecamatan
    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        const selectedDistrict = districts.find(
            (district) => district.kode_bps === e.target.value
        );
        setOfficial({
            ...official,
            district_code: selectedDistrict?.kode_bps || "",
            district_name: selectedDistrict?.nama_bps || "",
            village_code: "",
            village_name: "",
        });

        if (districtCode) {
            axios
                .get(`/village/bps/wilayah/desa/${districtCode}`)
                .then((response) => setVillages(response.data))
                .catch((error) =>
                    console.error("Error fetching villages:", error)
                );
        } else {
            setVillages([]);
        }
    };

    const handleVillageChange = (e) => {
        const selectedVillage = villages.find(
            (village) => village.kode_bps === e.target.value
        );
        setOfficial({
            ...official,
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
                            <FaIdCard className="text-3xl text-blue-500" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                A. IDENTITAS PEJABAT DESA
                            </h1>
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                                <HiInformationCircle className="mr-1 text-blue-500" />
                                Formulir ini digunakan untuk mengisi identitas
                                pejabat desa.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-4 bg-gray-50 rounded border">



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                        className="col-span-2 grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaIdCard className="mr-2 text-blue-500" /> 1.
                                Foto
                            </label>
                            <input
                                type="file"
                                onChange={(e) => {
                                    // Ambil file pertama dari input
                                    const selectedFile = e.target.files[0];
                                    setOfficial({
                                        ...official,
                                        foto: selectedFile // Simpan objek File, bukan string
                                    });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required

                                variants={inputVariants}
                            />
                        </motion.div>
                        {official.foto instanceof Blob && (
                            <div className="mt-2">
                                <img
                                    src={URL.createObjectURL(official.foto)}
                                    alt="Preview"
                                    className="h-20 object-cover rounded"
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* 1. NIK */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaIdCard className="mr-2 text-blue-500" /> 1.
                                NIK
                            </label>
                            <motion.input
                                type="number"
                                value={official.nik}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (
                                        /^\d*$/.test(inputValue) &&
                                        inputValue.length <= 16
                                    ) {
                                        setOfficial({
                                            ...official,
                                            nik: inputValue,
                                        });
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Masukkan 16 digit NIK"
                                required

                                variants={inputVariants}
                            />
                            {official.nik && official.nik.length < 16 && (
                                <motion.p
                                    className="text-sm text-red-500 mt-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    NIK harus terdiri dari 16 angka.
                                </motion.p>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* 2. NIPD */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaIdCard className="mr-2 text-blue-500" /> 2.
                                NIPD
                            </label>
                            <motion.input
                                type="number"
                                value={official.nipd}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        nipd: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Masukkan NIPD"

                                variants={inputVariants}
                            />
                        </motion.div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 3. Nama Lengkap */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaUser className="mr-2 text-blue-500" /> 3.
                                Nama Lengkap
                            </label>
                            <motion.input
                                type="text"
                                value={official.nama_lengkap}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        nama_lengkap: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Masukkan nama lengkap"
                                required

                                variants={inputVariants}
                            />
                        </motion.div>
                    </motion.div>

                    {/* 4. Gelar Kesarjanaan */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                4. Gelar Depan
                            </label>
                            <motion.input
                                type="text"
                                value={official.gelar_depan}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        gelar_depan: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Gelar depan (contoh: Dr.)"

                                variants={inputVariants}
                            />
                        </motion.div>
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gelar Belakang
                            </label>
                            <motion.input
                                type="text"
                                value={official.gelar_belakang}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        gelar_belakang: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Gelar belakang (contoh: S.T.)"

                                variants={inputVariants}
                            />
                        </motion.div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 5. Tempat/Tgl Lahir */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaBirthdayCake className="mr-2 text-blue-500" />{" "}
                                5. Tempat Lahir
                            </label>
                            <motion.input
                                type="text"
                                value={official.tempat_lahir}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        tempat_lahir: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Masukkan tempat lahir"
                                required

                                variants={inputVariants}
                            />
                        </motion.div>
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaBirthdayCake className="mr-2 text-blue-500" />{" "}
                                Tanggal Lahir
                            </label>
                            <motion.input
                                type="date"
                                value={official.tanggal_lahir}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        tanggal_lahir: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required

                                variants={inputVariants}
                            />
                        </motion.div>
                    </motion.div>

                    {/* 6. Jenis Kelamin */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaVenusMars className="mr-2 text-blue-500" />{" "}
                                6. Jenis Kelamin
                            </label>
                            <div className="flex gap-4 items-center flex-col-2">
                                <motion.label
                                    className="w-full inline-flex items-center p-3 rounded-lg hover:bg-blue-50 cursor-pointer border border-gray-200"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <input
                                        type="radio"
                                        value="L"
                                        checked={official.jenis_kelamin === "L"}
                                        onChange={(e) =>
                                            setOfficial({
                                                ...official,
                                                jenis_kelamin: e.target.value,
                                            })
                                        }
                                        className="rounded border-gray-300 text-blue-600 shadow-sm h-5 w-5"
                                        required
                                    />
                                    <span className="ml-2 text-gray-700">
                                        1. Laki-laki
                                    </span>
                                </motion.label>
                                <motion.label
                                    className="w-full inline-flex items-center p-3 rounded-lg hover:bg-blue-50 cursor-pointer border border-gray-200"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <input
                                        type="radio"
                                        value="P"
                                        checked={official.jenis_kelamin === "P"}
                                        onChange={(e) =>
                                            setOfficial({
                                                ...official,
                                                jenis_kelamin: e.target.value,
                                            })
                                        }
                                        className="rounded border-gray-300 text-blue-600 shadow-sm h-5 w-5"
                                    />
                                    <span className="ml-2 text-gray-700">
                                        2. Perempuan
                                    </span>
                                </motion.label>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {/* 7. Agama */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaPray className="mr-2 text-blue-500" /> 7.
                                Agama
                            </label>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {[
                                    "Islam",
                                    "Protestan",
                                    "Katholik",
                                    "Hindu",
                                    "Budha",
                                    "Konghuchu",
                                ].map((agama, index) => (
                                    <motion.label
                                        key={agama}
                                        className="inline-flex items-center p-3 rounded-lg hover:bg-blue-50 cursor-pointer border border-gray-200"
                                        whileHover={{ scale: 1.02 }}
                                        variants={rowVariants}
                                    >
                                        <input
                                            type="radio"
                                            value={agama}
                                            checked={official.agama === agama}
                                            onChange={(e) =>
                                                setOfficial({
                                                    ...official,
                                                    agama: e.target.value,
                                                })
                                            }
                                            className="rounded border-gray-300 text-blue-600 shadow-sm h-5 w-5"
                                            required
                                        />
                                        <span className="ml-2 text-gray-700">
                                            {index + 1}. {agama}
                                        </span>
                                    </motion.label>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* 8. Status Perkawinan */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <GiFamilyHouse className="mr-2 text-blue-500" />{" "}
                                8. Status Perkawinan
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {["Belum Kawin", "Kawin", "Janda", "Duda"].map(
                                    (status, index) => (
                                        <motion.label
                                            key={status}
                                            className="inline-flex items-center p-3 rounded-lg hover:bg-blue-50 cursor-pointer border border-gray-200"
                                            whileHover={{ scale: 1.02 }}
                                            variants={rowVariants}
                                        >
                                            <input
                                                type="radio"
                                                value={status}
                                                checked={
                                                    official.status_perkawinan ===
                                                    status
                                                }
                                                onChange={(e) =>
                                                    setOfficial({
                                                        ...official,
                                                        status_perkawinan:
                                                            e.target.value,
                                                    })
                                                }
                                                className="rounded border-gray-300 text-blue-600 shadow-sm h-5 w-5"
                                                required
                                            />
                                            <span className="ml-2 text-gray-700">
                                                {index + 1}. {status}
                                            </span>
                                        </motion.label>
                                    )
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 9. Alamat Tempat Tinggal */}
                    <motion.div
                        className="col-span-3 gap-4"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"

                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <FaHome className="mr-2 text-blue-500" /> 9.
                                Alamat Tempat Tinggal
                            </label>
                            <motion.textarea
                                value={official.alamat}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        alamat: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="JALAN..."
                                required

                                variants={inputVariants}
                                rows={3}
                            />
                        </motion.div>
                    </motion.div>

                    {/* RT, RW, Kode Pos */}
                    <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                RT
                            </label>
                            <motion.input
                                type="number"
                                value={official.rt}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        rt: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="RT"

                                variants={inputVariants}
                            />
                        </motion.div>
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                RW
                            </label>
                            <motion.input
                                type="number"
                                value={official.rw}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        rw: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="RW"

                                variants={inputVariants}
                            />
                        </motion.div>
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kode Pos
                            </label>
                            <motion.input
                                type="number"
                                value={official.postal}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        postal: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Kode Pos"

                                variants={inputVariants}
                            />
                        </motion.div>

                    {/* Provinsi, Kabupaten, Kecamatan, Desa */}
                    <motion.div
                        className="col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Provinsi
                            </label>
                            <motion.select
                                value={official.province_code}
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
                                value={official.regency_code}
                                onChange={handleRegencyChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                                disabled={!official.province_code}

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
                                value={official.district_code}
                                onChange={handleDistrictChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                                disabled={!official.regency_code}

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
                                value={official.village_code}
                                onChange={handleVillageChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                                disabled={!official.district_code}

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
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 10. Golongan Darah */}
                    <motion.div
                        className="col-span-2 grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <MdBloodtype className="mr-2 text-blue-500" />{" "}
                                10. Golongan Darah
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {["A", "B", "AB", "O"].map((gol, index) => (
                                    <motion.label
                                        key={gol}
                                        className="inline-flex items-center p-3 rounded-lg hover:bg-blue-50 cursor-pointer border border-gray-200"
                                        whileHover={{ scale: 1.02 }}
                                        variants={rowVariants}
                                    >
                                        <input
                                            type="radio"
                                            value={gol}
                                            checked={official.gol_darah === gol}
                                            onChange={(e) =>
                                                setOfficial({
                                                    ...official,
                                                    gol_darah: e.target.value,
                                                })
                                            }
                                            className="rounded border-gray-300 text-blue-600 shadow-sm h-5 w-5"
                                        />
                                        <span className="ml-2 text-gray-700">
                                            {index + 1}. {gol}
                                        </span>
                                    </motion.label>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* 11. Nomor Handphone */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaPhone className="mr-2 text-blue-500" /> 11.
                                Nomor Handphone
                            </label>
                            <motion.input
                                type="tel"
                                value={official.handphone}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (
                                        /^\d*$/.test(inputValue) &&
                                        inputValue.length <= 15
                                    ) {
                                        setOfficial({
                                            ...official,
                                            handphone: inputValue,
                                        });
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Masukkan nomor handphone"
                                required

                                variants={inputVariants}
                            />
                        </motion.div>
                    </motion.div>

                    {/* 12. Pendidikan Terakhir */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaGraduationCap className="mr-2 text-blue-500" />{" "}
                                12. Pendidikan Terakhir
                            </label>

                            <motion.select
                                value={official.pendidikan}
                                onChange={(e) =>
                                    setOfficial({
                                        ...official,
                                        pendidikan: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required

                                variants={inputVariants}
                            >
                                <option value="">Pilih Pendidikan</option>
                                <option value="SD/MI">SD/MI</option>
                                <option value="SMP/MTS">SMP/MTS</option>
                                <option value="SMA/SMK/MA">SMA/SMK/MA</option>
                                <option value="D1">D1</option>
                                <option value="D2">D2</option>
                                <option value="D3">D3</option>
                                <option value="D4">D4</option>
                                <option value="S1">S1</option>
                                <option value="S2">S2</option>
                                <option value="S3">S3</option>
                            </motion.select>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 13. BPJS Kesehatan */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaShieldAlt className="mr-2 text-blue-500" />{" "}
                                13. Nomor BPJS Kesehatan
                            </label>
                            <motion.input
                                type="text"
                                value={official.bpjs_kesehatan}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (/^\d*$/.test(inputValue)) {
                                        setOfficial({
                                            ...official,
                                            bpjs_kesehatan: inputValue,
                                        });
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Masukkan nomor BPJS Kesehatan"

                                variants={inputVariants}
                            />
                        </motion.div>
                    </motion.div>

                    {/* 14. BPJS Ketenagakerjaan */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaBriefcase className="mr-2 text-blue-500" />{" "}
                                14. Nomor BPJS Ketenagakerjaan
                            </label>
                            <motion.input
                                type="text"
                                value={official.bpjs_ketenagakerjaan}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (/^\d*$/.test(inputValue)) {
                                        setOfficial({
                                            ...official,
                                            bpjs_ketenagakerjaan: inputValue,
                                        });
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Masukkan nomor BPJS Ketenagakerjaan"

                                variants={inputVariants}
                            />
                        </motion.div>
                    </motion.div>

                    {/* 15. NPWP */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 mb-6"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={rowVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <MdWork className="mr-2 text-blue-500" /> 15.
                                NPWP
                            </label>
                            <motion.input
                                type="text"
                                value={official.npwp}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (/^\d*$/.test(inputValue)) {
                                        setOfficial({
                                            ...official,
                                            npwp: inputValue,
                                        });
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Masukkan NPWP"

                                variants={inputVariants}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
            </div>
        </motion.div>
    );
}
