import { useState, useEffect } from "react";
import {
    HiHome,
    HiUser,
    HiOutlineLogout,
    HiMenu,
    HiX,
    HiArrowsExpand,
} from "react-icons/hi"; // Tambahkan HiArrowsExpand
import { FaQuestionCircle, FaArrowUp } from "react-icons/fa";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import AdminSidebar from "./Partials/Authenticated/Sidebar/AdminSidebar";
import RegencySidebar from "./Partials/Authenticated/Sidebar/RegencySidebar";
import DistrictSidebar from "./Partials/Authenticated/Sidebar/DistrictSidebar";
import VillageSidebar from "./Partials/Authenticated/Sidebar/VillageSidebar";
import LoadingPage from "@/Components/Guest/LoadingPage";
import { AnimatePresence, motion } from "framer-motion";

// import Logo from "public/assets/images/KalBar.svg";

export default function AuthenticatedLayout({ header, children, breadcrumb }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarLocked, setSidebarLocked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false); // State untuk mode fullscreen
    const loadingTime = 0;
    const [isLoading, setIsLoading] = useState(true);

    // Set loading selama 5 detik saat mount halaman
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, loadingTime);

        return () => clearTimeout(timer);
    }, [loadingTime]);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Fungsi untuk toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // if (isLoading) return <LoadingPage />;
    if (isLoading) {
                return <AnimatePresence>
                {isLoading && <LoadingPage />} {/* Tampilkan loading jika isLoading true */}
            </AnimatePresence>;
        }

    return (
        <div className="min-h-screen bg-gray-100 flex">


            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ${
                    sidebarOpen || sidebarLocked
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                <div className="flex h-16 border-b-2 items-center px-4 bg-green-700">
                    <Link href="/">
                        <div className="flex items-center">
                            <img
                                src="/assets/images/KalBar.svg" // Ganti dengan path logo Anda
                                alt="Logo SIKADES"
                                className="h-10 w-10 mr-2" // Sesuaikan ukuran dan margin sesuai kebutuhan
                            />
                            <h1 className="font-bold text-4xl text-white">
                                SIKADES
                            </h1>
                        </div>
                    </Link>
                </div>
                <div className="space-y-2 mt-4 px-3">
                    {user.role === "admin" && <AdminSidebar />}
                    {user.role === "regency" && <RegencySidebar />}
                    {user.role === "district" && <DistrictSidebar />}
                    {user.role === "village" && <VillageSidebar />}
                </div>
            </div>

            <div
                className={`flex-1 min-h-screen transition-all ${
                    sidebarOpen || sidebarLocked ? "ml-64" : "ml-0"
                }`}
            >
                {/* Navbar */}
                <nav className="bg-white w-full shadow-sm">
                    <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 flex h-16 justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="bg-green-700 p-1 text-white rounded transition-colors duration-300"
                            >
                                {sidebarOpen || sidebarLocked ? (
                                    <HiX className="w-6 h-6" />
                                ) : (
                                    <HiMenu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:items-center gap-4">
                            {/* Tombol Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="text-gray-500 hover:text-green-700 transition-colors duration-300"
                                title={
                                    isFullscreen
                                        ? "Keluar dari Layar Penuh"
                                        : "Masuk ke Layar Penuh"
                                }
                            >
                                <HiArrowsExpand className="w-6 h-6" />
                            </button>

                            {/* Dropdown Profil */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md shadow border">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-green-700 focus:outline-none"
                                            >
                                                {/* Avatar Pengguna */}
                                                <div className="flex items-center space-x-2">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded bg-green-700 flex items-center justify-center">
                                                            <HiUser className="w-5 h-5 text-white" />
                                                        </div>
                                                    )}
                                                    <span>{user.name}</span>
                                                </div>
                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                            className="flex items-center space-x-2"
                                        >
                                            <HiUser className="w-4 h-4" />
                                            <span>Profile</span>
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="flex items-center space-x-2"
                                        >
                                            <HiOutlineLogout className="w-4 h-4" />
                                            <span>Log Out</span>
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Header */}
                <div className="pt-8 mx-8">
                    {header && (
                        <header className="bg-green-700 rounded shadow flex justify-between items-center">
                            <div className="max-w-full py-4 px-4 sm:px-4 lg:px-4 text-white">
                                {header}
                            </div>

                            <div className="py-4 px-4 sm:px-6 lg:px-8">
                                <nav className="text-sm">
                                    <ol className="list-reset flex">
                                        {breadcrumb && breadcrumb.map((item, index) => (
                                            <li key={index}>
                                                <Link href={item.path} className="text-white hover:text-white">
                                                    {item.name}
                                                </Link>
                                                {index < breadcrumb.length - 1 && (
                                                    <span className="mx-2">/</span>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </nav>
                            </div>
                        </header>
                    )}


                </div>

                {/* Main Content */}
                <main className="transition-all p-4">{children}</main>
            </div>

            {/* Floating Buttons */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2">
                {isVisible && (
                    <button
                        className="bg-green-700 text-white p-1 rounded shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110"
                        onClick={scrollToTop}
                    >
                        <FaArrowUp className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
}
