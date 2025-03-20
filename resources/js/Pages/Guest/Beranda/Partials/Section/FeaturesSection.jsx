import React from "react";
import { motion } from "framer-motion";
import {
    FaDatabase,
    FaChartBar,
    FaUsers,
    FaFileAlt,
    FaCogs,
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
        <section className="py-16 min-h-screen flex items-center relative overflow-hidden bg-gray-50">
            {/* Konten Fitur */}
            <div className="mx-auto max-w-7xl relative z-10 px-4">
                {/* Animasi Judul */}
                <motion.h2
                    className="text-5xl font-bold mb-12 text-green-700 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    Fitur SIKADES
                </motion.h2>

                {/* Grid Container dengan Staggered Animation */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {/* Fitur */}
                    {[
                        {
                            icon: <FaDatabase className="w-12 h-12" />,
                            title: "Manajemen Data",
                            description:
                                "Kelola data aparatur desa secara terpusat dan terstruktur untuk memudahkan akses dan pembaruan.",
                        },
                        {
                            icon: <FaChartBar className="w-12 h-12" />,
                            title: "Analisis Data",
                            description:
                                "Sajikan data dalam bentuk grafik dan statistik untuk mendukung pengambilan keputusan yang tepat.",
                        },
                        {
                            icon: <FaUsers className="w-12 h-12" />,
                            title: "Kolaborasi Aparatur",
                            description:
                                "Fasilitasi komunikasi dan koordinasi antar aparatur desa untuk meningkatkan efisiensi kerja.",
                        },
                        {
                            icon: <FaFileAlt className="w-12 h-12" />,
                            title: "Pelaporan Otomatis",
                            description:
                                "Buat laporan kegiatan dan perkembangan desa secara otomatis dengan format yang terstandarisasi.",
                        },
                        {
                            icon: <FaCogs className="w-12 h-12" />,
                            title: "Pengaturan Fleksibel",
                            description:
                                "Kustomisasi sistem sesuai kebutuhan desa dengan pengaturan yang mudah dan intuitif.",
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            whileHover="hover"
                            className="p-8 border rounded-lg shadow-lg bg-white transition-all duration-300 cursor-pointer"
                        >
                            <div className="text-green-700 mb-4 flex justify-center transition-colors duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-center">
                                {feature.title}
                            </h3>
                            <p className="text-center">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
