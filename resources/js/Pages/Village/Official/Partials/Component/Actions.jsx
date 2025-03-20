import { FiEdit, FiTrash, FiEye, FiPrinter } from "react-icons/fi";
import { Link } from "@inertiajs/react";

export default function Actions({ row, onEdit, onDelete, onView, onPrint }) {
    return (
        <div className="flex space-x-2 mr-2">
            <button onClick={() => onView(row)} className="text-blue-500 hover:text-blue-700">
                <FiEye size={16} />
            </button>
            <button onClick={() => onEdit(row)} className="text-yellow-500 hover:text-yellow-700">
                <FiEdit size={16} />
            </button>

            <button onClick={() => onDelete(row.nik)} className="text-red-500 hover:text-red-700">
                <FiTrash size={16} />
            </button>
            <button onClick={() => onPrint(row)} className="text-green-500 hover:text-green-700">
                <FiPrinter size={16} />
            </button>
        </div>
    );
}
