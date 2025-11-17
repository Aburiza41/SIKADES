import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import OrganizationList from "./Partials/Component/List";
import { HiUsers, HiPlus } from "react-icons/hi";
import Modal from "./Partials/Section/Modal";

// Ambil token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function Organization({ organizations, sort, search }) {
    const { flash } = usePage().props;
    const [organizationsData, setOrganizationsData] = useState(organizations);
    const [loading, setLoading] = useState(false);
    const [currentSort, setCurrentSort] = useState(sort || {});
    const [currentSearch, setCurrentSearch] = useState(search || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [newOrganization, setNewOrganization] = useState({
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
            "/admin/organization",
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
                    setOrganizationsData(page.props.organizations);
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
    }, []);

    // Handle add organization
    const handleAdd = () => {
        setIsEdit(false);
        setIsViewMode(false);
        setIsModalOpen(true);
        setSelectedOrganization(null);
        setNewOrganization({
            title: "",
            description: "",
        });
    };

    // Handle edit organization
    const handleEdit = (organization) => {
        setSelectedOrganization(organization);
        setIsEdit(true);
        setIsViewMode(false);
        setIsModalOpen(true);
        setNewOrganization({
            title: organization.title || "",
            description: organization.description || "",
        });
    };

    // Handle view organization
    const handleView = (organization) => {
        setSelectedOrganization(organization);
        setIsEdit(false);
        setIsViewMode(true);
        setIsModalOpen(true);
    };

    // Handle delete organization
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
                router.delete(`/admin/organization/${id}`, {
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

        const url = isEdit ? `/admin/organization/${selectedOrganization.id}` : "/admin/organization";
        const method = isEdit ? "put" : "post";

        const payload = {
            title: newOrganization.title,
            description: newOrganization.description,
        };

        router[method](url, payload, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
            onSuccess: () => {
                Swal.fire("Success", `Organisasi ${isEdit ? "diperbarui" : "ditambahkan"} berhasil.`, "success");
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
        setSelectedOrganization(null);
        setNewOrganization({
            title: "",
            description: "",
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Organization
                    <p className="text-sm font-thin mt-1">Daftar Organisasi</p>
                </div>
            }
            breadcrumb={[{ name: "Organization", path: "/admin/organization", active: true, icon: <HiUsers className="w-5 h-5 mr-3" /> }]}
        >
            <Head title="Organization" />

            <div className="p-4">
                <button
                    onClick={handleAdd}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                >
                    <HiPlus className="mr-2" />
                    Tambah Organisasi
                </button>
                <OrganizationList
                    organizations={organizationsData}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            </div>

            {/* Modal untuk Tambah/Edit */}
            <Modal isOpen={isModalOpen && !isViewMode} onClose={handleCloseModal} title={isEdit ? "Edit Organisasi" : "Tambah Organisasi"}>
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Judul</label>
                            <input
                                type="text"
                                value={newOrganization.title}
                                onChange={(e) => setNewOrganization({ ...newOrganization, title: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                            <textarea
                                value={newOrganization.description}
                                onChange={(e) => setNewOrganization({ ...newOrganization, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                rows="3"
                            />
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
            <Modal isOpen={isModalOpen && isViewMode} onClose={handleCloseModal} title="Lihat Organisasi">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul</label>
                        <p className="mt-1 text-gray-900">{selectedOrganization?.title}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <p className="mt-1 text-gray-900">{selectedOrganization?.description || "-"}</p>
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
