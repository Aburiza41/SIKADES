import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Chart } from "chart.js";
import { FaTimes, FaChartBar, FaTable, FaMapMarkerAlt, FaInfoCircle, FaUserTie } from "react-icons/fa";
import DataTable from "react-data-table-component";
import axios from "axios";

Chart.register(...registerables);

const ModalComponent = ({ isModalOpen, closeModal, item }) => {
    const [modalData, setModalData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Ambil data detail saat modal dibuka
    useEffect(() => {
        if (isModalOpen && item) {
            setIsLoading(true);
            axios
                .get(`/profile-village/${item.type}/${item.code}`) // Sesuaikan dengan endpoint API Anda
                .then((response) => {
                    setModalData(response.data);
                })
                .catch((error) => {
                    console.error("Gagal mengambil data detail:", error);
                })
                .finally(() => setIsLoading(false));
        }
    }, [isModalOpen, item]);

    // Render grafik saat modalData tersedia
    useEffect(() => {
        if (modalData) {
            renderCharts(modalData);
        }
    }, [modalData]);

    // Fungsi untuk menggambar grafik
    const renderCharts = (data) => {
        // Grafik Pendidikan
        const educationCtx = document.getElementById("educationChart").getContext("2d");
        new Chart(educationCtx, {
            type: "bar",
            data: {
                labels: Object.keys(data.education_totals),
                datasets: [
                    {
                        label: "Jumlah Perangkat Desa",
                        data: Object.values(data.education_totals),
                        backgroundColor: "rgba(153, 102, 255, 0.2)",
                        borderColor: "rgba(153, 102, 255, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

        // Grafik Jenis Kelamin
        const genderCtx = document.getElementById("genderChart").getContext("2d");
        new Chart(genderCtx, {
            type: "pie",
            data: {
                labels: Object.keys(data.gender_totals).map((g) => (g === "L" ? "Laki-laki" : "Perempuan")),
                datasets: [
                    {
                        label: "Jumlah Perangkat Desa",
                        data: Object.values(data.gender_totals),
                        backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"],
                        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    };

    const educationColumns = [
        { name: "Pendidikan", selector: (row) => row.category, sortable: true },
        { name: "Jumlah", selector: (row) => row.total, sortable: true },
    ];

    const genderColumns = [
        { name: "Jenis Kelamin", selector: (row) => row.category, sortable: true },
        { name: "Jumlah", selector: (row) => row.total, sortable: true },
    ];

    const educationData = modalData
        ? Object.entries(modalData.education_totals).map(([education, total]) => ({
              category: education,
              total: total,
          }))
        : [];

    const genderData = modalData
        ? Object.entries(modalData.gender_totals).map(([gender, total]) => ({
              category: gender === "L" ? "Laki-laki" : "Perempuan",
              total: total,
          }))
        : [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-start justify-center pt-20 shadow-lg"
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="bg-white p-6 rounded-lg w-full max-w-5xl max-h-[80vh]"
            >
                {/* Header Modal */}
                <div className="flex justify-between items-center mb-3 px-5">
                    <h3 className="text-2xl font-bold">Profil {modalData?.name_bps || "Loading..."}</h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700 transition-all duration-300"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <FaSpinner className="animate-spin text-2xl text-green-600" />
                    </div>
                ) : (
                    <div className="max-h-[65vh] overflow-y-auto p-5">
                        {/* Konten modal */}
                        {modalData && (
                            <>
                                {/* Informasi Umum */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-md">
                                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                            <FaMapMarkerAlt /> Lokasi
                                        </h4>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Nama Dagri:</span> {modalData.name_dagri}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Nama BPS:</span> {modalData.name_bps}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Kode BPS:</span> {modalData.code_bps}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Kode Dagri:</span> {modalData.code_dagri}
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-md">
                                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                            <FaInfoCircle /> Informasi Umum
                                        </h4>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Total Kecamatan:</span>{" "}
                                            {modalData.total_districts}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Total Desa:</span> {modalData.total_villages}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Total Pejabat:</span>{" "}
                                            {modalData.total_officials}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Dibuat Pada:</span>{" "}
                                            {new Date(modalData.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Diperbarui Pada:</span>{" "}
                                            {new Date(modalData.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Grafik dan Tabel */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg">
                                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                            <FaChartBar /> Pendidikan
                                        </h4>
                                        <div className="h-48">
                                            <canvas id="educationChart"></canvas>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:border-purple-300 shadow-md hover:shadow-lg">
                                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                            <FaChartBar /> Jenis Kelamin
                                        </h4>
                                        <div className="h-48">
                                            <canvas id="genderChart"></canvas>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabel */}
                                <div className="grid grid-cols-1 gap-6 mt-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg">
                                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                            <FaTable /> Pendidikan
                                        </h4>
                                        <DataTable
                                            columns={educationColumns}
                                            data={educationData}
                                            pagination
                                            highlightOnHover
                                            responsive
                                        />
                                    </div>

                                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:border-purple-300 shadow-md hover:shadow-lg">
                                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                            <FaTable /> Jenis Kelamin
                                        </h4>
                                        <DataTable
                                            columns={genderColumns}
                                            data={genderData}
                                            pagination
                                            highlightOnHover
                                            responsive
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ModalComponent;