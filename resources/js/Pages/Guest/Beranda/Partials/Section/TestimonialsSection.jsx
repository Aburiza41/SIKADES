import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function TestimonialsSection() {
    // Data testimoni
    const testimonials = [
        {
            id: 1,
            name: 'Budi, Pengepul Sawit',
            comment: '"Raaf Palmchain membantu saya mengelola pengumpulan buah sawit dengan lebih efisien. Sangat membantu!"',
            photo: 'https://randomuser.me/api/portraits/men/1.jpg', // Foto John Doe 1
        },
        {
            id: 2,
            name: 'Siti, Admin Perusahaan',
            comment: '"Sistem yang mudah digunakan dan sangat terintegrasi, saya sangat merekomendasikannya."',
            photo: 'https://randomuser.me/api/portraits/women/2.jpg', // Foto Jane Doe 1
        },
        {
            id: 3,
            name: 'Ahmad, Petani Sawit',
            comment: '"Dengan PalmChain, saya bisa memantau harga pasar secara real-time. Sangat bermanfaat!"',
            photo: 'https://randomuser.me/api/portraits/men/3.jpg', // Foto John Doe 2
        },
        {
            id: 4,
            name: 'Rina, Manajer Logistik',
            comment: '"Manajemen logistik menjadi lebih mudah dan terorganisir berkat PalmChain."',
            photo: 'https://randomuser.me/api/portraits/women/4.jpg', // Foto Jane Doe 2
        },
        {
            id: 5,
            name: 'Dewi, Analis Bisnis',
            comment: '"Laporan dan analitik yang disediakan sangat membantu dalam pengambilan keputusan."',
            photo: 'https://randomuser.me/api/portraits/women/5.jpg', // Foto Jane Doe 3
        },
        {
            id: 6,
            name: 'Eko, Pengepul Sawit',
            comment: '"Transaksi menjadi lebih cepat dan aman dengan sistem terintegrasi PalmChain."',
            photo: 'https://randomuser.me/api/portraits/men/6.jpg', // Foto John Doe 3
        },
        {
            id: 7,
            name: 'Fani, Petani Sawit',
            comment: '"Kolaborasi dengan pengepul dan perusahaan menjadi lebih lancar berkat PalmChain."',
            photo: 'https://randomuser.me/api/portraits/women/7.jpg', // Foto Jane Doe 4
        },
        {
            id: 8,
            name: 'Gita, Admin Perusahaan',
            comment: '"Sangat puas dengan layanan dan fitur yang disediakan oleh PalmChain."',
            photo: 'https://randomuser.me/api/portraits/women/8.jpg', // Foto Jane Doe 5
        },
        {
            id: 9,
            name: 'Hadi, Pengepul Sawit',
            comment: '"PalmChain membantu meningkatkan efisiensi bisnis saya secara signifikan."',
            photo: 'https://randomuser.me/api/portraits/men/9.jpg', // Foto John Doe 4
        },
        {
            id: 10,
            name: 'Indra, Petani Sawit',
            comment: '"Sistem yang sangat user-friendly dan mendukung perkembangan bisnis saya."',
            photo: 'https://randomuser.me/api/portraits/men/10.jpg', // Foto John Doe 5
        },
    ];

    return (
        <section className="py-16 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-6xl font-bold mb-12">Testimoni Pengguna</h2>
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={30}
                    slidesPerView={1}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    // pagination={{ clickable: true }}
                    // navigation
                    loop
                    breakpoints={{
                        640: {
                            slidesPerView: 1,
                        },
                        768: {
                            slidesPerView: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                        },
                    }}
                    className="w-full h-full"
                >
                    {testimonials.map((testimonial) => (
                        <SwiperSlide key={testimonial.id}>
                            <div className="bg-white p-8  my-8 rounded-lg shadow-lg text-center h-[400px] flex flex-col items-center transition-all duration-300 hover:shadow-xl">
                                <img
                                    src={testimonial.photo}
                                    alt={testimonial.name}
                                    className="w-24 h-24 rounded-full object-cover mb-6"
                                />
                                <blockquote className="italic text-lg text-gray-600 mb-6">
                                    {testimonial.comment}
                                </blockquote>
                                <p className="font-semibold text-gray-800">{testimonial.name}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
