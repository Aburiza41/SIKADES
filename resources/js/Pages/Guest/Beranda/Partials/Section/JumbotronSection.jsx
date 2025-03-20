import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { motion } from "framer-motion";
import TypingAnimation from "@/Components/Guest/TypingAnimation";

export default function Jumbotron() {
    const slides = [
        {
            title: "Selamat Datang di SIKADES",
            description:
                "SIKADES adalah sistem inovatif yang membantu pemerintah desa dalam mendata, mengelola, dan memantau aparatur desa secara digital. Dengan sistem ini, informasi menjadi lebih transparan dan mudah diakses.",
        },
        {
            title: "Efisiensi Administrasi Desa",
            description:
                "SIKADES menyediakan solusi digital untuk mempercepat proses administrasi desa, mulai dari pencatatan aparatur hingga penyimpanan dokumen penting, sehingga lebih efisien dan akurat.",
        },
        {
            title: "Transparansi & Akuntabilitas",
            description:
                "Dengan SIKADES, data aparatur desa tersimpan dengan aman dan dapat diakses dengan mudah oleh pemangku kepentingan, meningkatkan transparansi serta akuntabilitas dalam tata kelola pemerintahan desa.",
        },
    ];

    return (
        <section className="relative bg-gray-900 text-white min-h-screen flex items-center overflow-hidden">
            {/* Background Image Statis */}
            <div
                className="absolute inset-0 bg-cover bg-center min-h-screen"
                style={{ backgroundImage: `url('/assets/images/bg-main.jpg')` }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 gradient-overlay"></div>

            {/* Swiper untuk Teks */}
            <Swiper
                modules={[Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{ delay: 15000, disableOnInteraction: false }}
                loop
                className="relative z-10 w-full"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className="container mx-auto text-left flex flex-col items-start justify-center h-full px-4 sm:px-6 lg:px-8">
                            <motion.h1
                                className="text-4xl sm:text-6xl font-extrabold mb-4 text-green-600"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.5 }}
                            >
                                <TypingAnimation
                                    text={slide.title}
                                    speed={100}
                                />
                            </motion.h1>

                            <motion.p
                                className="text-lg sm:text-2xl max-w-3xl leading-relaxed mb-8 text-chocolate"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1 }}
                            >
                                <TypingAnimation
                                    text={slide.description}
                                    speed={50}
                                    delay={1000}
                                />
                            </motion.p>

                            <motion.button
                                className="px-8 py-3 bg-green-800 rounded text-white font-bold shadow-lg hover:bg-green-600 transition-colors duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1.5 }}
                            >
                                Mulai Sekarang
                            </motion.button>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
