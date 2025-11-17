import React from "react";
import { motion } from "framer-motion";
import {
    FaDatabase,
    FaChartBar,
    FaUsers,
    FaFileAlt,
    FaCogs,
    FaShieldAlt
} from "react-icons/fa";

// Variants untuk container agar anak-anaknya (card) tampil dengan efek stagger
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
        },
    },
};

// Variants untuk masing-masing card fitur
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
    hover: {
        scale: 1.05,
        backgroundColor: "#065f46", // Warna hijau gelap saat hover
        color: "#ffffff", // Warna teks putih saat hover
        transition: { duration: 0.5 },
    },
};

export default function FeaturesSection() {
    return (
        <section className="min-h-screen flex items-center relative overflow-hidden bg-white">
            {/* Konten Fitur */}
            <div className="mx-auto max-w-7xl relative z-10">
                {/* Grid Container dengan Staggered Animation */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {/* Fitur */}
                    {[
                        {
                            icon: <FaDatabase className="w-16 h-16" />,
                            title: "Manajemen Data",
                            description:
                                "Kelola data aparatur desa secara terpusat dan terstruktur untuk memudahkan akses dan pembaruan.",
                        },
                        {
                            icon: <FaChartBar className="w-16 h-16" />,
                            title: "Analisis Data",
                            description:
                                "Sajikan data dalam bentuk grafik dan statistik untuk mendukung pengambilan keputusan yang tepat.",
                        },
                        {
                            icon: <FaUsers className="w-16 h-16" />,
                            title: "Kolaborasi Aparatur",
                            description:
                                "Fasilitasi komunikasi dan koordinasi antar aparatur desa untuk meningkatkan efisiensi kerja.",
                        },
                        {
                            icon: <FaFileAlt className="w-16 h-16" />,
                            title: "Pelaporan Otomatis",
                            description:
                                "Buat laporan kegiatan dan perkembangan desa secara otomatis dengan format yang terstandarisasi.",
                        },
                        {
                            icon: <FaCogs className="w-16 h-16" />,
                            title: "Pengaturan Fleksibel",
                            description:
                                "Kustomisasi sistem sesuai kebutuhan desa dengan pengaturan yang mudah dan intuitif.",
                        },
                        {
                            icon: <FaShieldAlt className="w-16 h-16" />,
                            title: "Keamanan Data",
                            description:
                                "Lindungi data aparatur desa dengan enkripsi dan sistem keamanan canggih untuk mencegah akses tidak sah.",
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            whileHover="hover"
                            className="px-8 py-24 transition-all duration-300 cursor-pointer"
                        >
                            <div className="text-green-900 mb-8 flex justify-center transition-colors duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-semibold mb-2 text-center">
                                {feature.title}
                            </h3>
                            <p className="text-center font-light text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
