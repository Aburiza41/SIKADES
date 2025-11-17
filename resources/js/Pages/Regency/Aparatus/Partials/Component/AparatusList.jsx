import { motion } from "framer-motion";
import { useState } from "react";
import { FaHome, FaUserTie, FaChartBar, FaArrowRight, FaCheckCircle, FaTasks, FaUsers } from "react-icons/fa";
import Modal from "../Section/Modal";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DataTable from "react-data-table-component";
import { Link, usePage } from '@inertiajs/react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

// Registrasi komponen Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function AparatusList({ aparatus }) {
    const user = usePage().props.auth.user;
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Fungsi untuk membuka dan menutup modal
    const openModal = (item) => {
        setSelectedItem(item);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedItem(null);
    };

    // Fungsi untuk pindah halaman
    const navigateToDetail = (id) => {
        window.location.href = `/regency/aparatus/district/${id}`;
    };

    // Tentukan warna berdasarkan tingkat keaktifan
    const getActivityLevelColor = (level) => {
        switch (level) {
            case 'Tinggi':
                return 'text-green-600';
            case 'Sedang':
                return 'text-yellow-600';
            case 'Rendah':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    // Data untuk pie chart status pejabat
    const statusChartData = selectedItem ? {
        labels: ['Daftar', 'Proses', 'Validasi', 'Tolak'],
        datasets: [
            {
                label: 'Jumlah',
                data: selectedItem.officials_statuses,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    } : null;

    // Data untuk pie chart kelengkapan data
    const completenessChartData = selectedItem ? {
        labels: ['Data Lengkap', 'Data Tidak Lengkap'],
        datasets: [
            {
                label: 'Kelengkapan Data',
                data: [selectedItem.data_completeness, 100 - selectedItem.data_completeness],
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    } : null;

    // Data untuk pie chart keikutsertaan pelatihan
    const trainingChartData = selectedItem ? {
        labels: ['Mengikuti Pelatihan Pemerintah', 'Tidak Mengikuti'],
        datasets: [
            {
                label: 'Keikutsertaan Pelatihan',
                data: [selectedItem.training_participation_rate, 100 - selectedItem.training_participation_rate],
                backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    } : null;

    // Data untuk pie chart keikutsertaan organisasi
    const organizationChartData = selectedItem ? {
        labels: ['Mengikuti Organisasi', 'Tidak Mengikuti'],
        datasets: [
            {
                label: 'Keikutsertaan Organisasi',
                data: [selectedItem.organization_participation_rate, 100 - selectedItem.organization_participation_rate],
                backgroundColor: ['rgba(255, 206, 86, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    } : null;

    // Data untuk tabel
    const columns = [
        { name: 'Kategori', selector: row => row.category, sortable: true },
        { name: 'Nilai', selector: row => row.value, sortable: true },
    ];

    const tableData = selectedItem ? [
        { id: 1, category: 'Daftar', value: selectedItem.officials_statuses[0].toLocaleString('id-ID') },
        { id: 2, category: 'Proses', value: selectedItem.officials_statuses[1].toLocaleString('id-ID') },
        { id: 3, category: 'Validasi', value: selectedItem.officials_statuses[2].toLocaleString('id-ID') },
        { id: 4, category: 'Tolak', value: selectedItem.officials_statuses[3].toLocaleString('id-ID') },
        { id: 5, category: 'Kelengkapan Data (%)', value: selectedItem.data_completeness.toLocaleString('id-ID') + '%' },
        { id: 6, category: 'Keikutsertaan Pelatihan Pemerintah (%)', value: selectedItem.training_participation_rate.toLocaleString('id-ID') + '%' },
        { id: 7, category: 'Keikutsertaan Organisasi (%)', value: selectedItem.organization_participation_rate.toLocaleString('id-ID') + '%' },
        { id: 8, category: 'Tingkat Keaktifan (%)', value: selectedItem.activity_rate.toLocaleString('id-ID') + '%' },
    ] : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {aparatus.map((item) => (
                <motion.div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                    whileHover={{ scale: 1.05 }}
                >
                    {/* Informasi */}
                    <h2 className="text-xl font-semibold text-gray-800 mb-0">{item.name_bps}</h2>
                    <p className="text-gray-600 text-sm mb-3">{item.name_dagri}</p>

                    {/* Kolom Informasi dengan Ikon */}
                    <div className="space-y-2">
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
                        <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-green-900 text-lg" />
                            <div className="flex justify-between w-full">
                                <p className="text-gray-600">Kelengkapan Data</p>
                                <p
                                    className="text-gray-700 font-bold"
                                    data-tooltip-id={`completeness-tooltip-${item.id}`}
                                    data-tooltip-content={item.calculation_basis?.data_completeness?.basis || ''}
                                >
                                    {item.data_completeness.toLocaleString('id-ID')}%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaUsers className="text-green-900 text-lg" />
                            <div className="flex justify-between w-full">
                                <p className="text-gray-600">Keikutsertaan Pelatihan</p>
                                <p
                                    className="text-gray-700 font-bold"
                                    data-tooltip-id={`training-tooltip-${item.id}`}
                                    data-tooltip-content={item.calculation_basis?.training_participation?.basis || ''}
                                >
                                    {item.training_participation_rate.toLocaleString('id-ID')}%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaUsers className="text-green-900 text-lg" />
                            <div className="flex justify-between w-full">
                                <p className="text-gray-600">Keikutsertaan Organisasi</p>
                                <p
                                    className="text-gray-700 font-bold"
                                    data-tooltip-id={`organization-tooltip-${item.id}`}
                                    data-tooltip-content={item.calculation_basis?.organization_participation?.basis || ''}
                                >
                                    {item.organization_participation_rate.toLocaleString('id-ID')}%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaTasks className="text-green-900 text-lg" />
                            <div className="flex justify-between w-full">
                                <p className="text-gray-600">Tingkat Keaktifan</p>
                                <p
                                    className={`font-bold ${getActivityLevelColor(item.activity_level)}`}
                                    data-tooltip-id={`activity-tooltip-${item.id}`}
                                    data-tooltip-content={item.calculation_basis?.activity_rate?.basis || ''}
                                >
                                    {item.activity_rate.toLocaleString('id-ID')}% ({item.activity_level})
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tooltip */}
                    <ReactTooltip id={`completeness-tooltip-${item.id}`} place="top" effect="solid" />
                    <ReactTooltip id={`training-tooltip-${item.id}`} place="top" effect="solid" />
                    <ReactTooltip id={`organization-tooltip-${item.id}`} place="top" effect="solid" />
                    <ReactTooltip id={`activity-tooltip-${item.id}`} place="top" effect="solid" />

                    {/* Tombol */}
                    <div className="flex justify-end mt-4 space-x-3">
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal(item);
                            }}
                            className="p-2 bg-green-900 text-white rounded-full hover:bg-green-700 transition-colors duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaChartBar className="text-lg" />
                        </motion.button>
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateToDetail(item.id);
                            }}
                            className="p-2 bg-green-900 text-white rounded-full hover:bg-green-700 transition-colors duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
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
                        <div className="flex flex-col gap-8 w-full">
                            {/* Chart Status Pejabat */}
                            <motion.div
                                className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="border-b pb-1">
                                    <h1>{("Statistik Status Pejabat").toUpperCase()}</h1>
                                </div>
                                <div>
                                    <Pie data={statusChartData} />
                                </div>
                            </motion.div>

                            {/* Chart Kelengkapan Data */}
                            <motion.div
                                className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="border-b pb-1">
                                    <h1>{("Statistik Kelengkapan Data").toUpperCase()}</h1>
                                </div>
                                <div>
                                    <Pie data={completenessChartData} />
                                </div>
                            </motion.div>

                            {/* Chart Keikutsertaan Pelatihan */}
                            <motion.div
                                className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="border-b pb-1">
                                    <h1>{("Statistik Keikutsertaan Pelatihan Pemerintah").toUpperCase()}</h1>
                                </div>
                                <div>
                                    <Pie data={trainingChartData} />
                                </div>
                            </motion.div>

                            {/* Chart Keikutsertaan Organisasi */}
                            <motion.div
                                className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="border-b pb-1">
                                    <h1>{("Statistik Keikutsertaan Organisasi").toUpperCase()}</h1>
                                </div>
                                <div>
                                    <Pie data={organizationChartData} />
                                </div>
                            </motion.div>

                            {/* Tabel Data */}
                            <motion.div
                                className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="border-b pb-1">
                                    <h1>{("Tabel Data Pejabat " + selectedItem.name_dagri).toUpperCase()}</h1>
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
                    </div>
                )}
            </Modal>
        </div>
    );
}
