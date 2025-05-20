import { motion } from "framer-motion";

export default function OfficialIdentityForm({
    identity,
    setIdentity,
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
                <h1 className="text-2xl font-semibold text-gray-700">D. Formulir Identitas Tambahan Pejabat</h1>
                {/* Keterangan Formulir */}
                <p className="text-sm text-gray-500">
                    Formulir ini digunakan untuk mengisi identitas tambahan pejabat desa.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Field Golongan Darah */}
                <div >
                    <label className="block text-sm font-medium text-gray-700">
                        Golongan Darah
                    </label>
                    <select
                        value={identity.gol_darah}
                        onChange={(e) =>
                            setIdentity({
                                ...identity,
                                gol_darah: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="">Pilih Golongan Darah</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>
                </div>

                {/* Field Pendidikan Terakhir
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Pendidikan Terakhir
                    </label>
                    <select
                        value={identity.pendidikan}
                        onChange={(e) =>
                            setIdentity({
                                ...identity,
                                pendidikan: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                    </select>
                </div> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field BPJS Kesehatan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        BPJS Kesehatan
                    </label>
                    <input
                        type="text"
                        value={identity.bpjs_kesehatan}
                        onChange={(e) => {
                            const inputValue = e.target.value;
                            if (/^\d*$/.test(inputValue) && inputValue.length <= 20) {
                                setIdentity({
                                    ...identity,
                                    bpjs_kesehatan: inputValue,
                                });
                            }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: 12345678901234567890"
                        maxLength={20}
                        required
                    />
                    {identity?.bpjs_kesehatan?.length > 20 && (
                        <p className="text-sm text-red-500">
                            Nomor BPJS Kesehatan tidak boleh lebih dari 20 digit.
                        </p>
                    )}
                </div>

                {/* Field BPJS Ketenagakerjaan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        BPJS Ketenagakerjaan
                    </label>
                    <input
                        type="text"
                        value={identity.bpjs_ketenagakerjaan}
                        onChange={(e) => {
                            const inputValue = e.target.value;
                            if (/^\d*$/.test(inputValue) && inputValue.length <= 20) {
                                setIdentity({
                                    ...identity,
                                    bpjs_ketenagakerjaan: inputValue,
                                });
                            }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: 12345678901234567890"
                        maxLength={20}
                        required
                    />
                    {identity?.bpjs_ketenagakerjaan?.length > 20 && (
                        <p className="text-sm text-red-500">
                            Nomor BPJS Ketenagakerjaan tidak boleh lebih dari 20 digit.
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Field NPWP */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        NPWP
                    </label>
                    <input
                        type="text"
                        value={identity.npwp}
                        onChange={(e) => {
                            const inputValue = e.target.value;
                            if (/^\d*$/.test(inputValue) && inputValue.length <= 20) {
                                setIdentity({
                                    ...identity,
                                    npwp: inputValue,
                                });
                            }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: 12345678901234567890"
                        maxLength={20}
                        required
                    />
                    {identity?.npwp?.length > 20 && (
                        <p className="text-sm text-red-500">
                            Nomor NPWP tidak boleh lebih dari 20 digit.
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}