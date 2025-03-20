import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import TrainingList from "./Partials/Component/List";
import { HiUsers } from "react-icons/hi";
import Modal from "./Partials/Section/Modal";
import TrainingPDF from "./Partials/Component/PDF";

// Ambil token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function Training({ initialTrainings, trainings }) {
    const { flash } = usePage().props;
    const [trainingsData, setTrainingsData] = useState(initialTrainings);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [newTraining, setNewTraining] = useState({
        official_id: "",
        training_id: "",
        doc_scan: "",
        nama: "",
        keterangan: "",
        mulai: "",
        selesai: "",
    });

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) Swal.fire("Success", flash.success, "success");
        if (flash?.error) Swal.fire("Error", flash.error, "error");
    }, [flash]);

    // Fetch data from the server
    const fetchData = ({
        page = 1,
        perPage = 10,
        search = "",
        filters = "",
        sortField = "",
        sortDirection = ""
    }) => {
        setLoading(true);
        router.get(
            "/admin/training",
            {
                page,
                per_page: perPage,
                search,
                filters,
                sort_field: sortField,
                sort_direction: sortDirection,
            },
            {
                preserveState: true,
                replace: true,
                onSuccess: (page) => {
                    setTrainingsData(page.props.official_trainings); // Gunakan official_trainings
                    setLoading(false);
                },
                onError: () => {
                    Swal.fire("Error", "Failed to fetch data. Please try again.", "error");
                    setLoading(false);
                },
            }
        );
    };

    // Handle add training
    const handleAdd = () => {
        setIsEdit(false);
        setIsViewMode(false);
        setIsModalOpen(true);
        setNewTraining({
            official_id: "",
            training_id: "",
            doc_scan: "",
            nama: "",
            keterangan: "",
            mulai: "",
            selesai: "",
        });
    };

    // Handle edit training
    const handleEdit = (training) => {
        setSelectedTraining(training); // Set data yang akan diedit
        setIsEdit(true); // Set mode edit
        setIsViewMode(false); // Nonaktifkan mode view
        setIsModalOpen(true); // Buka modal

        // Isi form dengan data training yang dipilih
        setNewTraining({
            official_id: training.official_id,
            training_id: training.training_id,
            doc_scan: training.doc_scan,
            nama: training.nama,
            keterangan: training.keterangan,
            mulai: training.mulai,
            selesai: training.selesai,
        });
    };

    // Handle view training
    const handleView = (training) => {
        setSelectedTraining(training); // Set data yang akan dilihat
        setIsEdit(false); // Nonaktifkan mode edit
        setIsViewMode(true); // Aktifkan mode view
        setIsModalOpen(true); // Buka modal
    };

    // Handle delete training
    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This data will be deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/training/${id}`, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken, // Sertakan token CSRF
                    },
                    onSuccess: () => {
                        Swal.fire("Deleted!", "Data has been successfully deleted.", "success");
                        fetchData({}); // Refresh data setelah penghapusan
                    },
                    onError: () => {
                        Swal.fire("Error", "An error occurred while deleting the data.", "error");
                    },
                });
            }
        });
    };

    // Handle print training
    const handlePrint = (training) => {
        const data = {
            nama: training.nama,
            training: training.training?.title || "-",
            mulai: training.mulai,
            selesai: training.selesai,
            keterangan: training.keterangan,
        };
        TrainingPDF(data); // Panggil fungsi PDF dengan data training
    };

    // Handle submit form (tambah/edit)
    const handleSubmit = (e) => {
        e.preventDefault();

        const url = isEdit ? `/admin/training/${selectedTraining.id}` : "/admin/training";
        const method = isEdit ? "put" : "post";

        // Data yang akan dikirim ke backend
        const payload = {
            official_id: newTraining.official_id,
            training_id: newTraining.training_id,
            doc_scan: newTraining.doc_scan,
            nama: newTraining.nama,
            keterangan: newTraining.keterangan,
            mulai: newTraining.mulai,
            selesai: newTraining.selesai,
        };

        router[method](url, payload, {
            headers: {
                'X-CSRF-TOKEN': csrfToken, // Sertakan token CSRF
            },
            onSuccess: () => {
                Swal.fire("Success", `Training ${isEdit ? "updated" : "added"} successfully.`, "success");
                setIsModalOpen(false);
                fetchData({});
            },
            onError: (errors) => {
                Swal.fire("Error", Object.values(errors).join(", "), "error");
            },
        });
    };

    // Handle close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEdit(false); // Reset mode edit
        setIsViewMode(false); // Reset mode view
        setSelectedTraining(null); // Reset selected training
        setNewTraining({
            official_id: "",
            training_id: "",
            doc_scan: "",
            nama: "",
            keterangan: "",
            mulai: "",
            selesai: "",
        }); // Reset form
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Training
                    <p className="text-sm font-thin mt-1">Daftar Pelatihan</p>
                </div>
            }
            breadcrumb={[{ name: "Training", path: "/admin/training", active: true, icon: <HiUsers className="w-5 h-5 mr-3" /> }]}
        >
            <Head title="Training" />

            <div className="p-4">
                <button
                    onClick={handleAdd}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Add Training
                </button>
                <TrainingList
                    official_trainings={trainingsData}
                    trainings={trainings}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onPrint={handlePrint}
                />
            </div>

            {/* Modal untuk Tambah/Edit */}
            <Modal isOpen={isModalOpen && !isViewMode} onClose={handleCloseModal} title={isEdit ? "Edit Training" : "Add Training"}>
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Nama</label>
                            <input
                                type="text"
                                value={newTraining.nama}
                                onChange={(e) => setNewTraining({ ...newTraining, nama: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Mulai</label>
                            <input
                                type="date"
                                value={newTraining.mulai}
                                onChange={(e) => setNewTraining({ ...newTraining, mulai: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Selesai</label>
                            <input
                                type="date"
                                value={newTraining.selesai}
                                onChange={(e) => setNewTraining({ ...newTraining, selesai: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                            <textarea
                                value={newTraining.keterangan}
                                onChange={(e) => setNewTraining({ ...newTraining, keterangan: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                {isEdit ? "Update" : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal untuk View */}
            <Modal isOpen={isModalOpen && isViewMode} onClose={handleCloseModal} title="View Training">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama</label>
                        <p className="mt-1 text-gray-900">{selectedTraining?.nama}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Training</label>
                        <p className="mt-1 text-gray-900">{selectedTraining?.training?.title || "-"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mulai</label>
                        <p className="mt-1 text-gray-900">{selectedTraining?.mulai}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Selesai</label>
                        <p className="mt-1 text-gray-900">{selectedTraining?.selesai}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                        <p className="mt-1 text-gray-900">{selectedTraining?.keterangan}</p>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
