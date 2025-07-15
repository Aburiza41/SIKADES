import { FiEdit, FiX, FiPrinter } from "react-icons/fi"; // Ikon dari Feather Icons
import { FaCheck } from "react-icons/fa"; // Ikon dari FontAwesome

export default function Procces({ row, onAccept, onReject }) {
    // Cek status row
    const isProses = row.status === "proses";

    return (
        <div className="flex space-x-2 items-center justify-center">
            {/* Tombol Terima (hanya tampil jika status "proses") */}
            {isProses ? (
                <>
                    <button
                        onClick={() => onAccept(row)}
                        className="text-green-500 hover:text-green-700"
                    >
                        <FaCheck size={16} />
                        {/* Terima */}
                    </button>

                    {/* Tombol Tolak (hanya tampil jika status "proses") */}
                    <button
                        onClick={() => onReject(row)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <FiX size={16} />
                        {/* Tolak */}
                    </button>
                </>
            ) : (
                // Tampilkan pesan jika tidak ada proses
                <span className="text-gray-500 text-sm">-</span>
            )}
        </div>
    );
}
