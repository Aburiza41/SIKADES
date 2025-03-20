import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import OrganizationList from "./Partials/Component/List";
import { HiUsers } from "react-icons/hi";
import Modal from "./Partials/Section/Modal";
import OrganizationPDF from "./Partials/Component/PDF";

// Ambil token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function Organization({ initialOrganizations, organizations }) {
    const { flash } = usePage().props;
    const [organizationsData, setOrganizationsData] = useState(initialOrganizations);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [newOrganization, setNewOrganization] = useState({
        official_id: "",
        organization_id: "",
        doc_scan: "",
        nama: "",
        posisi: "",
        keterangan: "",
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
            "/admin/organization",
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
                    setOrganizationsData(page.props.official_organizations); // Gunakan official_organizations
                    setLoading(false);
                },
                onError: () => {
                    Swal.fire("Error", "Failed to fetch data. Please try again.", "error");
                    setLoading(false);
                },
            }
        );
    };

    // Handle add organization
    const handleAdd = () => {
        setIsEdit(false);
        setIsViewMode(false);
        setIsModalOpen(true);
        setNewOrganization({
            official_id: "",
            organization_id: "",
            doc_scan: "",
            nama: "",
            posisi: "",
            keterangan: "",
        });
    };

    // Handle edit organization
    const handleEdit = (organization) => {
        setSelectedOrganization(organization); // Set data yang akan diedit
        setIsEdit(true); // Set mode edit
        setIsViewMode(false); // Nonaktifkan mode view
        setIsModalOpen(true); // Buka modal

        // Isi form dengan data organization yang dipilih
        setNewOrganization({
            official_id: organization.official_id,
            organization_id: organization.organization_id,
            doc_scan: organization.doc_scan,
            nama: organization.nama,
            posisi: organization.posisi,
            keterangan: organization.keterangan,
        });
    };

    // Handle view organization
    const handleView = (organization) => {
        setSelectedOrganization(organization); // Set data yang akan dilihat
        setIsEdit(false); // Nonaktifkan mode edit
        setIsViewMode(true); // Aktifkan mode view
        setIsModalOpen(true); // Buka modal
    };

    // Handle delete organization
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
                router.delete(`/admin/organization/${id}`, {
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

    // Handle print organization
    const handlePrint = (organization) => {
        const data = {
            nama: organization.nama,
            organization: organization.organization?.title || "-",
            posisi: organization.posisi,
            keterangan: organization.keterangan,
        };
        OrganizationPDF(data); // Panggil fungsi PDF dengan data organization
    };

    // Handle submit form (tambah/edit)
    const handleSubmit = (e) => {
        e.preventDefault();

        const url = isEdit ? `/admin/organization/${selectedOrganization.id}` : "/admin/organization";
        const method = isEdit ? "put" : "post";

        // Data yang akan dikirim ke backend
        const payload = {
            official_id: newOrganization.official_id,
            organization_id: newOrganization.organization_id,
            doc_scan: newOrganization.doc_scan,
            nama: newOrganization.nama,
            posisi: newOrganization.posisi,
            keterangan: newOrganization.keterangan,
        };

        router[method](url, payload, {
            headers: {
                'X-CSRF-TOKEN': csrfToken, // Sertakan token CSRF
            },
            onSuccess: () => {
                Swal.fire("Success", `Organization ${isEdit ? "updated" : "added"} successfully.`, "success");
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
        setSelectedOrganization(null); // Reset selected organization
        setNewOrganization({
            official_id: "",
            organization_id: "",
            doc_scan: "",
            nama: "",
            posisi: "",
            keterangan: "",
        }); // Reset form
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
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Add Organization
                </button>
                <OrganizationList
                    official_organizations={organizationsData}
                    organizations={organizations}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onPrint={handlePrint}
                />
            </div>

            {/* Modal untuk Tambah/Edit */}
            <Modal isOpen={isModalOpen && !isViewMode} onClose={handleCloseModal} title={isEdit ? "Edit Organization" : "Add Organization"}>
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Nama</label>
                            <input
                                type="text"
                                value={newOrganization.nama}
                                onChange={(e) => setNewOrganization({ ...newOrganization, nama: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Posisi</label>
                            <input
                                type="text"
                                value={newOrganization.posisi}
                                onChange={(e) => setNewOrganization({ ...newOrganization, posisi: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                            <textarea
                                value={newOrganization.keterangan}
                                onChange={(e) => setNewOrganization({ ...newOrganization, keterangan: e.target.value })}
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
            <Modal isOpen={isModalOpen && isViewMode} onClose={handleCloseModal} title="View Organization">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama</label>
                        <p className="mt-1 text-gray-900">{selectedOrganization?.nama}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Organization</label>
                        <p className="mt-1 text-gray-900">{selectedOrganization?.organization?.title || "-"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Posisi</label>
                        <p className="mt-1 text-gray-900">{selectedOrganization?.posisi}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                        <p className="mt-1 text-gray-900">{selectedOrganization?.keterangan}</p>
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
