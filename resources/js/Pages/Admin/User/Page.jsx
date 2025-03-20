import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import UserList from "./Partials/Component/List";
import { HiUsers, HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import Model from "./Model/Model";
import PDF from "./Partials/Component/PDF";
import Modal from "./Partials/Section/Modal";
import Select from "react-select";

// Ambil token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

export default function User({ initialUsers, regencies, districts, villages }) {
    const { flash } = usePage().props;
    const [users, setUsers] = useState(initialUsers);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        role: "admin",
        regency_id: "",
        district_id: "",
        village_id: "",
    });

    // Handle flash messages
    useEffect(() => {
        if (flash.success) Swal.fire("Success", flash.success, "success");
        if (flash.error) Swal.fire("Error", flash.error, "error");
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
            "/admin/user",
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
                    setUsers(page.props.initialUsers);
                    setLoading(false);
                },
                onError: () => {
                    Swal.fire("Error", "Failed to fetch data. Please try again.", "error");
                    setLoading(false);
                },
            }
        );
    };

    // Handle add user
    const handleAdd = () => {
        setIsEdit(false);
        setIsViewMode(false);
        setIsModalOpen(true);
        setNewUser({
            name: "",
            email: "",
            role: "admin",
            regency_id: "",
            district_id: "",
            village_id: "",
        });
    };

    // Handle edit user
    const handleEdit = (user) => {
        setSelectedUser(user); // Set data yang akan diedit
        setIsEdit(true); // Set mode edit
        setIsViewMode(false); // Nonaktifkan mode view
        setIsModalOpen(true); // Buka modal

        // Isi form dengan data user yang dipilih
        setNewUser({
            name: user.name,
            email: user.email,
            role: user.role,
            regency_id: user.user_regency?.regency_id || "",
            district_id: user.user_district?.district_id || "",
            village_id: user.user_village?.village_id || "",
        });
    };

    // Handle view user
    const handleView = (user) => {
        setSelectedUser(user); // Set data yang akan dilihat
        setIsEdit(false); // Nonaktifkan mode edit
        setIsViewMode(true); // Aktifkan mode view
        setIsModalOpen(true); // Buka modal
    };

    // Handle delete user
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
                router.delete(`/admin/user/${id}`, {
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

    // Handle print user
    const handlePrint = (user) => {
        PDF(user); // Panggil fungsi PDF dengan data pengguna
    };

    // Handle submit form (tambah/edit)
    const handleSubmit = (e) => {
        e.preventDefault();

        const url = isEdit ? `/admin/user/${selectedUser.id}` : "/admin/user";
        const method = isEdit ? "put" : "post";

        router[method](url, newUser, {
            headers: {
                'X-CSRF-TOKEN': csrfToken, // Sertakan token CSRF
            },
            onSuccess: () => {
                Swal.fire("Success", `User ${isEdit ? "updated" : "added"} successfully.`, "success");
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
        setSelectedUser(null); // Reset selected user
        setNewUser({
            name: "",
            email: "",
            role: "admin",
            regency_id: "",
            district_id: "",
            village_id: "",
        }); // Reset form
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Users
                    <p className="text-sm font-thin mt-1">Daftar Pengguna</p>
                </div>
            }
            breadcrumb={[{ name: "Users", path: "/admin/users", active: true, icon: <HiUsers className="w-5 h-5 mr-3" /> }]}
        >
            <Head title="Users" />

            <div className="p-4">
                <button
                    onClick={handleAdd}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Add User
                </button>
                <UserList
                    users={users}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onPrint={handlePrint}
                />
            </div>

            {/* Modal untuk Tambah/Edit */}
            <Modal isOpen={isModalOpen && !isViewMode} onClose={handleCloseModal} title={isEdit ? "Edit User" : "Add User"}>
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            >
                                <option value="admin">Admin</option>
                                <option value="regency">Regency</option>
                                <option value="district">District</option>
                                <option value="village">Village</option>
                            </select>
                        </div>

                        {/* Tampilkan select berdasarkan role */}
                        {newUser.role === "regency" && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Regency</label>
                                <Select
                                    options={regencies.map((regency) => ({
                                        value: regency.id,
                                        label: regency.name_bps,
                                    }))}
                                    value={
                                        newUser.regency_id
                                            ? { value: newUser.regency_id, label: regencies.find((r) => r.id === newUser.regency_id)?.name_bps }
                                            : null
                                    }
                                    onChange={(selectedOption) =>
                                        setNewUser({ ...newUser, regency_id: selectedOption ? selectedOption.value : "" })
                                    }
                                    placeholder="Pilih Regency"
                                    isSearchable // Aktifkan fitur pencarian
                                />
                            </div>
                        )}

                        {newUser.role === "district" && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">District</label>
                                <Select
                                    options={districts.map((district) => ({
                                        value: district.id,
                                        label: district.name_bps,
                                    }))}
                                    value={
                                        newUser.district_id
                                            ? { value: newUser.district_id, label: districts.find((d) => d.id === newUser.district_id)?.name_bps }
                                            : null
                                    }
                                    onChange={(selectedOption) =>
                                        setNewUser({ ...newUser, district_id: selectedOption ? selectedOption.value : "" })
                                    }
                                    placeholder="Pilih District"
                                    isSearchable // Aktifkan fitur pencarian
                                />
                            </div>
                        )}

                        {newUser.role === "village" && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Village</label>
                                <Select
                                    options={villages.map((village) => ({
                                        value: village.id,
                                        label: village.name_bps,
                                    }))}
                                    value={
                                        newUser.village_id
                                            ? { value: newUser.village_id, label: villages.find((v) => v.id === newUser.village_id)?.name_bps }
                                            : null
                                    }
                                    onChange={(selectedOption) =>
                                        setNewUser({ ...newUser, village_id: selectedOption ? selectedOption.value : "" })
                                    }
                                    placeholder="Pilih Village"
                                    isSearchable // Aktifkan fitur pencarian
                                />
                            </div>
                        )}

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
            <Modal isOpen={isModalOpen && isViewMode} onClose={handleCloseModal} title="View User">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-gray-900">{selectedUser?.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-gray-900">{selectedUser?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <p className="mt-1 text-gray-900">{selectedUser?.role}</p>
                    </div>

                    {/* Tampilkan daerah berdasarkan role */}
                    {selectedUser?.role === "regency" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Regency</label>
                            <p className="mt-1 text-gray-900">
                                {selectedUser?.user_regency?.regency?.name_bps || "N/A"}
                            </p>
                        </div>
                    )}

                    {selectedUser?.role === "district" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">District</label>
                            <p className="mt-1 text-gray-900">
                                {selectedUser?.user_district?.district?.name_bps || "N/A"}
                            </p>
                        </div>
                    )}

                    {selectedUser?.role === "village" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Village</label>
                            <p className="mt-1 text-gray-900">
                                {selectedUser?.user_village?.village?.name_bps || "N/A"}
                            </p>
                        </div>
                    )}

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
