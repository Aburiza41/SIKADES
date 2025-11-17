import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import DistrictList from "./Partials/Component/List";
import { HiMap } from "react-icons/hi";
import Modal from "./Partials/Section/Modal";
import Select from "react-select";

// Ambil token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function District({ initialDistricts, regencies }) {
    const { flash } = usePage().props;
    const [districtsData, setDistrictsData] = useState(initialDistricts);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedRegency, setSelectedRegency] = useState(null);
    const [newDistrict, setNewDistrict] = useState({
        regency_id: "",
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
        sortDirection = "",
        regency_id = ""
    }) => {
        setLoading(true);
        router.get(
            "/admin/district",
            {
                page,
                per_page: perPage,
                search,
                sort_field: sortField,
                sort_direction: sortDirection,
                regency_id: regency_id,
            },
            {
                preserveState: true,
                replace: true,
                onSuccess: (page) => {
                    setDistrictsData(page.props.initialDistricts);
                    setLoading(false);
                },
                onError: () => {
                    Swal.fire("Error", "Gagal mengambil data. Silakan coba lagi.", "error");
                    setLoading(false);
                },
            }
        );
    };

    // Handle add district
    const handleAdd = () => {
        setIsEdit(false);
        setIsViewMode(false);
        setIsModalOpen(true);
        setErrors({});
        setNewDistrict({
            regency_id: "",
            code_bps: "",
            name_bps: "",
            code_dagri: "",
            name_dagri: "",
            active: false,
            code: "",
        });
    };

    // Handle edit district
    const handleEdit = (district) => {
        setSelectedDistrict(district);
        setIsEdit(true);
        setIsViewMode(false);
        setIsModalOpen(true);
        setErrors({});
        setNewDistrict({
            regency_id: district.regency_id,
            code_bps: district.code_bps,
            name_bps: district.name_bps,
            code_dagri: district.code_dagri,
            name_dagri: district.name_dagri,
            active: district.active,
            code: district.code,
        });
    };

    // Handle view district
    const handleView = (district) => {
        setSelectedDistrict(district);
        setIsEdit(false);
        setIsViewMode(true);
        setIsModalOpen(true);
    };

    // Handle delete district
    const handleDelete = (id) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data kecamatan ini akan dihapus!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/district/${id}`, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    onSuccess: () => {
                        Swal.fire("Terhapus!", "Kecamatan berhasil dihapus.", "success");
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
        if (!newDistrict.regency_id) newErrors.regency_id = "Kabupaten wajib dipilih.";
        if (!newDistrict.code_bps) newErrors.code_bps = "Code BPS wajib diisi.";
        if (!newDistrict.name_bps) newErrors.name_bps = "Name BPS wajib diisi.";
        if (!newDistrict.code_dagri) newErrors.code_dagri = "Code DAGRI wajib diisi.";
        if (!newDistrict.name_dagri) newErrors.name_dagri = "Name DAGRI wajib diisi.";
        if (!newDistrict.code) newErrors.code = "Code wajib diisi.";
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

        const url = isEdit ? `/admin/district/${selectedDistrict.id}` : "/admin/district";
        const method = isEdit ? "put" : "post";

        const payload = {
            regency_id: newDistrict.regency_id,
            code_bps: newDistrict.code_bps,
            name_bps: newDistrict.name_bps,
            code_dagri: newDistrict.code_dagri,
            name_dagri: newDistrict.name_dagri,
            active: newDistrict.active,
            code: newDistrict.code,
        };

        router[method](url, payload, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
            onSuccess: () => {
                Swal.fire("Success", `Kecamatan ${isEdit ? "diperbarui" : "ditambahkan"} berhasil.`, "success");
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
        setSelectedDistrict(null);
        setErrors({});
        setNewDistrict({
            regency_id: "",
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
                    Kecamatan
                    <p className="text-sm font-thin mt-1">Daftar Kecamatan</p>
                </div>
            }
            breadcrumb={[{ name: "Kecamatan", path: "/admin/district", active: true, icon: <HiMap className="w-5 h-5 mr-3" /> }]}
        >
            <Head title="Kecamatan" />

            <div className="p-4">
                <button
                    onClick={handleAdd}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Tambah Kecamatan
                </button>
                <DistrictList
                    districts={districtsData}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    regencies={regencies}
                    selectedRegency={selectedRegency}
                    setSelectedRegency={setSelectedRegency}
                />
            </div>

            {/* Modal untuk Tambah/Edit */}
            <Modal isOpen={isModalOpen && !isViewMode} onClose={handleCloseModal} title={isEdit ? "Ubah Kecamatan" : "Tambah Kecamatan"}>
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Kabupaten</label>
                            <select
                                value={newDistrict.regency_id}
                                onChange={(e) => setNewDistrict({ ...newDistrict, regency_id: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.regency_id ? 'border-red-500' : ''}`}
                            >
                                <option value="">Pilih Kabupaten</option>
                                {regencies.map((regency) => (
                                    <option key={regency.id} value={regency.id}>
                                        {regency.name_bps}
                                    </option>
                                ))}
                            </select>
                            {errors.regency_id && <p className="text-red-500 text-sm mt-1">{errors.regency_id}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Code BPS</label>
                            <input
                                type="text"
                                value={newDistrict.code_bps}
                                onChange={(e) => setNewDistrict({ ...newDistrict, code_bps: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.code_bps ? 'border-red-500' : ''}`}
                            />
                            {errors.code_bps && <p className="text-red-500 text-sm mt-1">{errors.code_bps}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name BPS</label>
                            <input
                                type="text"
                                value={newDistrict.name_bps}
                                onChange={(e) => setNewDistrict({ ...newDistrict, name_bps: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.name_bps ? 'border-red-500' : ''}`}
                            />
                            {errors.name_bps && <p className="text-red-500 text-sm mt-1">{errors.name_bps}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Code DAGRI</label>
                            <input
                                type="text"
                                value={newDistrict.code_dagri}
                                onChange={(e) => setNewDistrict({ ...newDistrict, code_dagri: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.code_dagri ? 'border-red-500' : ''}`}
                            />
                            {errors.code_dagri && <p className="text-red-500 text-sm mt-1">{errors.code_dagri}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name DAGRI</label>
                            <input
                                type="text"
                                value={newDistrict.name_dagri}
                                onChange={(e) => setNewDistrict({ ...newDistrict, name_dagri: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.name_dagri ? 'border-red-500' : ''}`}
                            />
                            {errors.name_dagri && <p className="text-red-500 text-sm mt-1">{errors.name_dagri}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Active</label>
                            <input
                                type="checkbox"
                                checked={newDistrict.active}
                                onChange={(e) => setNewDistrict({ ...newDistrict, active: e.target.checked })}
                                className="mt-1 rounded border-gray-300"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Code</label>
                            <input
                                type="text"
                                value={newDistrict.code}
                                onChange={(e) => setNewDistrict({ ...newDistrict, code: e.target.value })}
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
            <Modal isOpen={isModalOpen && isViewMode} onClose={handleCloseModal} title="Lihat Kecamatan">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kabupaten</label>
                        <p className="mt-1 text-gray-900">{selectedDistrict?.regency?.name_bps}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code BPS</label>
                        <p className="mt-1 text-gray-900">{selectedDistrict?.code_bps}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name BPS</label>
                        <p className="mt-1 text-gray-900">{selectedDistrict?.name_bps}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code DAGRI</label>
                        <p className="mt-1 text-gray-900">{selectedDistrict?.code_dagri}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name DAGRI</label>
                        <p className="mt-1 text-gray-900">{selectedDistrict?.name_dagri}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Active</label>
                        <p className="mt-1 text-gray-900">{selectedDistrict?.active ? "Ya" : "Tidak"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <p className="mt-1 text-gray-900">{selectedDistrict?.code}</p>
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
