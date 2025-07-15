import { motion, AnimatePresence } from "framer-motion";

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
                        className="w-1/2 bg-white h-full p-6 shadow-lg"
                    >
                        {children}
                        {/* <button onClick={onClose} className="mt-4 px-4 py-2 text-gray-700 border rounded-lg">
                            Tutup
                        </button> */}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
