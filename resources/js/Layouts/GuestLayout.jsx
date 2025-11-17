import { useState, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { FaQuestionCircle } from "react-icons/fa"; // Import ikon tanda tanya
import ApplicationLogo from "@/Components/ApplicationLogo";
import NavLink from "@/Components/Guest/NavLink";
import LoadingPage from "@/Components/Guest/LoadingPage";
import HeaderSection from "@/Layouts/Partials/Guest/HeaderSection";
import FooterSection from "@/Layouts/Partials/Guest/FooterSection";
import { AnimatePresence, motion } from "framer-motion";


export default function GuestLayout({ children }) {
    const loadingTime = 0;
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
        <div className="min-h-screen bg-green-100 flex flex-col">


            <Head title="Guest" />

            {/* Section Header */}
            <HeaderSection />

            {/* Tambahkan padding-top agar konten tidak tertutup oleh navigasi fixed */}
            <main className="flex-1">{children}</main>

            {/* Tombol Tanda Tanya (Help Button) */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    className="bg-green-700 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-110"
                    onClick={() => {
                        // Tambahkan fungsi untuk menangani klik tombol
                        alert("Butuh bantuan? Hubungi kami di support@palmchain.com");
                    }}
                >
                    <FaQuestionCircle className="w-8 h-8" /> {/* Ikon tanda tanya */}
                </button>
            </div>

            {/* Footer */}
            {/* Section Footer */}
            <FooterSection />

        </div>
    );
}
