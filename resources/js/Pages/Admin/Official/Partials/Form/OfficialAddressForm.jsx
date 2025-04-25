import { motion } from "framer-motion";

export default function AddressForm({
    address,
    setAddress,
    provinces,
    regencies,
    districts,
    villages,
    handleProvinceChange,
    handleRegencyChange,
    handleDistrictChange,
    handleVillageChange,
}) {
    // console.log("halaman address",address.alamat//);
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white w-full p-4 shadow rounded-lg space-y-4"
        >

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Field Alamat Lengkap */}
                <div className="col-span-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Alamat Lengkap
                    </label>
                    <textarea
                        value={address.alamat}
                        onChange={(e) =>
                            setAddress({
                                ...address,
                                alamat: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: Jl. Merdeka No. 123"
                        required
                    />
                </div>

                {/* Field RT */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        RT
                    </label>
                    <input
                        type="number"
                        value={address.rt}
                        onChange={(e) =>
                            setAddress({
                                ...address,
                                rt: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: 001"
                    />
                </div>

                {/* Field RW */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        RW
                    </label>
                    <input
                        type="number"
                        value={address.rw}
                        onChange={(e) =>
                            setAddress({
                                ...address,
                                rw: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: 002"
                    />
                </div>
                {/* Field RW */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Kode Pos
                    </label>
                    <input
                        type="number"
                        value={address.postal}
                        onChange={(e) =>
                            setAddress({
                                ...address,
                                postal: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: 002"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Field Provinsi */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Provinsi
                    </label>
                    <select
                        value={address.province_code}
                        onChange={(e) => {
                            handleProvinceChange(e);
                            setAddress({
                                ...address,
                                province_code: e.target.value,
                                province_name: e.target.selectedOptions[0].text,
                            });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
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
                    </select>
                </div>

                {/* Field Kabupaten */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Kabupaten
                    </label>
                    <select
                        value={address.regency_code}
                        onChange={(e) => {
                            handleRegencyChange(e);
                            setAddress({
                                ...address,
                                regency_code: e.target.value,
                                regency_name: e.target.selectedOptions[0].text,
                            });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
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
                    </select>
                </div>

                {/* Field Kecamatan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Kecamatan
                    </label>
                    <select
                        value={address.district_code}
                        onChange={(e) => {
                            handleDistrictChange(e);
                            setAddress({
                                ...address,
                                district_code: e.target.value,
                                district_name: e.target.selectedOptions[0].text,
                            });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
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
                    </select>
                </div>

                {/* Field Desa */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Desa
                    </label>
                    <select
                        value={address.village_code}
                        onChange={(e) => {
                            handleVillageChange(e);
                            setAddress({
                                ...address,
                                village_code: e.target.value,
                                village_name: e.target.selectedOptions[0].text,
                            });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
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
                    </select>
                </div>
            </div>
        </motion.div>
    );
}
