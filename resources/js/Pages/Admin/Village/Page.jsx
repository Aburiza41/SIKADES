import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import VillageList from "./Partials/Component/List";

import { HiMap } from "react-icons/hi";
import Modal from "./Partials/Section/Modal";
import Select from "react-select";

export default function Village({ initialVillages }) {
    const { flash } = usePage().props;
    const [villagesData, setVillagesData] = useState(initialVillages);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [newVillage, setNewVillage] = useState({
        regency_id: null,
        district_id: null,
        code_bps: "",
        name_bps: "",
        code_dagri: "",
        name_dagri: "",
        logo: null,
        logo_path: "",
        description: "",
        website: "",
        active: false,
        code: "",
    });
    const [errors, setErrors] = useState({});

    // Ambil CSRF token dari meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) Swal.fire("Success", flash.success, "success");
        if (flash?.error) Swal.fire("Error", flash.error, "error");
    }, [flash]);

    // Fetch regencies on mount
    useEffect(() => {
        fetch("/local/regencies", {
            headers: {
                'Accept': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    setRegencies(data.data);
                } else {
                    console.error("Error fetching regencies:", data.message);
                    Swal.fire("Error", data.message || "Gagal mengambil data kabupaten.", "error");
                }
            })
            .catch((error) => {
                console.error("Error fetching regencies:", error);
                Swal.fire("Error", "Gagal mengambil data kabupaten.", "error");
            });
    }, []);

    // Fetch districts when regency_id changes
    useEffect(() => {
        if (newVillage.regency_id) {
            fetch(`/local/districts/${newVillage.regency_id.value}`, {
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.success) {
                        setDistricts(data.data);
                    } else {
                        console.error("Error fetching districts:", data.message);
                        Swal.fire("Error", data.message || "Gagal mengambil data kecamatan.", "error");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching districts:", error);
                    Swal.fire("Error", "Gagal mengambil data kecamatan.", "error");
                });
        } else {
            setDistricts([]);
            setNewVillage((prev) => ({ ...prev, district_id: null }));
        }
    }, [newVillage.regency_id]);

    // Fetch data from the server
    const fetchData = useCallback(({
        page = 1,
        perPage = 10,
        search = "",
        sortField = "",
        sortDirection = "",
        regency_id = "",
        district_id = "",
    }) => {
        setLoading(true);
        router.get(
            "/admin/village",
            {
                page,
                per_page: perPage,
                search,
                sort_field: sortField,
                sort_direction: sortDirection,
                regency_id,
                district_id,
            },
            {
                preserveState: true,
                replace: true,
                onSuccess: (page) => {
                    setVillagesData(page.props.initialVillages);
                    setLoading(false);
                },
                onError: () => {
                    Swal.fire("Error", "Gagal mengambil data. Silakan coba lagi.", "error");
                    setLoading(false);
                },
            }
        );
    }, [setVillagesData, setLoading]);



    // Handle add village
    const handleAdd = () => {
        setIsEdit(false);
        setIsViewMode(false);
        setIsModalOpen(true);
        setErrors({});
        setNewVillage({
            regency_id: null,
            district_id: null,
            code_bps: "",
            name_bps: "",
            code_dagri: "",
            name_dagri: "",
            logo: null,
            logo_path: "",
            description: "",
            website: "",
            active: false,
            code: "",
        });
    };

    // Handle edit village
    const handleEdit = (village) => {
        router.get(`/admin/village/${village.id}/edit`, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
            onSuccess: (page) => {
                const village = page.props.village;
                setSelectedVillage(village);
                setIsEdit(true);
                setIsViewMode(false);
                setIsModalOpen(true);
                setErrors({});
                setNewVillage({
                    regency_id: village.district?.regency ? { value: village.district.regency.id, label: village.district.regency.name_bps } : null,
                    district_id: village.district ? { value: village.district.id, label: village.district.name_bps } : null,
                    code_bps: village.code_bps,
                    name_bps: village.name_bps,
                    code_dagri: village.code_dagri,
                    name_dagri: village.name_dagri,
                    logo: null,
                    logo_path: village.logo_path || "",
                    description: village.description || "",
                    website: village.website || "",
                    active: village.active,
                    code: village.code,
                });
            },
            onError: (errors) => {
                Swal.fire("Error", errors.error || "Gagal mengambil data desa.", "error");
            },
        });
    };

    // Handle view village
    const handleView = (village) => {
        setSelectedVillage(village);
        setIsEdit(false);
        setIsViewMode(true);
        setIsModalOpen(true);
        setErrors({});
    };

    // Handle delete village
    const handleDelete = (id) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data desa ini akan dihapus!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/village/${id}`, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    onSuccess: () => {
                        Swal.fire("Terhapus!", "Desa berhasil dihapus.", "success");
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
        if (!newVillage.district_id) newErrors.district_id = "Kecamatan wajib dipilih.";
        if (!newVillage.code_bps) newErrors.code_bps = "Code BPS wajib diisi.";
        if (!newVillage.name_bps) newErrors.name_bps = "Name BPS wajib diisi.";
        if (!newVillage.code_dagri) newErrors.code_dagri = "Code DAGRI wajib diisi.";
        if (!newVillage.name_dagri) newErrors.name_dagri = "Name DAGRI wajib diisi.";
        if (!newVillage.code) newErrors.code = "Code wajib diisi.";
        if (newVillage.website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(newVillage.website)) {
            newErrors.website = "Website harus berupa URL yang valid.";
        }
        if (newVillage.logo && !['image/jpeg', 'image/png', 'image/jpg'].includes(newVillage.logo.type)) {
            newErrors.logo = "Logo harus berupa file gambar (JPEG/PNG).";
        }
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

        const url = isEdit ? `/admin/village/${selectedVillage.id}` : "/admin/village";
        const method = isEdit ? "put" : "post";
        const payload = new FormData();
        payload.append('district_id', newVillage.district_id?.value || "");
        payload.append('code_bps', newVillage.code_bps);
        payload.append('name_bps', newVillage.name_bps);
        payload.append('code_dagri', newVillage.code_dagri);
        payload.append('name_dagri', newVillage.name_dagri);
        if (newVillage.logo) {
            payload.append('logo', newVillage.logo);
        }
        payload.append('description', newVillage.description || "");
        payload.append('website', newVillage.website || "");
        payload.append('active', newVillage.active ? "1" : "0");
        payload.append('code', newVillage.code);

        router[method](url, payload, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
            onSuccess: () => {
                Swal.fire("Success", `Desa ${isEdit ? "diperbarui" : "ditambahkan"} berhasil.`, "success");
                setIsModalOpen(false);
                setErrors({});
                fetchData({});
            },
            onError: (errors) => {
                const formattedErrors = {};
                Object.keys(errors).forEach((key) => {
                    formattedErrors[key] = errors[key][0] || errors[key];
                });
                setErrors(formattedErrors);
                Swal.fire(
                    "Error",
                    formattedErrors.error || Object.values(formattedErrors).join(", ") || "Terjadi kesalahan saat menyimpan data.",
                    "error"
                );
            },
        });
    };

    // Handle close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setIsViewMode(false);
        setSelectedVillage(null);
        setErrors({});
        setNewVillage({
            regency_id: null,
            district_id: null,
            code_bps: "",
            name_bps: "",
            code_dagri: "",
            name_dagri: "",
            logo: null,
            logo_path: "",
            description: "",
            website: "",
            active: false,
            code: "",
        });
    };

    // react-select styles
    const selectStyles = {
        control: (base) => ({
            ...base,
            borderColor: '#d1d5db',
            borderRadius: '0.375rem',
            padding: '0.25rem',
            '&:hover': {
                borderColor: '#3b82f6',
            },
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Desa
                    <p className="text-sm font-thin mt-1">Daftar Desa</p>
                </div>
            }
            breadcrumb={[{ name: "Desa", path: "/admin/village", active: true, icon: <HiMap className="w-5 h-5 mr-3" /> }]}
        >
            <Head title="Desa" />

            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Tambah Desa
                    </button>
                </div>
                <VillageList
                    villages={villagesData}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            </div>



            {/* Modal untuk Tambah/Edit */}
            <Modal isOpen={isModalOpen && !isViewMode} onClose={handleCloseModal} title={isEdit ? "Ubah Desa" : "Tambah Desa"}>
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Kabupaten</label>
                            <Select
                                options={regencies}
                                value={newVillage.regency_id}
                                onChange={(option) => setNewVillage({ ...newVillage, regency_id: option, district_id: null })}
                                placeholder="Pilih Kabupaten"
                                isClearable
                                styles={selectStyles}
                            />
                            {errors.regency_id && <p className="text-red-500 text-sm mt-1">{errors.regency_id}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                            <Select
                                options={districts}
                                value={newVillage.district_id}
                                onChange={(option) => setNewVillage({ ...newVillage, district_id: option })}
                                placeholder="Pilih Kecamatan"
                                isClearable
                                isDisabled={!newVillage.regency_id}
                                styles={selectStyles}
                            />
                            {errors.district_id && <p className="text-red-500 text-sm mt-1">{errors.district_id}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Code BPS</label>
                            <input
                                type="text"
                                value={newVillage.code_bps}
                                onChange={(e) => setNewVillage({ ...newVillage, code_bps: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.code_bps ? 'border-red-500' : ''}`}
                            />
                            {errors.code_bps && <p className="text-red-500 text-sm mt-1">{errors.code_bps}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name BPS</label>
                            <input
                                type="text"
                                value={newVillage.name_bps}
                                onChange={(e) => setNewVillage({ ...newVillage, name_bps: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.name_bps ? 'border-red-500' : ''}`}
                            />
                            {errors.name_bps && <p className="text-red-500 text-sm mt-1">{errors.name_bps}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Code DAGRI</label>
                            <input
                                type="text"
                                value={newVillage.code_dagri}
                                onChange={(e) => setNewVillage({ ...newVillage, code_dagri: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.code_dagri ? 'border-red-500' : ''}`}
                            />
                            {errors.code_dagri && <p className="text-red-500 text-sm mt-1">{errors.code_dagri}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name DAGRI</label>
                            <input
                                type="text"
                                value={newVillage.name_dagri}
                                onChange={(e) => setNewVillage({ ...newVillage, name_dagri: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.name_dagri ? 'border-red-500' : ''}`}
                            />
                            {errors.name_dagri && <p className="text-red-500 text-sm mt-1">{errors.name_dagri}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setNewVillage({ ...newVillage, logo: file });
                                }}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.logo ? 'border-red-500' : ''}`}
                            />
                            {newVillage.logo_path && (
                                <p className="text-sm text-gray-600 mt-1">Current: {newVillage.logo_path}</p>
                            )}
                            {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={newVillage.description}
                                onChange={(e) => setNewVillage({ ...newVillage, description: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.description ? 'border-red-500' : ''}`}
                                rows="4"
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Website</label>
                            <input
                                type="text"
                                value={newVillage.website}
                                onChange={(e) => setNewVillage({ ...newVillage, website: e.target.value })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.website ? 'border-red-500' : ''}`}
                            />
                            {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Active</label>
                            <input
                                type="checkbox"
                                checked={newVillage.active}
                                onChange={(e) => setNewVillage({ ...newVillage, active: e.target.checked })}
                                className="mt-1 rounded border-gray-300"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Code</label>
                            <input
                                type="text"
                                value={newVillage.code}
                                onChange={(e) => setNewVillage({ ...newVillage, code: e.target.value })}
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
            <Modal isOpen={isModalOpen && isViewMode} onClose={handleCloseModal} title="Lihat Desa">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kabupaten</label>
                        <p className="mt-1 text-gray-900">{selectedVillage?.district?.regency?.name_bps || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                        <p className="mt-1 text-gray-900">{selectedVillage?.district?.name_bps || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Desa</label>
                        <p className="mt-1 text-gray-900">{selectedVillage?.name_bps || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code Desa</label>
                        <p className="mt-1 text-gray-900">{selectedVillage?.code || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code BPS</label>
                        <p className="mt-1 text-gray-900">{selectedVillage?.code_bps || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name BPS</label>
                        <p className="mt-1 text-gray-900">{selectedVillage?.name_bps || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code DAGRI</label>
                        <p className="mt-1 text-gray-900">{selectedVillage?.code_dagri || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name DAGRI</label>
                        <p className="mt-1 text-gray-900">{selectedVillage?.name_dagri || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Logo Path</label>
                        <p className="mt-1 text-gray-900">
                            {selectedVillage?.logo_path ? (
                                <a href={`/storage/${selectedVillage.logo_path}`} target="_blank" className="text-blue-500 hover:underline">
                                    {selectedVillage.logo_path}
                                </a>
                            ) : '-'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="mt-1 text-gray-900">{selectedVillage?.description || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Website</label>
                        <p className="mt-1 text-gray-900">
                            {selectedVillage?.website ? (
                                <a href={selectedVillage.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    {selectedVillage.website}
                                </a>
                            ) : '-'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Active</label>
                        <p className="mt-1 text-gray-900">{selectedVillage?.active ? "Ya" : "Tidak"}</p>
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
