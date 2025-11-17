import { FiEdit, FiTrash, FiEye, FiPrinter, FiArchive } from "react-icons/fi";

export default function Actions({
    row,
    onEdit,
    onDelete,
    onView,
    onPrint,
    role,
}) {
    // Menentukan apakah tombol Edit dan Delete harus disabled
    const isEditDeleteDisabled = !(
        row?.status === "daftar" || row?.status === "tolak"
    );

    return (
        <div className="flex space-x-2">
            <button
                onClick={() => onView(row)}
                className="text-blue-500 hover:text-blue-700"
            >
                <FiEye size={16} />
            </button>

            {/* Edit Button */}
            <button
                onClick={() => !isEditDeleteDisabled && onEdit(row, role)}
                disabled={isEditDeleteDisabled}
                className={`${
                    isEditDeleteDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-yellow-500 hover:text-yellow-700"
                }`}
            >
                <FiEdit size={16} />
            </button>

            {/* Delete Button */}
            <button
                onClick={() => !isEditDeleteDisabled && onDelete(row, role)}
                disabled={isEditDeleteDisabled}
                className={`${
                    isEditDeleteDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-500 hover:text-red-700"
                }`}
            >
                <FiTrash size={16} />
            </button>

            {/* Print Button */}
            <button
                onClick={() => onPrint(row)}
                className="text-green-500 hover:text-green-700"
            >
                <FiPrinter size={16} />
            </button>

            {/* Log */}
            {/* <button
                onClick={() => onView(row)}
                className="text-blue-500 hover:text-blue-700"
            >
                <FiArchive size={16} />
            </button> */}
        </div>
    );
}
