import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

export default function Modal({ isOpen, onClose, children }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-end">
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 50 }}
                        className="w-1/2 bg-gray-100 h-full p-8 shadow-lg relative"
                    >
                        <motion.button
                            onClick={onClose}
                            className="mb-8 mx-4 flex items-center p-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaTimes className="text-lg" />
                        </motion.button>
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
