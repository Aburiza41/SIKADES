import { motion } from "framer-motion";

export default function OfficialContactForm({
    contact,
    setContact,
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
                <h1 className="text-2xl font-semibold text-gray-700">C. Formulir Kontak Pejabat</h1>
                {/* Keterangan Formulir */}
                <p className="text-sm text-gray-500">
                    Formulir ini digunakan untuk mengisi kontak pejabat desa.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field Nomor Handphone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Nomor Handphone
                    </label>
                    <input
                        type="text"
                        value={contact.handphone}
                        onChange={(e) => {
                            const inputValue = e.target.value;
                            // Validasi: hanya angka yang diizinkan dan panjang maksimal 15 digit
                            if (/^\d*$/.test(inputValue) && inputValue.length <= 15) {
                                setContact({
                                    ...contact,
                                    handphone: inputValue,
                                });
                            }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: 081234567890"
                        maxLength={15}
                        required
                    />
                    {contact?.handphone?.length < 11 && (
                        <p className="text-sm text-red-500">
                            Nomor handphone harus terdiri dari minimal 11 digit.
                        </p>
                    )}
                    {contact?.handphone?.length > 15 && (
                        <p className="text-sm text-red-500">
                            Nomor handphone tidak boleh lebih dari 15 digit.
                        </p>
                    )}
                </div>

                {/* Field Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        value={contact.email}
                        onChange={(e) =>
                            setContact({
                                ...contact,
                                email: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="Contoh: john.doe@example.com"
                    />
                </div>
            </div>
        </motion.div>
    );
}