import { Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import { motion, useTransform } from "framer-motion";
import ContentSection from "./Partials/Section/ContentSection";

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

export default function Profil() {
    return (
        <GuestLayout>
            <Head title="Profil" />

            {/* Teruskan regencies sebagai prop ke ContentSection */}
            <ContentSection/>
        </GuestLayout>
    );
}
