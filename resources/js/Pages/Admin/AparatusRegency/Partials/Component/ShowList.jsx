import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaImage, FaUserTie, FaChartBar, FaUsers, FaCheckCircle, FaTasks, FaTrophy, FaMedal, FaAward } from "react-icons/fa";
import Modal from "../../../../Admin/Aparatus/Partials/Section/Modal";
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import DataTable from "react-data-table-component";
import { Tooltip as ReactTooltip } from 'react-tooltip';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default function ShowList({ villages = [], globalData = {} }) {
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
            case 'Tinggi': return 'text-green-600';
            case 'Sedang': return 'text-yellow-600';
            case 'Rendah': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    // Global Chart Data with Error Handling
    const globalStatusChartData = {
        labels: ['Daftar', 'Proses', 'Validasi', 'Tolak'],
        datasets: [{
            label: 'Jumlah',
            data: globalData.status_distribution || [0, 0, 0, 0],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(255, 206, 86, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
            borderWidth: 1,
        }],
    };

    const globalActivityLevelChartData = {
        labels: ['Tinggi', 'Sedang', 'Rendah'],
        datasets: [{
            label: 'Jumlah Desa',
            data: [
                globalData.activity_level_distribution?.Tinggi || 0,
                globalData.activity_level_distribution?.Sedang || 0,
                globalData.activity_level_distribution?.Rendah || 0
            ],
            backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1,
        }],
    };

    const globalGenderChartData = {
        labels: ['Laki-laki', 'Perempuan', 'Lainnya'],
        datasets: [{
            label: 'Jumlah Pejabat',
            data: [
                globalData.gender_distribution?.L || 0,
                globalData.gender_distribution?.P || 0,
                globalData.gender_distribution?.Lainnya || 0
            ],
            backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(153, 102, 255, 0.2)'],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(153, 102, 255, 1)'],
            borderWidth: 1,
        }],
    };

    const globalEducationChartData = {
        labels: globalData.education_distribution ? Object.keys(globalData.education_distribution) : ['Tidak ada data'],
        datasets: [{
            label: 'Jumlah Pejabat',
            data: globalData.education_distribution ? Object.values(globalData.education_distribution) : [0],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(153, 102, 255, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'],
            borderWidth: 1,
        }],
    };

    const globalMaritalStatusChartData = {
        labels: globalData.marital_status_distribution ? Object.keys(globalData.marital_status_distribution) : ['Tidak ada data'],
        datasets: [{
            label: 'Jumlah Pejabat',
            data: globalData.marital_status_distribution ? Object.values(globalData.marital_status_distribution) : [0],
            backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(153, 102, 255, 0.2)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'],
            borderWidth: 1,
        }],
    };

    const globalAgeChartData = {
        labels: ['<25', '25-35', '36-45', '46-55', '>55'],
        datasets: [{
            label: 'Jumlah Pejabat',
            data: globalData.age_distribution
                ? Object.values(globalData.age_distribution)
                : [0, 0, 0, 0, 0],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(153, 102, 255, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'],
            borderWidth: 1,
        }],
    };

    const globalVillageRankingChartData = {
        labels: globalData.village_rankings?.map(item => item.village_name) || [],
        datasets: [{
            label: 'Skor Rata-rata (%)',
            data: globalData.village_rankings?.map(item => item.score) || [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }],
    };

    const globalTopOfficialsTrainingChart = {
        labels: globalData.top_global_officials_training?.map(item => `${item.nama_lengkap} (${item.village_name})`) || [],
        datasets: [{
            label: 'Jumlah Pelatihan',
            data: globalData.top_global_officials_training?.map(item => item.training_count) || [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };

    const globalTopOfficialsOrganizationChart = {
        labels: globalData.top_global_officials_organization?.map(item => `${item.nama_lengkap} (${item.village_name})`) || [],
        datasets: [{
            label: 'Jumlah Organisasi',
            data: globalData.top_global_officials_organization?.map(item => item.organization_count) || [],
            backgroundColor: 'rgba(255, 206, 86, 0.6)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
        }],
    };

    const globalTopPositionsTrainingChart = {
        labels: globalData.top_global_positions_training?.map(item => item.position) || [],
        datasets: [{
            label: 'Jumlah Pelatihan',
            data: globalData.top_global_positions_training?.map(item => item.training_count) || [],
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
        }],
    };

    const globalTopPositionsOrganizationChart = {
        labels: globalData.top_global_positions_organization?.map(item => item.position) || [],
        datasets: [{
            label: 'Jumlah Organisasi',
            data: globalData.top_global_positions_organization?.map(item => item.organization_count) || [],
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
        }],
    };

    const globalTopTrainingsChart = {
        labels: globalData.top_global_trainings?.map(item => item.training) || [],
        datasets: [{
            label: 'Jumlah Peserta',
            data: globalData.top_global_trainings?.map(item => item.count) || [],
            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'],
            borderWidth: 1,
        }],
    };

    const globalTopOrganizationsChart = {
        labels: globalData.top_global_organizations?.map(item => item.organization) || [],
        datasets: [{
            label: 'Jumlah Anggota',
            data: globalData.top_global_organizations?.map(item => item.count) || [],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1,
        }],
    };

    // Village-specific Chart Data
    const statusChartData = selectedItem ? {
        labels: ['Daftar', 'Proses', 'Validasi', 'Tolak'],
        datasets: [{
            label: 'Jumlah',
            data: selectedItem.officials_statuses || [0, 0, 0, 0],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(255, 206, 86, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
            borderWidth: 1,
        }],
    } : null;

    const completenessChartData = selectedItem ? {
        labels: ['Data Lengkap', 'Data Tidak Lengkap'],
        datasets: [{
            label: 'Kelengkapan Data',
            data: [selectedItem.data_completeness || 0, 100 - (selectedItem.data_completeness || 0)],
            backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1,
        }],
    } : null;

    const trainingParticipationChartData = selectedItem ? {
        labels: ['Mengikuti Pelatihan', 'Tidak Mengikuti'],
        datasets: [{
            label: 'Keikutsertaan Pelatihan',
            data: [selectedItem.training_participation_rate || 0, 100 - (selectedItem.training_participation_rate || 0)],
            backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1,
        }],
    } : null;

    const organizationParticipationChartData = selectedItem ? {
        labels: ['Mengikuti Organisasi', 'Tidak Mengikuti'],
        datasets: [{
            label: 'Keikutsertaan Organisasi',
            data: [selectedItem.organization_participation_rate || 0, 100 - (selectedItem.organization_participation_rate || 0)],
            backgroundColor: ['rgba(255, 206, 86, 0.2)', 'rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1,
        }],
    } : null;

    const topOfficialsTrainingChart = selectedItem ? {
        labels: selectedItem.top_officials_by_training?.map(item => item.nama_lengkap) || [],
        datasets: [{
            label: 'Jumlah Pelatihan',
            data: selectedItem.top_officials_by_training?.map(item => item.training_count) || [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    } : null;

    const topOfficialsOrganizationChart = selectedItem ? {
        labels: selectedItem.top_officials_by_organization?.map(item => item.nama_lengkap) || [],
        datasets: [{
            label: 'Jumlah Organisasi',
            data: selectedItem.top_officials_by_organization?.map(item => item.organization_count) || [],
            backgroundColor: 'rgba(255, 206, 86, 0.6)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
        }],
    } : null;

    const topPositionsTrainingChart = selectedItem ? {
        labels: selectedItem.top_positions_by_training?.map(item => item.position) || [],
        datasets: [{
            label: 'Jumlah Pelatihan',
            data: selectedItem.top_positions_by_training?.map(item => item.training_count) || [],
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
        }],
    } : null;

    const topPositionsOrganizationChart = selectedItem ? {
        labels: selectedItem.top_positions_by_organization?.map(item => item.position) || [],
        datasets: [{
            label: 'Jumlah Organisasi',
            data: selectedItem.top_positions_by_organization?.map(item => item.organization_count) || [],
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
        }],
    } : null;

    const topTrainingsChart = selectedItem ? {
        labels: selectedItem.top_trainings?.map(item => item.training) || [],
        datasets: [{
            label: 'Jumlah Peserta',
            data: selectedItem.top_trainings?.map(item => item.count) || [],
            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
            borderWidth: 1,
        }],
    } : null;

    const topOrganizationsChart = selectedItem ? {
        labels: selectedItem.top_organizations?.map(item => item.organization) || [],
        datasets: [{
            label: 'Jumlah Anggota',
            data: selectedItem.top_organizations?.map(item => item.count) || [],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
            borderWidth: 1,
        }],
    } : null;

    const genderChartData = selectedItem ? {
        labels: ['Laki-laki', 'Perempuan', 'Lainnya'],
        datasets: [{
            label: 'Jumlah Pejabat',
            data: [
                selectedItem.gender_distribution?.L || 0,
                selectedItem.gender_distribution?.P || 0,
                selectedItem.gender_distribution?.Lainnya || 0
            ],
            backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(153, 102, 255, 0.2)'],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(153, 102, 255, 1)'],
            borderWidth: 1,
        }],
    } : null;

    const educationChartData = selectedItem ? {
        labels: selectedItem.education_distribution ? Object.keys(selectedItem.education_distribution) : ['Tidak ada data'],
        datasets: [{
            label: 'Jumlah Pejabat',
            data: selectedItem.education_distribution ? Object.values(selectedItem.education_distribution) : [0],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(153, 102, 255, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'],
            borderWidth: 1,
        }],
    } : null;

    const maritalStatusChartData = selectedItem ? {
        labels: selectedItem.marital_status_distribution ? Object.keys(selectedItem.marital_status_distribution) : ['Tidak ada data'],
        datasets: [{
            label: 'Jumlah Pejabat',
            data: selectedItem.marital_status_distribution ? Object.values(selectedItem.marital_status_distribution) : [0],
            backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(153, 102, 255, 0.2)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'],
            borderWidth: 1,
        }],
    } : null;

    const ageChartData = selectedItem ? {
        labels: ['<25', '25-35', '36-45', '46-55', '>55'],
        datasets: [{
            label: 'Jumlah Pejabat',
            data: selectedItem.age_distribution
                ? Object.values(selectedItem.age_distribution)
                : [0, 0, 0, 0, 0],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(153, 102, 255, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'],
            borderWidth: 1,
        }],
    } : null;

    // Table columns
    const officialsColumns = [
        { name: 'Nama', selector: row => row.nama_lengkap || 'Tidak diketahui', sortable: true },
        { name: 'Status', selector: row => row.status || 'Tidak diketahui', sortable: true },
        { name: 'Jabatan', selector: row => row.position || 'Tidak ada jabatan', sortable: true },
        { name: 'Pelatihan', selector: row => (row.government_training_count || 0).toLocaleString('id-ID'), sortable: true },
        { name: 'Organisasi', selector: row => (row.organization_count || 0).toLocaleString('id-ID'), sortable: true },
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
        { name: 'Pendidikan', selector: row => row.pendidikan_terakhir || 'Tidak diketahui', sortable: true },
        { name: 'Status Perkawinan', selector: row => row.status_perkawinan || 'Tidak diketahui', sortable: true },
        { name: 'Jenis Kelamin', selector: row => row.jenis_kelamin || 'Tidak diketahui', sortable: true },
    ];

    const topOfficialsColumns = [
        { name: 'Nama', selector: row => row.nama_lengkap || 'Tidak diketahui', sortable: true },
        { name: 'Desa', selector: row => row.village_name || 'Tidak diketahui', sortable: true },
        { name: 'Jabatan', selector: row => row.position || 'Tidak ada jabatan', sortable: true },
        { name: 'Jumlah Pelatihan', selector: row => (row.training_count || 0).toLocaleString('id-ID'), sortable: true },
        { name: 'Jumlah Organisasi', selector: row => (row.organization_count || 0).toLocaleString('id-ID'), sortable: true },
    ];

    const topPositionsColumns = [
        { name: 'Jabatan', selector: row => row.position || 'Tidak ada jabatan', sortable: true },
        { name: 'Jumlah Pelatihan', selector: row => (row.training_count || 0).toLocaleString('id-ID'), sortable: true },
        { name: 'Jumlah Organisasi', selector: row => (row.organization_count || 0).toLocaleString('id-ID'), sortable: true },
    ];

    const topItemsColumns = [
        { name: 'Nama', selector: row => row.name || 'Tidak diketahui', sortable: true },
        { name: 'Jumlah', selector: row => (row.count || 0).toLocaleString('id-ID'), sortable: true },
    ];

    const villageRankingColumns = [
        { name: 'Desa', selector: row => row.village_name || 'Tidak diketahui', sortable: true },
        { name: 'Jumlah Pejabat', selector: row => (row.officials_count || 0).toLocaleString('id-ID'), sortable: true },
        { name: 'Kelengkapan Data (%)', selector: row => (row.data_completeness || 0).toLocaleString('id-ID'), sortable: true },
        { name: 'Partisipasi Pelatihan (%)', selector: row => (row.training_participation_rate || 0).toLocaleString('id-ID'), sortable: true },
        { name: 'Partisipasi Organisasi (%)', selector: row => (row.organization_participation_rate || 0).toLocaleString('id-ID'), sortable: true },
        { name: 'Tingkat Keaktifan (%)', selector: row => (row.activity_rate || 0).toLocaleString('id-ID'), sortable: true },
        { name: 'Skor', selector: row => (row.score || 0).toLocaleString('id-ID'), sortable: true },
    ];

    // Sub-row for detailed training and organization info
    const officialsSubRow = row => (
        <div className="p-4 bg-gray-50">
            <div className="mb-4">
                <h4 className="font-semibold">Pelatihan Pemerintah:</h4>
                {(row.government_trainings?.length > 0) ? (
                    <ul className="list-disc pl-5">
                        {row.government_trainings.map((training, index) => (
                            <li key={index}>
                                {training.title || 'Tidak diketahui'} (Penyelenggara: {training.penyelenggara || 'Tidak diketahui'},
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
                {(row.organizations?.length > 0) ? (
                    <ul className="list-disc pl-5">
                        {row.organizations.map((org, index) => (
                            <li key={index}>
                                {org.title || 'Tidak diketahui'} (Posisi: {org.posisi || 'Anggota'},
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

    // Cleanup charts on component unmount
    useEffect(() => {
        return () => {
            const chartIds = ['globalVillageRankingChart', 'globalTopOfficialsTrainingChart', 'globalTopOfficialsOrganizationChart'];
            chartIds.forEach(id => {
                const chart = ChartJS.getChart(id);
                if (chart) chart.destroy();
            });
        };
    }, []);

    // Check if globalData is valid before rendering charts
    const isGlobalDataValid = globalData && Object.keys(globalData).length > 0;

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Global Overview Section */}
            {isGlobalDataValid ? (
                <motion.div
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Ikhtisar Kecamatan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <FaUsers className="text-green-900 text-lg" />
                            <div>
                                <p className="text-gray-600">Total Pejabat</p>
                                <p className="text-gray-700 font-bold">{(globalData.total_officials || 0).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-green-900 text-lg" />
                            <div>
                                <p className="text-gray-600">Rata-rata Kelengkapan Data</p>
                                <p
                                    className="text-gray-700 font-bold"
                                    data-tooltip-id="global-data-completeness"
                                    data-tooltip-content="Rata-rata persentase kelengkapan data di semua desa"
                                >
                                    {(globalData.avg_data_completeness || 0).toLocaleString('id-ID')}%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaUsers className="text-green-900 text-lg" />
                            <div>
                                <p className="text-gray-600">Rata-rata Partisipasi Pelatihan</p>
                                <p
                                    className="text-gray-700 font-bold"
                                    data-tooltip-id="global-training-participation"
                                    data-tooltip-content="Rata-rata persentase pejabat yang mengikuti pelatihan pemerintah di semua desa"
                                >
                                    {(globalData.avg_training_participation || 0).toLocaleString('id-ID')}%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FaTasks className="text-green-900 text-lg" />
                            <div>
                                <p className="text-gray-600">Rata-rata Tingkat Keaktifan</p>
                                <p
                                    className="text-gray-700 font-bold"
                                    data-tooltip-id="global-activity-rate"
                                    data-tooltip-content="Rata-rata persentase pejabat yang aktif (pelatihan atau organisasi) di semua desa"
                                >
                                    {(globalData.avg_activity_rate || 0).toLocaleString('id-ID')}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Global Status Distribution */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaUserTie className="text-blue-500 text-xl mr-2" />
                                <h3 className="font-semibold">Distribusi Status Pejabat</h3>
                            </div>
                            <Pie data={globalStatusChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </motion.div>

                        {/* Global Activity Level Distribution */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaTasks className="text-green-500 text-xl mr-2" />
                                <h3 className="font-semibold">Distribusi Tingkat Keaktifan Desa</h3>
                            </div>
                            <Pie data={globalActivityLevelChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </motion.div>

                        {/* Global Gender Distribution */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaUsers className="text-blue-500 text-xl mr-2" />
                                <h3 className="font-semibold">Distribusi Jenis Kelamin</h3>
                            </div>
                            <Pie data={globalGenderChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </motion.div>

                        {/* Global Education Distribution */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaAward className="text-green-500 text-xl mr-2" />
                                <h3 className="font-semibold">Distribusi Pendidikan</h3>
                            </div>
                            <Pie data={globalEducationChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </motion.div>

                        {/* Global Marital Status Distribution */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaUsers className="text-blue-500 text-xl mr-2" />
                                <h3 className="font-semibold">Distribusi Status Perkawinan</h3>
                            </div>
                            <Pie data={globalMaritalStatusChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </motion.div>

                        {/* Global Age Distribution */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaUsers className="text-blue-500 text-xl mr-2" />
                                <h3 className="font-semibold">Distribusi Usia</h3>
                            </div>
                            <Pie data={globalAgeChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </motion.div>

                        {/* Village Rankings */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaTrophy className="text-yellow-500 text-xl mr-2" />
                                <h3 className="font-semibold">Peringkat Desa</h3>
                            </div>
                            <Bar data={globalVillageRankingChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                            <DataTable
                                columns={villageRankingColumns}
                                data={globalData.village_rankings || []}
                                pagination
                                highlightOnHover
                                striped
                                className="mt-4"
                            />
                        </motion.div>

                        {/* Global Top Officials by Training */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaTrophy className="text-yellow-500 text-xl mr-2" />
                                <h3 className="font-semibold">Top 10 Pejabat - Pelatihan (Kecamatan)</h3>
                            </div>
                            <Bar data={globalTopOfficialsTrainingChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                            <DataTable
                                columns={topOfficialsColumns}
                                data={globalData.top_global_officials_training || []}
                                pagination
                                highlightOnHover
                                striped
                                className="mt-4"
                            />
                        </motion.div>

                        {/* Global Top Officials by Organization */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaTrophy className="text-yellow-500 text-xl mr-2" />
                                <h3 className="font-semibold">Top 10 Pejabat - Organisasi (Kecamatan)</h3>
                            </div>
                            <Bar data={globalTopOfficialsOrganizationChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                            <DataTable
                                columns={topOfficialsColumns}
                                data={globalData.top_global_officials_organization || []}
                                pagination
                                highlightOnHover
                                striped
                                className="mt-4"
                            />
                        </motion.div>

                        {/* Global Top Positions by Training */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaMedal className="text-blue-500 text-xl mr-2" />
                                <h3 className="font-semibold">Top 5 Jabatan - Pelatihan (Kecamatan)</h3>
                            </div>
                            <Doughnut data={globalTopPositionsTrainingChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            <DataTable
                                columns={topPositionsColumns}
                                data={globalData.top_global_positions_training || []}
                                pagination
                                highlightOnHover
                                striped
                                className="mt-4"
                            />
                        </motion.div>

                        {/* Global Top Positions by Organization */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaMedal className="text-blue-500 text-xl mr-2" />
                                <h3 className="font-semibold">Top 5 Jabatan - Organisasi (Kecamatan)</h3>
                            </div>
                            <Doughnut data={globalTopPositionsOrganizationChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            <DataTable
                                columns={topPositionsColumns}
                                data={globalData.top_global_positions_organization || []}
                                pagination
                                highlightOnHover
                                striped
                                className="mt-4"
                            />
                        </motion.div>

                        {/* Global Top Trainings */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaAward className="text-green-500 text-xl mr-2" />
                                <h3 className="font-semibold">Top 5 Pelatihan (Kecamatan)</h3>
                            </div>
                            <Pie data={globalTopTrainingsChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            <DataTable
                                columns={topItemsColumns}
                                data={globalData.top_global_trainings?.map(item => ({ name: item.training, count: item.count })) || []}
                                pagination
                                highlightOnHover
                                striped
                                className="mt-4"
                            />
                        </motion.div>

                        {/* Global Top Organizations */}
                        <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                            <div className="flex items-center mb-4">
                                <FaAward className="text-green-500 text-xl mr-2" />
                                <h3 className="font-semibold">Top 5 Organisasi (Kecamatan)</h3>
                            </div>
                            <Pie data={globalTopOrganizationsChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            <DataTable
                                columns={topItemsColumns}
                                data={globalData.top_global_organizations?.map(item => ({ name: item.organization, count: item.count })) || []}
                                pagination
                                highlightOnHover
                                striped
                                className="mt-4"
                            />
                        </motion.div>
                    </div>

                    {/* Tooltips for Global Metrics */}
                    <ReactTooltip id="global-data-completeness" place="top" effect="solid" />
                    <ReactTooltip id="global-training-participation" place="top" effect="solid" />
                    <ReactTooltip id="global-activity-rate" place="top" effect="solid" />
                </motion.div>
            ) : ""}

            {/* Village Cards */}
            <motion.div
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Desa</h2>
                {villages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {villages.map((item) => (
                            <motion.div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                                whileHover={{ scale: 1.05 }}
                            >
                                {/* Village Image */}
                                {/* {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name_bps || 'Desa'}
                                        className="w-full h-60 object-cover rounded-lg mb-4"
                                    />
                                ) : (
                                    <div className="w-full h-60 bg-green-50 flex items-center justify-center rounded-lg mb-4 group-hover:bg-green-900 transition-colors duration-300">
                                        <FaImage className="text-green-900 text-6xl group-hover:text-white transition-colors duration-300" />
                                    </div>
                                )} */}

                                {/* Village Info */}
                                <h2 className="text-xl font-semibold text-gray-800 mb-0">{item.name_bps || 'Nama tidak tersedia'}</h2>
                                <p className="text-gray-600 text-sm mb-3">{item.name_dagri || 'Nama DAGRI tidak tersedia'}</p>

                                {/* Stats */}
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <FaUserTie className="text-green-900 text-lg" />
                                        <div className="flex justify-between w-full">
                                            <p className="text-gray-600">Pejabat</p>
                                            <p className="text-gray-700 font-bold">{(item.officials_count || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FaCheckCircle className="text-green-900 text-lg" />
                                        <div className="flex justify-between w-full">
                                            <p className="text-gray-600">Kelengkapan Data</p>
                                            <p
                                                className="text-gray-700 font-bold"
                                                data-tooltip-id={`completeness-tooltip-${item.id}`}
                                                data-tooltip-content={item.calculation_basis?.data_completeness?.basis || 'Persentase pejabat dengan data lengkap'}
                                            >
                                                {(item.data_completeness || 0).toLocaleString('id-ID')}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FaUsers className="text-green-900 text-lg" />
                                        <div className="flex justify-between w-full">
                                            <p className="text-gray-600">Partisipasi Pelatihan</p>
                                            <p
                                                className="text-gray-700 font-bold"
                                                data-tooltip-id={`training-tooltip-${item.id}`}
                                                data-tooltip-content={item.calculation_basis?.training_participation?.basis || 'Persentase pejabat yang mengikuti pelatihan pemerintah'}
                                            >
                                                {(item.training_participation_rate || 0).toLocaleString('id-ID')}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FaUsers className="text-green-900 text-lg" />
                                        <div className="flex justify-between w-full">
                                            <p className="text-gray-600">Partisipasi Organisasi</p>
                                            <p
                                                className="text-gray-700 font-bold"
                                                data-tooltip-id={`organization-tooltip-${item.id}`}
                                                data-tooltip-content={item.calculation_basis?.organization_participation?.basis || 'Persentase pejabat yang mengikuti organisasi'}
                                            >
                                                {(item.organization_participation_rate || 0).toLocaleString('id-ID')}%
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
                                                data-tooltip-content={item.calculation_basis?.activity_rate?.basis || 'Persentase pejabat yang aktif (pelatihan atau organisasi)'}
                                            >
                                                {(item.activity_rate || 0).toLocaleString('id-ID')}% ({item.activity_level || 'Tidak diketahui'})
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tooltips */}
                                <ReactTooltip id={`completeness-tooltip-${item.id}`} place="top" effect="solid" />
                                <ReactTooltip id={`training-tooltip-${item.id}`} place="top" effect="solid" />
                                <ReactTooltip id={`organization-tooltip-${item.id}`} place="top" effect="solid" />
                                <ReactTooltip id={`activity-tooltip-${item.id}`} place="top" effect="solid" />

                                {/* View Details Button */}
                                <div className="flex justify-end mt-4">
                                    <motion.button
                                        onClick={() => openModal(item)}
                                        className="p-2 bg-green-900 text-white rounded-full hover:bg-green-700 transition-colors duration-300"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FaChartBar className="text-lg" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 text-center">Tidak ada data desa tersedia.</p>
                )}
            </motion.div>

            {/* Modal for Village-specific Analytics */}
            <Modal isOpen={modalIsOpen} onClose={closeModal}>
                {selectedItem && (
                    <div className="max-h-full overflow-y-auto space-y-8 p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Detail Statistik: {selectedItem.name_bps || 'Desa'}</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Status Distribution */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaUserTie className="text-blue-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Distribusi Status Pejabat</h3>
                                </div>
                                <Pie data={statusChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            </motion.div>

                            {/* Data Completeness */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaCheckCircle className="text-green-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Kelengkapan Data</h3>
                                </div>
                                <Pie data={completenessChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            </motion.div>

                            {/* Training Participation */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaUsers className="text-blue-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Partisipasi Pelatihan</h3>
                                </div>
                                <Pie data={trainingParticipationChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            </motion.div>

                            {/* Organization Participation */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaUsers className="text-blue-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Partisipasi Organisasi</h3>
                                </div>
                                <Pie data={organizationParticipationChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            </motion.div>

                            {/* Gender Distribution */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaUsers className="text-blue-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Distribusi Jenis Kelamin</h3>
                                </div>
                                <Pie data={genderChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            </motion.div>

                            {/* Education Distribution */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaAward className="text-green-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Distribusi Pendidikan</h3>
                                </div>
                                <Pie data={educationChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            </motion.div>

                            {/* Marital Status Distribution */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaUsers className="text-blue-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Distribusi Status Perkawinan</h3>
                                </div>
                                <Pie data={maritalStatusChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            </motion.div>

                            {/* Age Distribution */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaUsers className="text-blue-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Distribusi Usia</h3>
                                </div>
                                <Pie data={ageChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                            </motion.div>

                            {/* Top Officials by Training */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaTrophy className="text-yellow-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Top 10 Pejabat - Pelatihan</h3>
                                </div>
                                <Bar data={topOfficialsTrainingChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                                <DataTable
                                    columns={topOfficialsColumns}
                                    data={selectedItem.top_officials_by_training || []}
                                    pagination
                                    highlightOnHover
                                    striped
                                    className="mt-4"
                                />
                            </motion.div>

                            {/* Top Officials by Organization */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaTrophy className="text-yellow-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Top 10 Pejabat - Organisasi</h3>
                                </div>
                                <Bar data={topOfficialsOrganizationChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                                <DataTable
                                    columns={topOfficialsColumns}
                                    data={selectedItem.top_officials_by_organization || []}
                                    pagination
                                    highlightOnHover
                                    striped
                                    className="mt-4"
                                />
                            </motion.div>

                            {/* Top Positions by Training */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaMedal className="text-blue-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Top 5 Jabatan - Pelatihan</h3>
                                </div>
                                <Doughnut data={topPositionsTrainingChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                                <DataTable
                                    columns={topPositionsColumns}
                                    data={selectedItem.top_positions_by_training || []}
                                    pagination
                                    highlightOnHover
                                    striped
                                    className="mt-4"
                                />
                            </motion.div>

                            {/* Top Positions by Organization */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaMedal className="text-blue-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Top 5 Jabatan - Organisasi</h3>
                                </div>
                                <Doughnut data={topPositionsOrganizationChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                                <DataTable
                                    columns={topPositionsColumns}
                                    data={selectedItem.top_positions_by_organization || []}
                                    pagination
                                    highlightOnHover
                                    striped
                                    className="mt-4"
                                />
                            </motion.div>

                            {/* Top Trainings */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaAward className="text-green-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Top 3 Pelatihan</h3>
                                </div>
                                <Pie data={topTrainingsChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                                <DataTable
                                    columns={topItemsColumns}
                                    data={selectedItem.top_trainings?.map(item => ({ name: item.training, count: item.count })) || []}
                                    pagination
                                    highlightOnHover
                                    striped
                                    className="mt-4"
                                />
                            </motion.div>

                            {/* Top Organizations */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaAward className="text-green-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Top 3 Organisasi</h3>
                                </div>
                                <Pie data={topOrganizationsChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                                <DataTable
                                    columns={topItemsColumns}
                                    data={selectedItem.top_organizations?.map(item => ({ name: item.organization, count: item.count })) || []}
                                    pagination
                                    highlightOnHover
                                    striped
                                    className="mt-4"
                                />
                            </motion.div>

                            {/* Most Active Officials */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaTrophy className="text-yellow-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Pejabat Paling Aktif</h3>
                                    <p className="text-sm text-gray-600 ml-2" data-tooltip-id={`most-active-tooltip-${selectedItem.id}`} data-tooltip-content={selectedItem.calculation_basis?.most_active_officials?.basis || 'Berdasarkan jumlah pelatihan pemerintah'}>
                                        Berdasarkan jumlah pelatihan pemerintah
                                    </p>
                                </div>
                                <DataTable
                                    columns={officialsColumns}
                                    data={selectedItem.most_active_officials || []}
                                    pagination
                                    highlightOnHover
                                    striped
                                    className="mt-4"
                                    expandableRows
                                    expandableRowsComponent={officialsSubRow}
                                />
                                <ReactTooltip id={`most-active-tooltip-${selectedItem.id}`} place="top" effect="solid" />
                            </motion.div>

                            {/* Inactive Officials */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaUsers className="text-red-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Pejabat Tidak Aktif</h3>
                                    <p className="text-sm text-gray-600 ml-2" data-tooltip-id={`inactive-tooltip-${selectedItem.id}`} data-tooltip-content={selectedItem.calculation_basis?.inactive_officials?.basis || 'Tidak mengikuti pelatihan pemerintah'}>
                                        Tidak mengikuti pelatihan pemerintah
                                    </p>
                                </div>
                                <DataTable
                                    columns={officialsColumns}
                                    data={selectedItem.inactive_officials || []}
                                    pagination
                                    highlightOnHover
                                    striped
                                    className="mt-4"
                                    expandableRows
                                    expandableRowsComponent={officialsSubRow}
                                />
                                <ReactTooltip id={`inactive-tooltip-${selectedItem.id}`} place="top" effect="solid" />
                            </motion.div>

                            {/* All Officials List */}
                            <motion.div className="bg-white rounded-xl p-4 shadow-md col-span-2" whileHover={{ scale: 1.02 }}>
                                <div className="flex items-center mb-4">
                                    <FaUserTie className="text-blue-500 text-xl mr-2" />
                                    <h3 className="font-semibold">Daftar Semua Pejabat</h3>
                                </div>
                                <DataTable
                                    columns={officialsColumns}
                                    data={selectedItem.officials_list || []}
                                    pagination
                                    paginationPerPage={10}
                                    highlightOnHover
                                    striped
                                    expandableRows
                                    expandableRowsComponent={officialsSubRow}
                                    className="mt-4"
                                />
                            </motion.div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
