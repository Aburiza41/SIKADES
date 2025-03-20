import { useState, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { FaQuestionCircle } from "react-icons/fa"; // Import ikon tanda tanya
import ApplicationLogo from "@/Components/ApplicationLogo";
import NavLink from "@/Components/Guest/NavLink";
import LoadingPage from "@/Components/Guest/LoadingPage";
import { AnimatePresence, motion } from "framer-motion";

// import HeaderSection from "@/Layouts/Partials/Guest/HeaderSection";
// import FooterSection from "@/Layouts/Partials/Guest/FooterSection";

export default function AuthLayout({ children }) {
    const loadingTime = 2500;
    const [isLoading, setIsLoading] = useState(true);

    // Set loading selama 5 detik saat mount halaman
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, loadingTime);

        return () => clearTimeout(timer);
    }, [loadingTime]);

    const auth = usePage().props.auth;

    // Tampilan Loading Screen
    if (isLoading) {
            return <AnimatePresence>
            {isLoading && <LoadingPage />} {/* Tampilkan loading jika isLoading true */}
        </AnimatePresence>;
    }
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">


            <Head title="Auth" />

            {/* Tambahkan padding-top agar konten tidak tertutup oleh navigasi fixed */}
            <main className="flex-1">{children}</main>


        </div>
    );
}
