import { FiEdit, FiX, FiPrinter } from "react-icons/fi"; // Ikon dari Feather Icons
import { FaCheck } from "react-icons/fa"; // Ikon dari FontAwesome

export default function Actions({ row, onEdit, onPrint }) {
    // Cek status row

    return (
        <div className="flex space-x-2">
            {/* Tombol Ubah */}
            <button onClick={() => onEdit(row)} className="text-yellow-500 hover:text-yellow-700">
                <FiEdit size={16} />
                {/* Ubah */}
            </button>


            {/* Tombol Cetak */}
            <button onClick={() => onPrint(row)} className="text-blue-500 hover:text-blue-700">
                <FiPrinter size={16} />
                {/* Cetak */}
            </button>
        </div>
    );
}
