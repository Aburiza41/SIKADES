import { Link, usePage, useForm } from "@inertiajs/react";
import { motion, AnimatePresence, color } from "framer-motion";
import NavLink from "@/Components/Guest/NavLink";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { FaHome, FaSignInAlt, FaTimes, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useState, useEffect } from "react"; // Added useEffect
import Swal from "sweetalert2";

export default function HeaderSection() {
    const auth = usePage().props.auth;
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
        password: "",
        remember: false,
    });

    // Disable scroll when login form is open
    useEffect(() => {
        if (isLoginOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        // Cleanup to restore default scroll behavior
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isLoginOpen]);

    // Variants untuk animasi header
    const navVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
        blurred: {
            opacity: 0.5,
            filter: "blur(4px)",
            transition: { duration: 0.3, ease: "easeOut" },
        },
    };

    // Variants untuk animasi form login
    const formVariants = {
        hidden: { x: "100%", opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut" },
        },
        exit: {
            x: "100%",
            opacity: 0,
            transition: { duration: 0.3, ease: "easeIn" },
        },
    };

    // Variants untuk backdrop
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 0.6, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    // Variants untuk tombol
    const buttonVariants = {
        hover: { scale: 1.05, backgroundColor: "#065f46", color: "#ffffff", transition: { duration: 0.3 } },
        tap: { scale: 0.95 },
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onError: (errors) => {
                Swal.fire(
                    "Error",
                    "Login failed! Please check your credentials.",
                    "error"
                );
            },
            onFinish: () => reset("password"),
        });
        setIsLoginOpen(false);
    };

    return (
        <header className="relative">
            <motion.nav
                className="shadow-md w-full fixed top-0 z-50 border-b border-green-100 bg-white"
                variants={navVariants}
                initial="hidden"
                animate={isLoginOpen ? "blurred" : "visible"}
            >
                <div className="mx-auto max-w-7xl">
                    <div className="flex h-20 justify-between items-center">
                        {/* Logo dan Navigasi */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center gap-2">
                                <img
                                    src="/assets/images/KalBar.svg"
                                    alt="Logo SIKADES"
                                    className="h-12 w-12"
                                />
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>

                        </div>

                        {/* Tombol Aksi */}
                        <div className="hidden space-x-2 sm:-my-px sm:ms-16 sm:flex items-center">
                            <NavLink
                                href={route("guest.beranda.index")}
                                active={route().current("guest.beranda.index")}
                            >
                                Beranda
                            </NavLink>
                            <NavLink
                                href={route("guest.profile.index")}
                                active={route().current("guest.profile.index")}
                            >
                                Profil
                            </NavLink>
                            <NavLink
                                href={route("guest.member.index")}
                                active={route().current("guest.member.index")}
                            >
                                Anggota
                            </NavLink>

                            {auth.user ? (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link
                                        href={route(auth.user.role + ".dashboard.index")}
                                        className="flex items-center rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        <FaHome className="mr-2" />
                                        Dashboard
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="flex items-center px-4 py-2 rounded text-green-900 bg-white font-bold text-lg transition-colors duration-300 cursor-pointer"
                                    onClick={() => setIsLoginOpen(true)}
                                >
                                    <FaSignInAlt className="mr-2" />
                                    Masuk
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Backdrop dan Form Login */}
            <AnimatePresence>
                {isLoginOpen && (
                    <>
                        {/* Backdrop dengan efek blur */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"
                            variants={backdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={() => setIsLoginOpen(false)}
                        />

                        {/* Form Login */}
                        <motion.div
                            className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 flex flex-col justify-center px-8"
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <button
                                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                                onClick={() => setIsLoginOpen(false)}
                            >
                                <FaTimes size={24} />
                            </button>
                            <div className="max-w-md mx-auto w-full">
                                <motion.div
                                    className="mb-2"
                                    initial={{ opacity: 0, y: -50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h2 className="text-3xl font-bold text-gray-800">Masuk</h2>
                                </motion.div>

                                <motion.form
                                    onSubmit={submit}
                                    className="w-full border-t pt-6"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    {/* Username Input */}
                                    <div>
                                        <InputLabel htmlFor="username" value="Username" />
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <TextInput
                                                id="username"
                                                type="text"
                                                name="username"
                                                value={data.username}
                                                className="mt-1 block w-full pl-10"
                                                placeholder="Ex: johndoe"
                                                autoComplete="username"
                                                isFocused={true}
                                                onChange={(e) => setData("username", e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.username} className="mt-2" />
                                    </div>

                                    {/* Password Input */}
                                    <div className="mt-4">
                                        <InputLabel htmlFor="password" value="Password" />
                                        <div className="relative">
                                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <TextInput
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={data.password}
                                                className="mt-1 block w-full pl-10 pr-10"
                                                placeholder="Ex: ********"
                                                autoComplete="current-password"
                                                onChange={(e) => setData("password", e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    {/* Remember Me Checkbox */}
                                    <div className="mt-4 block">
                                        <label className="flex items-center">
                                            <Checkbox
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) => setData("remember", e.target.checked)}
                                            />
                                            <span className="ms-2 text-sm text-gray-600">Remember me</span>
                                        </label>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <motion.button
                                            type="button"
                                            onClick={() => setIsLoginOpen(false)}
                                            className="text-sm text-gray-600 underline hover:text-gray-900 flex items-center"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FaArrowLeft className="mr-2" />
                                            Kembali
                                        </motion.button>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <PrimaryButton
                                                className="w-full md:w-auto"
                                                disabled={processing}
                                            >
                                                Masuk
                                            </PrimaryButton>
                                        </motion.div>
                                    </div>
                                </motion.form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
