import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaImage, FaUserTie, FaChartBar, FaUsers, FaCheckCircle, FaTasks } from "react-icons/fa";
import Modal from "../../../../Admin/Aparatus/Partials/Section/Modal";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import DataTable from "react-data-table-component";
import { Tooltip as ReactTooltip } from 'react-tooltip';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default function ShowList({ villages }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Open and close modal
    const openModal = (item) => {
        setSelectedItem(item);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedItem(null);
    };

    // Determine color based on activity level
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

    // Pie chart for official statuses
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

    // Pie chart for data completeness
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

    // Pie chart for training participation
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

    // Pie chart for organization participation
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

    // Bar chart for participation comparison
    const participationChartData = {
        labels: villages.map(item => item.name_bps),
        datasets: [
            {
                label: 'Keikutsertaan Pelatihan Pemerintah (%)',
                data: villages.map(item => item.training_participation_rate),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Keikutsertaan Organisasi (%)',
                data: villages.map(item => item.organization_participation_rate),
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Table columns for officials list
    const officialsColumns = [
        { name: 'Nama', selector: row => row.nama_lengkap, sortable: true },
        { name: 'Status', selector: row => row.status, sortable: true },
        { name: 'Jabatan', selector: row => row.position, sortable: true },
        { name: 'Pelatihan Pemerintah', selector: row => row.government_training_count.toLocaleString('id-ID'), sortable: true },
        { name: 'Organisasi', selector: row => row.organization_count.toLocaleString('id-ID'), sortable: true },
        {
            name: 'Data Lengkap',
            selector: row => row.data_complete ? 'Ya' : 'Tidak',
            sortable: true,
            cell: row => (
                <span className={row.data_complete ? 'text-green-600' : 'text-red-600'}>
                    {row.data_complete ? 'Ya' : 'Tidak'}
                </span>
            )
        },
        { name: 'Pendidikan Terakhir', selector: row => row.pendidikan_terakhir, sortable: true },
        { name: 'Status Perkawinan', selector: row => row.status_perkawinan, sortable: true },
    ];

    // Sub-row for detailed training and organization info
    const officialsSubRow = row => (
        <div className="p-4 bg-gray-50">
            <div className="mb-4">
                <h4 className="font-semibold">Pelatihan Pemerintah:</h4>
                {row.government_trainings.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {row.government_trainings.map((training, index) => (
                            <li key={index}>
                                {training.title} (Penyelenggara: {training.penyelenggara || 'Tidak diketahui'},
                                Nomor Sertifikat: {training.nomor_sertifikat || 'Tidak ada'},
                                Tanggal: {training.tanggal_sertifikat || 'Tidak diketahui'})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Tidak ada pelatihan pemerintah.</p>
                )}
            </div>
            <div>
                <h4 className="font-semibold">Organisasi:</h4>
                {row.organizations.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {row.organizations.map((org, index) => (
                            <li key={index}>
                                {org.title} (Posisi: {org.posisi || 'Anggota'},
                                Periode: {org.mulai || 'Tidak diketahui'} - {org.selesai || 'Sekarang'})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Tidak ada organisasi.</p>
                )}
            </div>
        </div>
    );

    // Table columns for most active officials
    const mostActiveColumns = [
        { name: 'Nama', selector: row => row.nama_lengkap, sortable: true },
        { name: 'Status', selector: row => row.status, sortable: true },
        { name: 'Jabatan', selector: row => row.position, sortable: true },
        { name: 'Pelatihan Pemerintah', selector: row => row.government_training_count.toLocaleString('id-ID'), sortable: true },
        { name: 'Pendidikan Terakhir', selector: row => row.pendidikan_terakhir, sortable: true },
    ];

    // Table columns for inactive officials
    const inactiveColumns = [
        { name: 'Nama', selector: row => row.nama_lengkap, sortable: true },
        { name: 'Status', selector: row => row.status, sortable: true },
        { name: 'Jabatan', selector: row => row.position, sortable: true },
        { name: 'Pendidikan Terakhir', selector: row => row.pendidikan_terakhir, sortable: true },
    ];

    // Table columns for status summary
    const statusColumns = [
        { name: 'Kategori', selector: row => row.category, sortable: true },
        { name: 'Nilai', selector: row => row.value, sortable: true },
    ];

    const statusTableData = selectedItem ? [
        { id: 1, category: 'Daftar', value: selectedItem.officials_statuses[0].toLocaleString('id-ID') },
        { id: 2, category: 'Proses', value: selectedItem.officials_statuses[1].toLocaleString('id-ID') },
        { id: 3, category: 'Validasi', value: selectedItem.officials_statuses[2].toLocaleString('id-ID') },
        { id: 4, category: 'Tolak', value: selectedItem.officials_statuses[3].toLocaleString('id-ID') },
        { id: 5, category: 'Kelengkapan Data (%)', value: selectedItem.data_completeness.toLocaleString('id-ID') + '%' },
        { id: 6, category: 'Keikutsertaan Pelatihan Pemerintah (%)', value: selectedItem.training_participation_rate.toLocaleString('id-ID') + '%' },
        { id: 7, category: 'Keikutsertaan Organisasi (%)', value: selectedItem.organization_participation_rate.toLocaleString('id-ID') + '%' },
        { id: 8, category: 'Tingkat Keaktifan (%)', value: `${selectedItem.activity_rate.toLocaleString('id-ID')}% (${selectedItem.activity_level})` },
    ] : [];

    // Render bar chart
    useEffect(() => {
        const ctx = document.getElementById('participationChart')?.getContext('2d');
        if (ctx) {
            const chart = new ChartJS(ctx, {
                type: 'bar',
                data: participationChartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: 'Persentase (%)' },
                        },
                        x: {
                            title: { display: true, text: 'Desa' },
                        },
                    },
                    plugins: {
                        legend: { display: true },
                        title: { display: true, text: 'Keikutsertaan Pelatihan dan Organisasi per Desa' },
                        tooltip: {
                            callbacks: {
                                footer: (tooltipItems) => {
                                    const village = villages[tooltipItems[0].dataIndex];
                                    return village.calculation_basis[tooltipItems[0].dataset.label.includes('Pelatihan') ? 'training_participation' : 'organization_participation'].basis;
                                },
                            },
                        },
                    },
                },
            });
            return () => chart.destroy(); // Cleanup on unmount
        }
    }, [villages]);

    return (
        <div>
            {/* Bar chart for participation comparison */}
            <div className="mb-8">
                <motion.div
                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Keikutsertaan Pelatihan dan Organisasi per Desa</h2>
                    <canvas id="participationChart"></canvas>
                </motion.div>
            </div>

            {/* List of villages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {villages.map((item) => (
                    <motion.div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                        whileHover={{ scale: 1.05 }}
                    >
                        {/* Image */}
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.name_bps}
                                className="w-full h-60 object-cover rounded-lg mb-4"
                            />
                        ) : (
                            <div className="w-full h-60 bg-green-50 flex items-center justify-center rounded-lg mb-4 group-hover:bg-green-900 transition-colors duration-300">
                                <FaImage className="text-green-900 text-6xl group-hover:text-white transition-colors duration-300" />
                            </div>
                        )}

                        {/* Information */}
                        <h2 className="text-xl font-semibold text-gray-800 mb-0">{item.name_bps}</h2>
                        <p className="text-gray-600 text-sm mb-3">{item.name_dagri}</p>

                        {/* Information columns with icons */}
                        <div className="space-y-2">
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

                        {/* Tooltips */}
                        <ReactTooltip id={`completeness-tooltip-${item.id}`} place="top" effect="solid" />
                        <ReactTooltip id={`training-tooltip-${item.id}`} place="top" effect="solid" />
                        <ReactTooltip id={`organization-tooltip-${item.id}`} place="top" effect="solid" />
                        <ReactTooltip id={`activity-tooltip-${item.id}`} place="top" effect="solid" />

                        {/* Buttons */}
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
                        </div>
                    </motion.div>
                ))}

                {/* Modal for detailed statistics */}
                <Modal isOpen={modalIsOpen} onClose={closeModal}>
                    {selectedItem && (
                        <div className="max-h-[80vh] overflow-y-auto space-y-8 p-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail Statistik: {selectedItem.name_bps}</h2>

                            <div className="flex flex-col gap-8 w-full">
                                {/* Chart for Official Status */}
                                <motion.div
                                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="border-b pb-1">
                                        <h1>STATISTIK STATUS PEJABAT</h1>
                                    </div>
                                    <div>
                                        <Pie data={statusChartData} />
                                    </div>
                                </motion.div>

                                {/* Chart for Data Completeness */}
                                <motion.div
                                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="border-b pb-1">
                                        <h1>STATISTIK KELENGKAPAN DATA</h1>
                                    </div>
                                    <div>
                                        <Pie data={completenessChartData} />
                                    </div>
                                </motion.div>

                                {/* Chart for Training Participation */}
                                <motion.div
                                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="border-b pb-1">
                                        <h1>STATISTIK KEIKUTSERTAAN PELATIHAN PEMERINTAH</h1>
                                    </div>
                                    <div>
                                        <Pie data={trainingChartData} />
                                    </div>
                                </motion.div>

                                {/* Chart for Organization Participation */}
                                <motion.div
                                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="border-b pb-1">
                                        <h1>STATISTIK KEIKUTSERTAAN ORGANISASI</h1>
                                    </div>
                                    <div>
                                        <Pie data={organizationChartData} />
                                    </div>
                                </motion.div>

                                {/* Table for Status Summary */}
                                <motion.div
                                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="border-b pb-1">
                                        <h1>{`TABEL RINGKASAN DATA ${selectedItem.name_dagri}`.toUpperCase()}</h1>
                                    </div>
                                    <DataTable
                                        columns={statusColumns}
                                        data={statusTableData}
                                        pagination
                                        highlightOnHover
                                        striped
                                        responsive
                                    />
                                </motion.div>

                                {/* Table for Officials List */}
                                <motion.div
                                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="border-b pb-1">
                                        <h1>{`DAFTAR PEJABAT ${selectedItem.name_dagri}`.toUpperCase()}</h1>
                                    </div>
                                    <DataTable
                                        columns={officialsColumns}
                                        data={selectedItem.officials_list}
                                        pagination
                                        paginationPerPage={10}
                                        paginationRowsPerPageOptions={[10, 25, 50]}
                                        highlightOnHover
                                        striped
                                        responsive
                                        expandableRows
                                        expandableRowsComponent={officialsSubRow}
                                    />
                                </motion.div>

                                {/* Table for Most Active Officials */}
                                <motion.div
                                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="border-b pb-1">
                                        <h1>{`PEJABAT PALING AKTIF ${selectedItem.name_dagri}`.toUpperCase()}</h1>
                                        <p
                                            className="text-sm text-gray-600"
                                            data-tooltip-id={`most-active-tooltip-${selectedItem.id}`}
                                            data-tooltip-content={selectedItem.calculation_basis?.most_active_officials?.basis || ''}
                                        >
                                            Berdasarkan jumlah pelatihan pemerintah yang diikuti
                                        </p>
                                    </div>
                                    <DataTable
                                        columns={mostActiveColumns}
                                        data={selectedItem.most_active_officials}
                                        pagination
                                        highlightOnHover
                                        striped
                                        responsive
                                    />
                                    <ReactTooltip id={`most-active-tooltip-${selectedItem.id}`} place="top" effect="solid" />
                                </motion.div>

                                {/* Table for Inactive Officials */}
                                <motion.div
                                    className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group space-y-4"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="border-b pb-1">
                                        <h1>{`PEJABAT TIDAK AKTIF ${selectedItem.name_dagri}`.toUpperCase()}</h1>
                                        <p
                                            className="text-sm text-gray-600"
                                            data-tooltip-id={`inactive-tooltip-${selectedItem.id}`}
                                            data-tooltip-content={selectedItem.calculation_basis?.inactive_officials?.basis || ''}
                                        >
                                            Tidak mengikuti pelatihan pemerintah
                                        </p>
                                    </div>
                                    <DataTable
                                        columns={inactiveColumns}
                                        data={selectedItem.inactive_officials}
                                        pagination
                                        highlightOnHover
                                        striped
                                        responsive
                                    />
                                    <ReactTooltip id={`inactive-tooltip-${selectedItem.id}`} place="top" effect="solid" />
                                </motion.div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}
