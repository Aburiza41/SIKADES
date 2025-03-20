import { motion } from "framer-motion";
import { FiEdit } from "react-icons/fi";

export default function VillageInfo({ village, handleEditVillage }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 bg-white p-6 rounded-lg shadow-md"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    {village.logo_path && (
                        <img
                            src={`/storage/${village.logo_path}`}
                            alt={`Logo ${village.name_bps}`}
                            className="w-24 h-24 object-cover rounded-full border-2 border-gray-200"
                        />
                    )}
                    <div>
                        <h2 className="text-xl font-semibold">
                            {village.name_bps}
                        </h2>
                        <p className="text-gray-700">{village.code_bps}</p>
                        <p className="text-gray-600 mt-2">
                            {village.description}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-gray-700">
                        <span className="font-semibold">Kecamatan:</span>{" "}
                        {village.district?.name_bps || "N/A"}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">Kabupaten:</span>{" "}
                        {village.district?.regency?.name_bps || "N/A"}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">URL:</span>{" "}
                        {village.website ? (
                            <a
                                href={village.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                {village.website}
                            </a>
                        ) : (
                            "N/A"
                        )}
                    </p>
                </div>

                <motion.button
                    onClick={handleEditVillage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-yellow-500 hover:text-yellow-700"
                >
                    <FiEdit size={20} />
                </motion.button>
            </div>
        </motion.div>
    );
}
