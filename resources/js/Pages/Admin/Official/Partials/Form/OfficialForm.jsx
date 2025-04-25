import { motion } from "framer-motion";

export default function OfficialForm({
    official,
    setOfficial
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white w-full p-4 shadow rounded-lg space-y-4"
        >
            <div className="space-y-0 border-b">
                {/* Judul Form */}
                <h1 className="text-2xl font-semibold text-gray-700">A. IDENTITAS</h1>
                {/* Keterangan Formulir */}
                <p className="text-sm text-gray-500">
                    Formulir ini digunakan untuk mengisi identitas pejabat desa.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Field NIK */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        NIK
                    </label>
                    <input
                        type="number"
                        value={official.nik}
                        onChange={(e) => {
                            const inputValue = e.target.value;
                            if (
                                /^\d*$/.test(inputValue) &&
                                inputValue.length <= 16
                            ) {
                                setOfficial({ ...official, nik: inputValue });
                            }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: 1234567890123456"
                        required
                    />
                    {official.nik.length < 16 && (
                        <p className="text-sm text-red-500">
                            NIK harus terdiri dari 16 angka.
                        </p>
                    )}
                </div>

                    {/* Field NIAD */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        NIPD
                    </label>
                    <input
                        type="number"
                        value={official.nipd}
                        onChange={(e) =>
                            setOfficial({ ...official, nipd: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: 1234567890"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field Nama Lengkap */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Nama Lengkap
                    </label>
                    <input
                        type="text"
                        value={official.nama_lengkap}
                        onChange={(e) =>
                            setOfficial({
                                ...official,
                                nama_lengkap: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: John Doe"
                        required
                    />
                </div>
                {/* Field Gelar Depan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Gelar Depan
                    </label>
                    <input
                        type="text"
                        value={official.gelar_depan}
                        onChange={(e) =>
                            setOfficial({
                                ...official,
                                gelar_depan: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: Dr."
                    />
                </div>



                {/* Field Gelar Belakang */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Gelar Belakang
                    </label>
                    <input
                        type="text"
                        value={official.gelar_belakang}
                        onChange={(e) =>
                            setOfficial({
                                ...official,
                                gelar_belakang: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: S.T."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field Tempat Lahir */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Tempat Lahir
                    </label>
                    <input
                        type="text"
                        value={official.tempat_lahir}
                        onChange={(e) =>
                            setOfficial({
                                ...official,
                                tempat_lahir: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: Jakarta"
                        required
                    />
                </div>

                {/* Field Tanggal Lahir */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Tanggal Lahir
                    </label>
                    <input
                        type="date"
                        value={official.tanggal_lahir}
                        onChange={(e) =>
                            setOfficial({
                                ...official,
                                tanggal_lahir: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Field Jenis Kelamin */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Jenis Kelamin
                    </label>
                    <select
                        value={official.jenis_kelamin}
                        onChange={(e) =>
                            setOfficial({
                                ...official,
                                jenis_kelamin: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </select>
                </div>

                {/* Field Agama */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Agama
                    </label>
                    <select
                        value={official.agama}
                        onChange={(e) =>
                            setOfficial({ ...official, agama: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    >
                        <option value="">Pilih Agama</option>
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Konghucu">Konghucu</option>
                    </select>
                </div>

                {/* Field Status Perkawinan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Status Perkawinan
                    </label>
                    <select
                        value={official.status_perkawinan}
                        onChange={(e) =>
                            setOfficial({
                                ...official,
                                status_perkawinan: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    >
                        <option value="Belum Menikah">Belum Menikah</option>
                        <option value="Menikah">Menikah</option>
                        <option value="Cerai">Cerai</option>
                        <option value="Duda">Duda</option>
                        <option value="Janda">Janda</option>
                    </select>
                </div>
            </div>


        </motion.div>
    );
}
