import { motion } from "framer-motion";
import { useState } from "react";
import { FaImage, FaMapMarkerAlt, FaHome, FaUserTie, FaChartBar, FaArrowRight } from "react-icons/fa";
import Modal from "../Section/Modal"; // Import komponen Modal
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DataTable from "react-data-table-component";
import { Link, usePage } from '@inertiajs/react';

// Registrasi komponen Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function AparatusList({ aparatus }) {
    const user = usePage().props.auth.user;
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Fungsi untuk membuka modal
    const openModal = (item) => {
        setSelectedItem(item);
        setModalIsOpen(true);
    };

    // Fungsi untuk menutup modal
    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedItem(null);
    };

    // Fungsi untuk pindah halaman
    const navigateToDetail = (id) => {
        window.location.href = `/admin/aparatus/regency/${id}`;
    };

    // Data untuk chart pie
    const data = selectedItem ? {
        labels: ['Daftar', 'Proses', 'Validasi', 'Tolak'],
        datasets: [
            {
                label: 'Jumlah',
                data: [selectedItem.officials_statuses[0], selectedItem.officials_statuses[1], selectedItem.officials_statuses[2], selectedItem.officials_statuses[3]],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(100, 192, 192, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(100, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    } : null;

    // Konfigurasi kolom untuk tabel
    const columns = [
        {
            name: 'Proses',
            selector: row => row.category,
            sortable: true,
        },
        {
            name: 'Total',
            selector: row => row.value,
            sortable: true,
        },
    ];

    // Data untuk tabel
    const tableData = selectedItem ? [
        {
            id: 1,
            category: 'Daftar',
            value: selectedItem.officials_statuses[0].toLocaleString('id-ID'),
        },
        {
            id: 2,
            category: 'Proses',
            value: selectedItem.officials_statuses[1].toLocaleString('id-ID'),
        },
        {
            id: 3,
            category: 'Validasi',
            value: selectedItem.officials_statuses[2].toLocaleString('id-ID'),
        },
        {
            id: 4,
            category: 'Tolak',
            value: selectedItem.officials_statuses[3].toLocaleString('id-ID'),
        },

    ] : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {aparatus.map((item) => (
                <motion.div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                    whileHover={{ scale: 1.05 }} // Animasi saat hover
                >
                    {/* Gambar (jika ada) */}
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-60 object-cover rounded-lg mb-4"
                        />
                    ) : (
                        <div className="w-full h-60 bg-green-50 flex items-center justify-center rounded-lg mb-4 group-hover:bg-green-900 transition-colors duration-300">
                            <FaImage className="text-green-900 text-6xl group-hover:text-white transition-colors duration-300" /> {/* Ikon default */}
                        </div>
                    )}

                    {/* Informasi */}
                    <h2 className="text-xl font-semibold text-gray-800 mb-0">{item.name_bps}</h2>
                    <p className="text-gray-600 text-sm mb-3">{item.name_dagri}</p>

                    {/* Kolom Informasi dengan Ikon */}
                    <div className="space-y-2">
                        {/* <div className="flex items-center space-x-2">
                            <FaMapMarkerAlt className="text-green-900 text-lg" />
                            <div className="flex justify-between w-full">
                                <p className="text-gray-600">Kecamatan</p>
                                <p className="text-gray-700 font-bold">{item.districts_count.toLocaleString('id-ID')}</p>
                            </div>
                        </div> */}
                        <div className="flex items-center space-x-2">
                            <FaHome className="text-green-900 text-lg" />
                            <div className="flex justify-between w-full">
                                <p className="text-gray-600">Desa</p>
                                <p className="text-gray-700 font-bold">{item.villages_count.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaUserTie className="text-green-900 text-lg" />
                            <div className="flex justify-between w-full">
                                <p className="text-gray-600">Pejabat/Aparatur</p>
                                <p className="text-gray-700 font-bold">{item.officials_count.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Container untuk 2 Tombol */}
                    <div className="flex justify-end mt-4 space-x-3">
                        {/* Tombol Modal */}
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation(); // Mencegah event bubbling ke parent
                                openModal(item);
                            }}
                            className="p-2 bg-green-900 text-white rounded-full hover:bg-green-700 transition-colors duration-300"
                            whileHover={{ scale: 1.1 }} // Animasi saat hover
                            whileTap={{ scale: 0.9 }} // Animasi saat diklik
                        >
                            <FaChartBar className="text-lg" />
                        </motion.button>

                        {/* Tombol Pindah Halaman */}
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation(); // Mencegah event bubbling ke parent
                                navigateToDetail(item.id);
                            }}
                            className="p-2 bg-green-900 text-white rounded-full hover:bg-green-700 transition-colors duration-300"
                            whileHover={{ scale: 1.1 }} // Animasi saat hover
                            whileTap={{ scale: 0.9 }} // Animasi saat diklik
                        >
                            <FaArrowRight className="text-lg" />
                        </motion.button>
                    </div>
                </motion.div>
            ))}

            {/* Modal untuk detail statistik */}
            <Modal isOpen={modalIsOpen} onClose={closeModal}>
                {selectedItem && (
                    <div className="max-h-[80vh] overflow-y-auto space-y-8 p-4">
                        {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail Statistik: {selectedItem.name_bps}</h2> */}

                        <div className="flex flex-cols-2 gap-8 w-full">
                            {/* Chart Pie */}
                            <motion.div
                                className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                whileHover={{ scale: 1.05 }} // Animasi saat hover
                            >
                                <div className="border-b pb-1">
                                    <h1>
                                        {("Statistik Data Pejabat").toUpperCase()}
                                    </h1>
                                </div>

                                <div className="">
                                    <Pie data={data} />
                                </div>
                            </motion.div>

                            <motion.div
                                className="w-full bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                                whileHover={{ scale: 1.05 }} // Animasi saat hover
                            >

                                <div className="">
                                    {selectedItem.name_bps}
                                </div>
                            </motion.div>
                        </div>

                        {/* Tabel menggunakan react-data-table-component */}
                        <motion.div
                                className=" bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                whileHover={{ scale: 1.05 }} // Animasi saat hover
                            >
                                <div className="border-b pb-1">
                                    <h1>
                                    {("Tabel Data Pejabat"+" "+selectedItem.name_dagri).toUpperCase()}
                                    </h1>
                                </div>
                            <DataTable
                            columns={columns}
                            data={tableData}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                        />
                        </motion.div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
