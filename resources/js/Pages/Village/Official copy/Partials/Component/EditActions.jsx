import { FiUserCheck, FiBriefcase, FiBookOpen, FiUsers } from "react-icons/fi";

import { Link } from "@inertiajs/react";

export default function EditActions({ row, onEdit, onDelete, onView, onPrint }) {
    return (
        <div className="flex space-x-2">
                <button
                    onClick={() => onView(row)}
                    className="flex items-center gap-2 p-2 text-blue-600 hover:text-blue-800 transition-all rounded-lg hover:bg-blue-50"
                >
                    <FiBookOpen size={18} />
                    <span>Pendidikan</span>
                </button>

                <button
                    onClick={() => onEdit(row)}
                    className="flex items-center gap-2 p-2 text-yellow-600 hover:text-yellow-800 transition-all rounded-lg hover:bg-yellow-50"
                >
                    <FiBriefcase size={18} />
                    <span>Jabatan</span>
                </button>

                <button
                    onClick={() => onDelete(row.id)}
                    className="flex items-center gap-2 p-2 text-red-600 hover:text-red-800 transition-all rounded-lg hover:bg-red-50"
                >
                    <FiUserCheck size={18} />
                    <span>Pelatihan</span>
                </button>

                <button
                    onClick={() => onPrint(row)}
                    className="flex items-center gap-2 p-2 text-green-600 hover:text-green-800 transition-all rounded-lg hover:bg-green-50"
                >
                    <FiUsers size={18} />
                    <span>Organisasi</span>
                </button>
        </div>
    );
}
