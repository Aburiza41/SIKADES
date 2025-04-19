import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import OfficialList from "./Partials/Component/List";
import { HiUsers } from "react-icons/hi";
import Modal from "./Partials/Section/Modal";
import OfficialPDF from "./Partials/Component/PDF";

// Ambil token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function Official({ initialOfficials, officials, role }) {
    // console.log(role);
    const { flash } = usePage().props;
    const [officialsData, setOfficialsData] = useState(initialOfficials);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedOfficial, setSelectedOfficial] = useState(null);
    const [newOfficial, setNewOfficial] = useState({
        village_id: "",
        nik: "",
        niad: "",
        nama_lengkap: "",
        gelar_depan: "",
        gelar_belakang: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        jenis_kelamin: "",
        status_perkawinan: "",
        agama: "",
        alamat: "",
        rt: "",
        rw: "",
        regency_code: "",
        regency_name: "",
        district_code: "",
        district_name: "",
        village_code: "",
        village_name: "",
        handphone: "",
        gol_darah: "",
        pendidikan: "",
        bpjs_kesehatan: "",
        bpjs_ketenagakerjaan: "",
        npwp: "",
        status: "",
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
            `/admin/official/${role}`,
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
                    setOfficialsData(page.props.officials); // Gunakan officials
                    setLoading(false);
                },
                onError: () => {
                    Swal.fire("Error", "Failed to fetch data. Please try again.", "error");
                    setLoading(false);
                },
            }
        );
    };

    // Handle add official
    const handleAdd = () => {
        setIsEdit(false);
        setIsViewMode(false);
        setIsModalOpen(true);
        setNewOfficial({
            village_id: "",
            nik: "",
            niad: "",
            nama_lengkap: "",
            gelar_depan: "",
            gelar_belakang: "",
            tempat_lahir: "",
            tanggal_lahir: "",
            jenis_kelamin: "",
            status_perkawinan: "",
            agama: "",
            alamat: "",
            rt: "",
            rw: "",
            regency_code: "",
            regency_name: "",
            district_code: "",
            district_name: "",
            village_code: "",
            village_name: "",
            handphone: "",
            gol_darah: "",
            pendidikan: "",
            bpjs_kesehatan: "",
            bpjs_ketenagakerjaan: "",
            npwp: "",
            status: "",
        });
    };

    // Handle edit official
    const handleEdit = (official) => {
        setSelectedOfficial(official); // Set data yang akan diedit
        setIsEdit(true); // Set mode edit
        setIsViewMode(false); // Nonaktifkan mode view
        setIsModalOpen(true); // Buka modal

        // Isi form dengan data official yang dipilih
        setNewOfficial({
            village_id: official.village_id,
            nik: official.nik,
            niad: official.niad,
            nama_lengkap: official.nama_lengkap,
            gelar_depan: official.gelar_depan,
            gelar_belakang: official.gelar_belakang,
            tempat_lahir: official.tempat_lahir,
            tanggal_lahir: official.tanggal_lahir,
            jenis_kelamin: official.jenis_kelamin,
            status_perkawinan: official.status_perkawinan,
            agama: official.agama,
            alamat: official.alamat,
            rt: official.rt,
            rw: official.rw,
            regency_code: official.regency_code,
            regency_name: official.regency_name,
            district_code: official.district_code,
            district_name: official.district_name,
            village_code: official.village_code,
            village_name: official.village_name,
            handphone: official.handphone,
            gol_darah: official.gol_darah,
            pendidikan: official.pendidikan,
            bpjs_kesehatan: official.bpjs_kesehatan,
            bpjs_ketenagakerjaan: official.bpjs_ketenagakerjaan,
            npwp: official.npwp,
            status: official.status,
        });
    };

    // Handle view official
    const handleView = (official) => {
        setSelectedOfficial(official); // Set data yang akan dilihat
        setIsEdit(false); // Nonaktifkan mode edit
        setIsViewMode(true); // Aktifkan mode view
        setIsModalOpen(true); // Buka modal
    };

    // Handle delete official
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
                router.delete(`/admin/official/${role}/${id}`, {
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

    // Handle print official
    const handlePrint = (official) => {
        const data = {
            nama_lengkap: official.nama_lengkap,
            nik: official.nik,
            niad: official.niad,
            tempat_lahir: official.tempat_lahir,
            tanggal_lahir: official.tanggal_lahir,
            jenis_kelamin: official.jenis_kelamin,
            status_perkawinan: official.status_perkawinan,
            agama: official.agama,
            alamat: official.alamat,
            handphone: official.handphone,
            gol_darah: official.gol_darah,
            pendidikan: official.pendidikan,
            bpjs_kesehatan: official.bpjs_kesehatan,
            bpjs_ketenagakerjaan: official.bpjs_ketenagakerjaan,
            npwp: official.npwp,
            status: official.status,
        };
        OfficialPDF(data); // Panggil fungsi PDF dengan data official
    };

    // Handle submit form (tambah/edit)
    const handleSubmit = (e) => {
        e.preventDefault();

        const url = isEdit ? `/admin/official/${role}/${selectedOfficial.id}` : `/admin/official/${role}`;
        const method = isEdit ? "put" : "post";

        // Data yang akan dikirim ke backend
        const payload = {
            village_id: newOfficial.village_id,
            nik: newOfficial.nik,
            niad: newOfficial.niad,
            nama_lengkap: newOfficial.nama_lengkap,
            gelar_depan: newOfficial.gelar_depan,
            gelar_belakang: newOfficial.gelar_belakang,
            tempat_lahir: newOfficial.tempat_lahir,
            tanggal_lahir: newOfficial.tanggal_lahir,
            jenis_kelamin: newOfficial.jenis_kelamin,
            status_perkawinan: newOfficial.status_perkawinan,
            agama: newOfficial.agama,
            alamat: newOfficial.alamat,
            rt: newOfficial.rt,
            rw: newOfficial.rw,
            regency_code: newOfficial.regency_code,
            regency_name: newOfficial.regency_name,
            district_code: newOfficial.district_code,
            district_name: newOfficial.district_name,
            village_code: newOfficial.village_code,
            village_name: newOfficial.village_name,
            handphone: newOfficial.handphone,
            gol_darah: newOfficial.gol_darah,
            pendidikan: newOfficial.pendidikan,
            bpjs_kesehatan: newOfficial.bpjs_kesehatan,
            bpjs_ketenagakerjaan: newOfficial.bpjs_ketenagakerjaan,
            npwp: newOfficial.npwp,
            status: newOfficial.status,
        };

        router[method](url, payload, {
            headers: {
                'X-CSRF-TOKEN': csrfToken, // Sertakan token CSRF
            },
            onSuccess: () => {
                Swal.fire("Success", `Official ${isEdit ? "updated" : "added"} successfully.`, "success");
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
        setSelectedOfficial(null); // Reset selected official
        setNewOfficial({
            village_id: "",
            nik: "",
            niad: "",
            nama_lengkap: "",
            gelar_depan: "",
            gelar_belakang: "",
            tempat_lahir: "",
            tanggal_lahir: "",
            jenis_kelamin: "",
            status_perkawinan: "",
            agama: "",
            alamat: "",
            rt: "",
            rw: "",
            regency_code: "",
            regency_name: "",
            district_code: "",
            district_name: "",
            village_code: "",
            village_name: "",
            handphone: "",
            gol_darah: "",
            pendidikan: "",
            bpjs_kesehatan: "",
            bpjs_ketenagakerjaan: "",
            npwp: "",
            status: "",
        }); // Reset form
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Official
                    <p className="text-sm font-thin mt-1">Daftar Official</p>
                </div>
            }
            breadcrumb={[{ name: "Official", path: `/admin/official/${role}`, active: true, icon: <HiUsers className="w-5 h-5 mr-3" /> }]}
        >
            <Head title="Official" />

            <div className="p-4">
                <button
                    onClick={handleAdd}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Add Official
                </button>
                <OfficialList
                    officials={officialsData}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onPrint={handlePrint}
                />
            </div>

            {/* Modal untuk Tambah/Edit */}
            <Modal isOpen={isModalOpen && !isViewMode} onClose={handleCloseModal} title={isEdit ? "Edit Official" : "Add Official"}>
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input
                                type="text"
                                value={newOfficial.nama_lengkap}
                                onChange={(e) => setNewOfficial({ ...newOfficial, nama_lengkap: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">NIK</label>
                            <input
                                type="text"
                                value={newOfficial.nik}
                                onChange={(e) => setNewOfficial({ ...newOfficial, nik: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">NIAD</label>
                            <input
                                type="text"
                                value={newOfficial.niad}
                                onChange={(e) => setNewOfficial({ ...newOfficial, niad: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        {/* Tambahkan field lain sesuai kebutuhan */}
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
            <Modal isOpen={isModalOpen && isViewMode} onClose={handleCloseModal} title="View Official">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <p className="mt-1 text-gray-900">{selectedOfficial?.nama_lengkap}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">NIK</label>
                        <p className="mt-1 text-gray-900">{selectedOfficial?.nik}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">NIAD</label>
                        <p className="mt-1 text-gray-900">{selectedOfficial?.niad}</p>
                    </div>
                    {/* Tambahkan field lain sesuai kebutuhan */}
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
