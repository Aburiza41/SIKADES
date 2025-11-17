import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import TrainingList from "./Partials/Component/List";
import Modal from "./Partials/Section/Modal";
import { HiUsers, HiPlus } from "react-icons/hi";

// Ambil token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function Training({ trainings, sort, search }) {
    const { flash } = usePage().props;
    const [trainingsData, setTrainingsData] = useState(trainings);
    const [loading, setLoading] = useState(false);
    const [currentSort, setCurrentSort] = useState(sort || {});
    const [currentSearch, setCurrentSearch] = useState(search || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [newTraining, setNewTraining] = useState({
        title: "",
        description: "",
    });

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) Swal.fire("Success", flash.success, "success");
        if (flash?.error) Swal.fire("Error", flash.error, "error");
    }, [flash]);

    // Fetch data from the server
    const fetchData = useCallback((params = {}) => {
        setLoading(true);
        router.get(
            "/admin/training",
            {
                page: params.page || 1,
                per_page: params.perPage || 10,
                search: params.search || currentSearch,
                sort_field: params.sortField || currentSort.sort_field,
                sort_direction: params.sortDirection || currentSort.sort_direction,
            },
            {
                preserveState: true,
                replace: true,
                onSuccess: (page) => {
                    setTrainingsData(page.props.trainings);
                    setCurrentSort(page.props.sort || {});
                    setCurrentSearch(page.props.search || "");
                    setLoading(false);
                },
                onError: () => {
                    Swal.fire("Error", "Failed to fetch data. Please try again.", "error");
                    setLoading(false);
                },
            }
        );
    }, [currentSearch, currentSort]);

    // Handle add training
    const handleAdd = () => {
        setIsEdit(false);
        setIsViewMode(false);
        setIsModalOpen(true);
        setSelectedTraining(null);
        setNewTraining({
            title: "",
            description: "",
        });
    };

    // Handle edit training
    const handleEdit = (training) => {
        setSelectedTraining(training);
        setIsEdit(true);
        setIsViewMode(false);
        setIsModalOpen(true);
        setNewTraining({
            title: training.title || "",
            description: training.description || "",
        });
    };

    // Handle view training
    const handleView = (training) => {
        setSelectedTraining(training);
        setIsEdit(false);
        setIsViewMode(true);
        setIsModalOpen(true);
    };

    // Handle delete training
    const handleDelete = (id) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data ini akan dihapus permanen!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/training/${id}`, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    onSuccess: () => {
                        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
                        fetchData({});
                    },
                    onError: () => {
                        Swal.fire("Error", "Terjadi kesalahan saat menghapus data.", "error");
                    },
                });
            }
        });
    };

    // Handle submit form (tambah/edit)
    const handleSubmit = (e) => {
        e.preventDefault();

        const url = isEdit ? `/admin/training/${selectedTraining.id}` : "/admin/training";
        const method = isEdit ? "put" : "post";

        const payload = {
            title: newTraining.title,
            description: newTraining.description,
        };

        router[method](url, payload, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
            onSuccess: () => {
                Swal.fire("Success", `Pelatihan ${isEdit ? "diperbarui" : "ditambahkan"} berhasil.`, "success");
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
        setIsEdit(false);
        setIsViewMode(false);
        setSelectedTraining(null);
        setNewTraining({
            title: "",
            description: "",
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Pelatihan
                    <p className="text-sm font-thin mt-1">Daftar Pelatihan Pegawai</p>
                </div>
            }
            breadcrumb={[{ name: "Pelatihan", path: "/admin/training", active: true, icon: <HiUsers className="w-5 h-5 mr-3" /> }]}
        >
            <Head title="Pelatihan" />

            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div></div>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <HiPlus className="w-4 h-4 mr-2" />
                        Tambah Pelatihan
                    </button>
                </div>
                <TrainingList
                    trainings={trainingsData}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            </div>

            {/* Modal untuk Tambah/Edit */}
            <Modal isOpen={isModalOpen && !isViewMode} onClose={handleCloseModal} title={isEdit ? "Edit Pelatihan" : "Tambah Pelatihan"}>
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Judul Pelatihan</label>
                            <input
                                type="text"
                                value={newTraining.title}
                                onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                            <textarea
                                value={newTraining.description}
                                onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                {isEdit ? "Update" : "Simpan"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal untuk View */}
            <Modal isOpen={isModalOpen && isViewMode} onClose={handleCloseModal} title="Detail Pelatihan">
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul Pelatihan</label>
                        <p className="mt-1 text-gray-900">{selectedTraining?.title || "-"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <p className="mt-1 text-gray-900">{selectedTraining?.description || "-"}</p>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
