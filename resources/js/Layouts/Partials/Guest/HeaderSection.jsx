import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import NavLink from "@/Components/Guest/NavLink";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { FaHome, FaSignInAlt, FaUserPlus } from "react-icons/fa"; // Import ikon yang dibutuhkan

export default function HeaderSection() {
    const auth = usePage().props.auth;

    // Variants untuk animasi
    const navVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    const buttonVariants = {
        hover: { scale: 1.05, backgroundColor: "#065f46" }, // Warna hijau gelap saat hover
        tap: { scale: 0.95 },
    };

    return (
        <header>
            <motion.nav
                className="shadow-md w-full fixed top-0 z-50 border-b border-gray-100 bg-white"
                variants={navVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo dan Navigasi */}
                        <div className="flex items-center">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <img
                                        src="/assets/images/KalBar.svg" // Ganti dengan path logo Anda
                                        alt="Logo SIKADES"
                                        className="h-10 w-10 mr-1" // Sesuaikan ukuran dan margin sesuai kebutuhan
                                    />
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>
                            <div className="hidden space-x-2 sm:-my-px sm:ms-16 sm:flex">
                                <NavLink
                                    href={route("guest.beranda.index")}
                                    active={route().current(
                                        "guest.beranda.index"
                                    )}
                                >
                                    Beranda
                                </NavLink>
                                <NavLink
                                    href={route("guest.profile.index")}
                                    active={route().current(
                                        "guest.profile.index"
                                    )}
                                >
                                    Profil
                                </NavLink>
                                <NavLink
                                    href={route("guest.member.index")}
                                    active={route().current(
                                        "guest.member.index"
                                    )}
                                >
                                    Anggota
                                </NavLink>
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex items-center">
                            {auth.user ? (
                                // Tampilkan link Dashboard dengan ikon rumah
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link
                                        href={route(
                                            auth.user.role + ".dashboard.index"
                                        )}
                                        className="flex items-center rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        <FaHome className="mr-2" />{" "}
                                        {/* Ikon rumah */}
                                        Dashboard
                                    </Link>
                                </motion.div>
                            ) : (
                                // Tampilkan link Masuk dengan animasi
                                <motion.div
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="flex items-center px-4 py-2 rounded text-white bg-green-900 transition-colors duration-300"
                                >
                                    <Link
                                        href={route("login")}
                                        className="flex items-center"
                                    >
                                        <FaSignInAlt className="mr-2" />{" "}
                                        {/* Ikon masuk */}
                                        Masuk
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>
        </header>
    );
}
