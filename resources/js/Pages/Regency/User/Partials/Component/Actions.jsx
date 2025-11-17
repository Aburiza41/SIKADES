import { FiEdit, FiTrash, FiEye, FiPrinter, FiKey } from "react-icons/fi";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

export default function Actions({ row, onEdit, onDelete, onView, onPrint }) {
    // Variabel animasi
    const buttonVariants = {
        hover: { scale: 1.1, transition: { duration: 0.2 } },
        tap: { scale: 0.9 },
    };

    // Handle reset password
    const handleResetPassword = () => {
        Swal.fire({
            title: "Reset Password?",
            text: "This will generate a new random password for this user. The new password will be shown after reset.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, reset it!",
        }).then((result) => {
            if (result.isConfirmed) {
                // Get CSRF token
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                fetch(`/regency/user/${row.id}/reset-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            title: "Password Reset Successful!",
                            html: `New password: <strong>${data.new_password}</strong><br><br>Please save this password and share it with the user.`,
                            icon: "success",
                            confirmButtonText: "OK"
                        });
                    } else {
                        Swal.fire("Error", data.message || "Failed to reset password.", "error");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire("Error", "An error occurred while resetting the password.", "error");
                });
            }
        });
    };

    return (
        <div className="flex space-x-3">
            {/* Tombol View */}
            <motion.button
                onClick={() => onView(row)}
                className="text-blue-500 hover:text-blue-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                title="View"
            >
                <FiEye size={16} />
            </motion.button>

            {/* Tombol Edit */}
            <motion.button
                onClick={() => onEdit(row)}
                className="text-yellow-500 hover:text-yellow-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                title="Edit"
            >
                <FiEdit size={16} />
            </motion.button>

            {/* Tombol Reset Password */}
            <motion.button
                onClick={handleResetPassword}
                className="text-purple-500 hover:text-purple-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                title="Reset Password"
            >
                <FiKey size={16} />
            </motion.button>

            {/* Tombol Print */}
            <motion.button
                onClick={() => onPrint(row)}
                className="text-green-500 hover:text-green-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                title="Print"
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
