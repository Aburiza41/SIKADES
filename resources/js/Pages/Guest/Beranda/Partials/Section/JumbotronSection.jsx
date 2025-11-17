import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import TypingAnimation from "@/Components/Guest/TypingAnimation";
import "swiper/css";
import "swiper/css/effect-fade";

export default function Jumbotron() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isBeginning, setIsBeginning] = useState(true);
    const [resetKey, setResetKey] = useState(0); // Key untuk mereset animasi

    const slides = [
        {
            title: "Selamat Datang di SIKADES",
            description: "SIKADES adalah sistem inovatif yang membantu pemerintah desa dalam mendata, mengelola, dan memantau aparatur desa secara digital. Dengan sistem ini, informasi menjadi lebih transparan dan mudah diakses.",
        },
        {
            title: "Efisiensi Administrasi Desa",
            description: "SIKADES menyediakan solusi digital untuk mempercepat proses administrasi desa, mulai dari pencatatan aparatur hingga penyimpanan dokumen penting, sehingga lebih efisien dan akurat.",
        },
        {
            title: "Transparansi & Akuntabilitas",
            description: "Dengan SIKADES, data aparatur desa tersimpan dengan aman dan dapat diakses dengan mudah oleh pemangku kepentingan, meningkatkan transparansi serta akuntabilitas dalam tata kelola pemerintahan desa.",
        },
    ];

    // Variasi animasi untuk setiap slide
    const slideVariants = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50 },
    };

    // Handler untuk perubahan slide
    const handleSlideChange = (swiper) => {
        setActiveIndex(swiper.activeIndex);
        setIsBeginning(swiper.isBeginning);
        // Reset key untuk memastikan animasi diulang
        setResetKey(prev => prev + 1);
    };

    return (
        <section className="relative bg-gray-900 text-white min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image Statis dengan efek paralaks ringan */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat min-h-screen"
                style={{
                    backgroundImage: `url('/assets/images/bg-main.jpg')`,
                    backgroundAttachment: "fixed",
                }}
            />

            {/* Swiper untuk Teks */}
            <Swiper
                modules={[Autoplay, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{ delay: 10000, disableOnInteraction: false }}
                loop
                effect="fade"
                fadeEffect={{ crossFade: true }}
                className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
                onSlideChange={handleSlideChange}
                onSwiper={(swiper) => {
                    setIsBeginning(swiper.isBeginning);
                }}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <motion.div
                            className="container mx-auto text-left flex flex-col items-start justify-center min-h-screen py-12"
                            variants={slideVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        >
                            <motion.h1
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-green-900 leading-tight"
                                variants={slideVariants}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <TypingAnimation
                                    text={slide.title}
                                    speed={80}
                                    delay={0}
                                    shouldStart={activeIndex === index}
                                    key={`title-${index}-${resetKey}`} // Gunakan resetKey untuk memaksa ulang animasi
                                />
                            </motion.h1>

                            <motion.p
                                className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl lg:max-w-3xl leading-relaxed font-light text-gray-600"
                                variants={slideVariants}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                <TypingAnimation
                                    text={slide.description}
                                    speed={40}
                                    delay={800}
                                    shouldStart={activeIndex === index}
                                    key={`desc-${index}-${resetKey}`} // Gunakan resetKey untuk memaksa ulang animasi
                                />
                            </motion.p>
                        </motion.div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
