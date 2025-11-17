import { motion, AnimatePresence } from "framer-motion";
import { HiX } from "react-icons/hi";

export default function Modal({ isOpen, onClose, children, title }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-end z-50">
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 50 }}
                        className="w-1/2 bg-white h-full shadow-lg flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
