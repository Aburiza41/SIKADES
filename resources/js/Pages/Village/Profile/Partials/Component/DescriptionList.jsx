import { motion } from "framer-motion";
import { FiEye, FiEdit, FiTrash, FiPrinter } from "react-icons/fi";

export default function DescriptionList({
    description,
    onEdit,
    onDelete,
    onView,
    onPrint,
}) {
    // Cek apakah data description ada
    if (!description) {
        return '';
    }

    return (
        <div className="space-y-4">
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                className="bg-white mb-8 p-6 rounded-lg shadow-md"
            >
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">
                        Year: {description.year}
                    </h4>
                    <div className="flex space-x-3">
                        <motion.button
                            onClick={() => onView(description)}
                            className="text-blue-500 hover:text-blue-700"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FiEye size={20} />
                        </motion.button>
                        <motion.button
                            onClick={() => onEdit(description)}
                            className="text-yellow-500 hover:text-yellow-700"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FiEdit size={20} />
                        </motion.button>
                        <motion.button
                            onClick={() => onPrint(description)}
                            className="text-green-500 hover:text-green-700"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FiPrinter size={20} />
                        </motion.button>
                        <motion.button
                            onClick={() => onDelete(description.id)}
                            className="text-red-500 hover:text-red-700"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FiTrash size={20} />
                        </motion.button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <p className="text-gray-700">
                        <span className="font-semibold">Score IDM:</span>{" "}
                        {description.score_idm}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">Status IDM:</span>{" "}
                        {description.status_idm}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">
                            Score Prodeskel:
                        </span>{" "}
                        {description.score_prodeskel}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">
                            Score Epdeskel:
                        </span>{" "}
                        {description.score_epdeskel}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">Status:</span>{" "}
                        {description.status}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">
                            Classification:
                        </span>{" "}
                        {description.classification}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
