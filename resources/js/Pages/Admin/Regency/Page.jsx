import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import RegencyList from "./Partials/Component/List";
import { HiMap } from "react-icons/hi";
import Modal from "./Partials/Section/Modal";

// Ambil token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function Regency({ initialRegencies }) {
    const { flash } = usePage().props;
    const [regenciesData, setRegenciesData] = useState(initialRegencies);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedRegency, setSelectedRegency] = useState(null);
    const [newRegency, setNewRegency] = useState({
        code_bps: "",
        name_bps: "",
        code_dagri: "",
        name_dagri: "",
        active: false,
        code: "",
    });
    const [errors, setErrors] = useState({});

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
        sortField = "",
        sortDirection = ""
    }) => {
        setLoading(true);
        router.get(
            "/admin/regency",
            {
                page,
                per_page: perPage,
                search,
                sort_field: sortField,
                sort_direction: sortDirection,
            },
            {
                preserveState: true,
                replace: true,
                onSuccess: (page) => {
                    setRegenciesData(page.props.initialRegencies);
                    setLoading(false);
                },
                onError: () => {
                    Swal.fire("Error", "Failed to fetch data. Please try again.", "error");
                    setLoading(false);
                },
            }
        );
    };

    // Handle add regency
    const handleAdd = () => {
        setIsEdit(false);
        setIsViewMode(false);
        setIsModalOpen(true);
        setErrors({});
        setNewRegency({
            code_bps: "",
            name_bps: "",
            code_dagri: "",
            name_dagri: "",
            active: false,
            code: "",
        });
    };

    // Handle edit regency
    const handleEdit = (regency) => {
        setSelectedRegency(regency);
        setIsEdit(true);
        setIsViewMode(false);
        setIsModalOpen(true);
        setErrors({});
        setNewRegency({
            code_bps: regency.code_bps,
            name_bps: regency.name_bps,
            code_dagri: regency.code_dagri,
            name_dagri: regency.name_dagri,
            active: regency.active,
            code: regency.code,
        });
    };

    // Handle view regency
    const handleView = (regency) => {
        setSelectedRegency(regency);
        setIsEdit(false);
        setIsViewMode(true);
        setIsModalOpen(true);
    };

    // Handle delete regency
    const handleDelete = (id) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data kabupaten/kota ini akan dihapus!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/regency/${id}`, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    onSuccess: () => {
                        Swal.fire("Terhapus!", "Kabupaten/kota berhasil dihapus.", "success");
                        fetchData({});
                    },
                    onError: (errors) => {
                        Swal.fire("Error", errors.error || "Terjadi kesalahan saat menghapus data.", "error");
                    },
                });
            }
        });
    };

    // Validate form input
    const validateForm = () => {
        const newErrors = {};
        if (!newRegency.code_bps) newErrors.code_bps = "Code BPS wajib diisi.";
        if (!newRegency.name_bps) newErrors.name_bps = "Name BPS wajib diisi.";
        if (!newRegency.code_dagri) newErrors.code_dagri = "Code DAGRI wajib diisi.";
        if (!newRegency.name_dagri) newErrors.name_dagri = "Name DAGRI wajib diisi.";
        if (!newRegency.code) newErrors.code = "Code wajib diisi.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit form (tambah/edit)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Swal.fire("Error", "Harap isi semua kolom yang wajib.", "error");
            return;
        }

        const url = isEdit ? `/admin/regency/${selectedRegency.id}` : "/admin/regency";
        const method = isEdit ? "put" : "post";

        const payload = {
            code_bps: newRegency.code_bps,
            name_bps: newRegency.name_bps,
            code_dagri: newRegency.code_dagri,
            name_dagri: newRegency.name_dagri,
            active: newRegency.active,
            code: newRegency.code,
        };

        router[method](url, payload, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
            onSuccess: () => {
                Swal.fire("Success", `Kabupaten/kota ${isEdit ? "diperbarui" : "ditambahkan"} berhasil.`, "success");
                setIsModalOpen(false);
                setErrors({});
                fetchData({});
            },
            onError: (errors) => {
                setErrors(errors);
                Swal.fire("Error", Object.values(errors).join(", "), "error");
            },
        });
    };

    // Handle close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setIsViewMode(false);
        setSelectedRegency(null);
        setErrors({});
        setNewRegency({
            code_bps: "",
            name_bps: "",
            code_dagri: "",
            name_dagri: "",
            active: false,
            code: "",
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Regency
                    <p className="text-sm font-thin mt-1">Daftar Kabupaten/Kota</p>
                </div>
            }
            breadcrumb={[{ name: "Regency", path: "/admin/regency", active: true, icon: <HiMap className="w-5 h-5 mr-3" /> }]}
        >
            <Head title="Regency" />

            <div className="p-4">
                <button
                    onClick={handleAdd}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Tambah Kabupaten/Kota
                </button>
                <RegencyList
                    regencies={regenciesData}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            </div>

            {/* Modal untuk Tambah/Edit */}
            <Modal isOpen={isModalOpen && !isViewMode} onClose={handleCloseModal} title={isEdit ? "Ubah Kabupaten/Kota" : "Tambah Kabupaten/Kota"}>
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Code BPS</label>
                            <input
                                type="text"
                                value={newRegency.code_bps}
                                onChange={(e) => setNewRegency({ ...newRegency, code_bps: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.code_bps ? 'border-red-500' : ''}`}
                            />
                            {errors.code_bps && <p className="text-red-500 text-sm mt-1">{errors.code_bps}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name BPS</label>
                            <input
                                type="text"
                                value={newRegency.name_bps}
                                onChange={(e) => setNewRegency({ ...newRegency, name_bps: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.name_bps ? 'border-red-500' : ''}`}
                            />
                            {errors.name_bps && <p className="text-red-500 text-sm mt-1">{errors.name_bps}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Code DAGRI</label>
                            <input
                                type="text"
                                value={newRegency.code_dagri}
                                onChange={(e) => setNewRegency({ ...newRegency, code_dagri: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.code_dagri ? 'border-red-500' : ''}`}
                            />
                            {errors.code_dagri && <p className="text-red-500 text-sm mt-1">{errors.code_dagri}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name DAGRI</label>
                            <input
                                type="text"
                                value={newRegency.name_dagri}
                                onChange={(e) => setNewRegency({ ...newRegency, name_dagri: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.name_dagri ? 'border-red-500' : ''}`}
                            />
                            {errors.name_dagri && <p className="text-red-500 text-sm mt-1">{errors.name_dagri}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Active</label>
                            <input
                                type="checkbox"
                                checked={newRegency.active}
                                onChange={(e) => setNewRegency({ ...newRegency, active: e.target.checked })}
                                className="mt-1 rounded border-gray-300"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Code</label>
                            <input
                                type="text"
                                value={newRegency.code}
                                onChange={(e) => setNewRegency({ ...newRegency, code: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.code ? 'border-red-500' : ''}`}
                            />
                            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                {isEdit ? "Perbarui" : "Simpan"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal untuk View */}
            <Modal isOpen={isModalOpen && isViewMode} onClose={handleCloseModal} title="Lihat Kabupaten/Kota">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code BPS</label>
                        <p className="mt-1 text-gray-900">{selectedRegency?.code_bps}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name BPS</label>
                        <p className="mt-1 text-gray-900">{selectedRegency?.name_bps}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code DAGRI</label>
                        <p className="mt-1 text-gray-900">{selectedRegency?.code_dagri}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name DAGRI</label>
                        <p className="mt-1 text-gray-900">{selectedRegency?.name_dagri}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Active</label>
                        <p className="mt-1 text-gray-900">{selectedRegency?.active ? "Ya" : "Tidak"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <p className="mt-1 text-gray-900">{selectedRegency?.code}</p>
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
