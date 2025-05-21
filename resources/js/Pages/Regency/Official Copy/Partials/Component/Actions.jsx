import { FiEdit, FiX, FiPrinter, FiEye } from "react-icons/fi"; // Ikon dari Feather Icons
import { FaCheck } from "react-icons/fa"; // Ikon dari FontAwesome

export default function Actions({ row, onEdit, onPrint, onView }) {
    // Cek status row

    return (
        <div className="flex space-x-2">
            {/* Tombol Ubah */}
            {/* <button onClick={() => onEdit(row)} className="text-yellow-500 hover:text-yellow-700">
                <FiEdit size={16} />
            </button> */}

            <button onClick={() => onView(row)} className="text-yellow-500 hover:text-yellow-700">
                <FiEye size={16} />
            </button>


            {/* Tombol Cetak */}
            <button onClick={() => onPrint(row)} className="text-blue-500 hover:text-blue-700">
                <FiPrinter size={16} />
                {/* Cetak */}
            </button>
        </div>
    );
}
