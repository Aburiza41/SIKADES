import { Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import JumbotronSection from "@/Pages/Guest/Beranda/Partials/Section/JumbotronSection";
import FeaturesSection from "@/Pages/Guest/Beranda/Partials/Section/FeaturesSection";
import TestimonialsSection from "@/Pages/Guest/Beranda/Partials/Section/TestimonialsSection";
import { motion, useViewportScroll, useTransform } from "framer-motion";

// Import Image Assets
// import bgMain from "public/assets/images/bg-main.jpg";

const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 2.5, delay: i * 1.0, ease: "easeOut" },
    }),
};

const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 2.5, delay: i * 1.0, ease: "easeOut" },
    }),
};

const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 1.5, delay: i * 0.5, ease: "easeOut" },
    }),
};

export default function Beranda() {
    // Deteksi posisi scroll menggunakan useViewportScroll
    const { scrollY } = useViewportScroll();
    // Contoh: Ubah skala JumbotronSection seiring dengan scroll (dari 1 sampai 1.05 ketika scroll mencapai 500px)

    return (
        <GuestLayout>
            <Head title="Beranda" />

            {/* JumbotronSection dengan efek fadeInUp dan perubahan skala berdasarkan scroll */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0}
                variants={fadeInUp}
            >
                <JumbotronSection />
            </motion.div>

            {/* FeaturesSection dengan animasi fadeInLeft */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={1}
                variants={fadeInLeft}
            >
                <FeaturesSection />
            </motion.div>
        </GuestLayout>
    );
}
