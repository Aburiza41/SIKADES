import { FiEdit, FiTrash, FiEye, FiPrinter } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Actions({ row, onEdit, onDelete, onView, onPrint }) {
    // Variabel animasi
    const buttonVariants = {
        hover: { scale: 1.1, transition: { duration: 0.2 } },
        tap: { scale: 0.9 },
    };

    return (
        <div className="flex space-x-3 mr-4">
            {/* Tombol View */}
            <motion.button
                onClick={() => onView(row)}
                className="text-blue-500 hover:text-blue-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
            >
                <FiEye size={16} />
            </motion.button>

            {/* Tombol Edit */}
            {/* <motion.button
                onClick={() => onEdit(row)}
                className="text-yellow-500 hover:text-yellow-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
            >
                <FiEdit size={16} />
            </motion.button> */}

            {/* Tombol Print */}
            <motion.button
                onClick={() => onPrint(row)}
                className="text-green-500 hover:text-green-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
            >
                <FiPrinter size={16} />
            </motion.button>

            {/* Tombol Delete (Opsional) */}
            {/* <motion.button
                onClick={() => onDelete(row.id)}
                className="text-red-500 hover:text-red-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
            >
                <FiTrash size={16} />
            </motion.button> */}
        </div>
    );
}
