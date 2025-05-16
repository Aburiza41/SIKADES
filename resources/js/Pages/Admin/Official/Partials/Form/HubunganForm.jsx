import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function HubunganForm({
    hubungan,
    setHubungan
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white w-full p-4 shadow rounded-lg space-y-4"
        >
            <div className="space-y-0 border-b">
                <h1 className="text-2xl font-semibold text-gray-700">H. DATA ISTRI/SUAMI</h1>
                <p className="text-sm text-gray-500">
                    Formulir ini digunakan untuk mengisi data istri/suami.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field Nama Istri/Suami */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Nama Istri/Suami
                    </label>
                    <input
                        type="text"
                        value={hubungan.nama}
                        onChange={(e) =>
                            setHubungan({
                                ...hubungan,
                                nama: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: John Doe"
                        required
                    />
                </div>

                {/* Field Tempat/Tgl. Lahir */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Tempat/Tgl. Lahir
                    </label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={hubungan.tempat_lahir}
                            onChange={(e) =>
                                setHubungan({
                                    ...hubungan,
                                    tempat_lahir: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            placeholder="Contoh: Jakarta"
                            required
                        />
                        <input
                            type="date"
                            value={hubungan.tanggal_lahir}
                            onChange={(e) =>
                                setHubungan({
                                    ...hubungan,
                                    tanggal_lahir: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                        />
                    </div>
                </div>

                {/* Field Tgl. Kawin */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Tgl. Kawin
                    </label>
                    <input
                        type="date"
                        value={hubungan.tanggal_kawin}
                        onChange={(e) =>
                            setHubungan({
                                ...hubungan,
                                tanggal_kawin: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    />
                </div>

                {/* Field Pendidikan Umum */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Pendidikan Umum
                    </label>
                    <select
                        value={hubungan.pendidikan}
                        onChange={(e) =>
                            setHubungan({
                                ...hubungan,
                                pendidikan: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    >
                        <option value="">Pilih Pendidikan</option>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA">SMA</option>
                        <option value="D1">D1</option>
                        <option value="D2">D2</option>
                        <option value="D3">D3</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                    </select>
                </div>

                {/* Field Pekerjaan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Pekerjaan
                    </label>
                    <input
                        type="text"
                        value={hubungan.pekerjaan}
                        onChange={(e) =>
                            setHubungan({
                                ...hubungan,
                                pekerjaan: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: Pegawai Negeri"
                        required
                    />
                </div>
            </div>
        </motion.div>
    );
}
