import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import PositionList from "./Partials/Component/List";
import Modal from "./Partials/Section/Modal";
import { HiUsers, HiPlus } from "react-icons/hi";

// Ambil token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function Position({ positions, sort, search }) {
    const { flash } = usePage().props;
    const [positionsData, setPositionsData] = useState(positions);
    const [loading, setLoading] = useState(false);
    const [currentSort, setCurrentSort] = useState(sort || {});
    const [currentSearch, setCurrentSearch] = useState(search || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [parentPositions, setParentPositions] = useState([]);
    const [loadingParents, setLoadingParents] = useState(false);
    const [newPosition, setNewPosition] = useState({
        name: "",
        slug: "",
        description: "",
        min: 0,
        max: 1,
        level: 1,
        parent_id: "",
        keterangan: "",
    });

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) Swal.fire("Success", flash.success, "success");
        if (flash?.error) Swal.fire("Error", flash.error, "error");
    }, [flash]);

    // Fetch parent positions from API
    const fetchParentPositions = useCallback(async () => {
        setLoadingParents(true);
        try {
            const response = await fetch('/local/positions');
            if (!response.ok) {
                throw new Error('Failed to fetch positions');
            }
            const data = await response.json();

            // Filter out current position if in edit mode
            let filteredPositions = data.data || data || [];
            if (isEdit && selectedPosition) {
                filteredPositions = filteredPositions.filter(pos => pos.id !== selectedPosition.id);
            }

            // Filter positions with level less than 3 (sesuai dengan controller)
            filteredPositions = filteredPositions.filter(pos => pos.level < 3);

            setParentPositions(filteredPositions);
        } catch (error) {
            console.error('Error fetching parent positions:', error);
            Swal.fire("Error", "Gagal memuat data jabatan induk", "error");
        } finally {
            setLoadingParents(false);
        }
    }, [isEdit, selectedPosition]);

    // Fetch data from the server
    const fetchData = useCallback((params = {}) => {
        setLoading(true);
        router.get(
            "/admin/positions",
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
                    setPositionsData(page.props.positions);
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

    // Handle add position
    const handleAdd = async () => {
        setIsEdit(false);
        setIsViewMode(false);
        setIsModalOpen(true);
        setSelectedPosition(null);
        await fetchParentPositions();
        setNewPosition({
            name: "",
            slug: "",
            description: "",
            min: 0,
            max: 1,
            level: 1,
            parent_id: "",
            keterangan: "",
        });
    };

    // Handle edit position
    const handleEdit = async (position) => {
        setSelectedPosition(position);
        setIsEdit(true);
        setIsViewMode(false);
        setIsModalOpen(true);
        await fetchParentPositions();
        setNewPosition({
            name: position.name || "",
            slug: position.slug || "",
            description: position.description || "",
            min: position.min || 0,
            max: position.max || 1,
            level: position.level || 1,
            parent_id: position.parent_id || "",
            keterangan: position.keterangan || "",
        });
    };

    // Handle view position
    const handleView = (position) => {
        setSelectedPosition(position);
        setIsEdit(false);
        setIsViewMode(true);
        setIsModalOpen(true);
    };

    // Handle delete position
    const handleDelete = (id) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Jabatan ini akan dihapus permanen!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/positions/${id}`, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    onSuccess: () => {
                        Swal.fire("Terhapus!", "Jabatan berhasil dihapus.", "success");
                        fetchData({});
                    },
                    onError: () => {
                        Swal.fire("Error", "Terjadi kesalahan saat menghapus jabatan.", "error");
                    },
                });
            }
        });
    };

    // Handle submit form (tambah/edit)
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validasi min dan max
        if (parseInt(newPosition.min) >= parseInt(newPosition.max)) {
            Swal.fire("Error", "Nilai maksimal harus lebih besar dari nilai minimal", "error");
            return;
        }

        // Validasi level
        if (parseInt(newPosition.level) < 1 || parseInt(newPosition.level) > 99) {
            Swal.fire("Error", "Level harus antara 1 dan 99", "error");
            return;
        }

        const url = isEdit ? `/admin/positions/${selectedPosition.id}` : "/admin/positions";
        const method = isEdit ? "put" : "post";

        const payload = {
            name: newPosition.name,
            slug: newPosition.slug,
            description: newPosition.description,
            min: parseInt(newPosition.min),
            max: parseInt(newPosition.max),
            level: parseInt(newPosition.level),
            parent_id: newPosition.parent_id || null,
            keterangan: newPosition.keterangan,
        };

        router[method](url, payload, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
            onSuccess: () => {
                Swal.fire("Success", `Jabatan ${isEdit ? "diperbarui" : "ditambahkan"} berhasil.`, "success");
                setIsModalOpen(false);
                fetchData({});
            },
            onError: (errors) => {
                if (errors.errors) {
                    Swal.fire("Error", Object.values(errors.errors).join(", "), "error");
                } else {
                    Swal.fire("Error", "Terjadi kesalahan saat menyimpan data.", "error");
                }
            },
        });
    };

    // Handle close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setIsViewMode(false);
        setSelectedPosition(null);
        setNewPosition({
            name: "",
            slug: "",
            description: "",
            min: 0,
            max: 1,
            level: 1,
            parent_id: "",
            keterangan: "",
        });
    };

    // Generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
    };

    // Auto-generate slug when name changes
    useEffect(() => {
        if (!isEdit && newPosition.name && !newPosition.slug) {
            setNewPosition(prev => ({
                ...prev,
                slug: generateSlug(prev.name)
            }));
        }
    }, [newPosition.name, isEdit]);

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Jabatan
                    <p className="text-sm font-thin mt-1">Daftar Jabatan Pegawai</p>
                </div>
            }
            breadcrumb={[{ name: "Jabatan", path: "/admin/positions", active: true, icon: <HiUsers className="w-5 h-5 mr-3" /> }]}
        >
            <Head title="Jabatan" />

            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div></div>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <HiPlus className="w-4 h-4 mr-2" />
                        Tambah Jabatan
                    </button>
                </div>
                <PositionList
                    positions={positionsData}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            </div>

            {/* Modal untuk Tambah/Edit */}
            <Modal isOpen={isModalOpen && !isViewMode} onClose={handleCloseModal} title={isEdit ? "Edit Jabatan" : "Tambah Jabatan"}>
                <div className="p-4 max-h-96 overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Jabatan *</label>
                                <input
                                    type="text"
                                    value={newPosition.name}
                                    onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Slug *</label>
                                <input
                                    type="text"
                                    value={newPosition.slug}
                                    onChange={(e) => setNewPosition({ ...newPosition, slug: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Deskripsi *</label>
                            <input
                                type="text"
                                value={newPosition.description}
                                onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Minimal *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newPosition.min}
                                    onChange={(e) => setNewPosition({ ...newPosition, min: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Maksimal *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newPosition.max}
                                    onChange={(e) => setNewPosition({ ...newPosition, max: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Level *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={newPosition.level}
                                    onChange={(e) => setNewPosition({ ...newPosition, level: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jabatan Induk</label>
                                <select
                                    value={newPosition.parent_id}
                                    onChange={(e) => setNewPosition({ ...newPosition, parent_id: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    disabled={loadingParents}
                                >
                                    <option value="">-- Pilih Jabatan Induk --</option>
                                    {loadingParents ? (
                                        <option value="" disabled>Memuat data...</option>
                                    ) : (
                                        parentPositions.map((position) => (
                                            <option key={position.id} value={position.id}>
                                                {position.name} (Level {position.level})
                                            </option>
                                        ))
                                    )}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Hanya menampilkan jabatan dengan level kurang dari 3
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                                <input
                                    type="text"
                                    value={newPosition.keterangan}
                                    onChange={(e) => setNewPosition({ ...newPosition, keterangan: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                                disabled={loadingParents}
                            >
                                {isEdit ? "Update" : "Simpan"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal untuk View */}
            <Modal isOpen={isModalOpen && isViewMode} onClose={handleCloseModal} title="Detail Jabatan">
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Jabatan</label>
                            <p className="mt-1 text-gray-900">{selectedPosition?.name || "-"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Slug</label>
                            <p className="mt-1 text-gray-900">{selectedPosition?.slug || "-"}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <p className="mt-1 text-gray-900">{selectedPosition?.description || "-"}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Minimal</label>
                            <p className="mt-1 text-gray-900">{selectedPosition?.min || "0"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Maksimal</label>
                            <p className="mt-1 text-gray-900">{selectedPosition?.max || "0"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Level</label>
                            <p className="mt-1 text-gray-900">{selectedPosition?.level || "-"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jabatan Induk</label>
                            <p className="mt-1 text-gray-900">
                                {selectedPosition?.parent?.name || "-"}
                                {selectedPosition?.parent && ` (Level ${selectedPosition.parent.level})`}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                            <p className="mt-1 text-gray-900">{selectedPosition?.keterangan || "-"}</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
