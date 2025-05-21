import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import OfficialList from "./Partials/Component/List";
import { HiUsers } from "react-icons/hi";
import Modal from "./Partials/Section/Modal";
import OfficialPDF from "./Partials/Component/PDF";

// Ambil token CSRF
const csrfToken =
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") || "";

export default function Official({ initialOfficials, officials }) {
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
        sortDirection = "",
    }) => {
        setLoading(true);
        router.get(
            "/regency/official",
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
                    Swal.fire(
                        "Error",
                        "Failed to fetch data. Please try again.",
                        "error"
                    );
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
        console.log(official);
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
                router.delete(`/regency/official/${id}`, {
                    headers: {
                        "X-CSRF-TOKEN": csrfToken, // Sertakan token CSRF
                    },
                    onSuccess: () => {
                        Swal.fire(
                            "Deleted!",
                            "Data has been successfully deleted.",
                            "success"
                        );
                        fetchData({}); // Refresh data setelah penghapusan
                    },
                    onError: () => {
                        Swal.fire(
                            "Error",
                            "An error occurred while deleting the data.",
                            "error"
                        );
                    },
                });
            }
        });
    };

    const [isProcessing, setIsProcessing] = useState(false);

    // Handle Accept Official
    const handleAccept = (official) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This official will be accepted!",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, accept it!",
        }).then((result) => {
            if (result.isConfirmed) {
                setIsProcessing(true); // Set loading state
                router.put(
                    `/regency/official/${official.nik}/accept`,
                    {},
                    {
                        // headers: {
                        //     "X-CSRF-TOKEN": csrfToken, // Sertakan token CSRF
                        // },
                        onSuccess: () => {
                            Swal.fire(
                                "Accepted!",
                                "The official has been accepted.",
                                "success"
                            );

                            // Perbarui state lokal
                            const updatedOfficials = officialsData.data.map(
                                (item) => {
                                    if (item.nik === official.nik) {
                                        return { ...item, status: "validasi" }; // Update status
                                    }
                                    return item;
                                }
                            );

                            setOfficialsData({
                                ...officialsData,
                                data: updatedOfficials,
                            });
                            setIsProcessing(false); // Reset loading state
                        },
                        onError: () => {
                            Swal.fire(
                                "Error",
                                "An error occurred while accepting the official.",
                                "error"
                            );
                            setIsProcessing(false); // Reset loading state
                        },
                    }
                );
            }
        });
    };

    // Handle Reject Official
    const handleReject = (official) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This official will be rejected!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545", // Warna merah untuk konfirmasi
            cancelButtonColor: "#6c757d", // Warna abu-abu untuk batal
            confirmButtonText: "Yes, reject it!",
        }).then((result) => {
            if (result.isConfirmed) {
                // Kirim permintaan PUT ke backend
                router.put(
                    `/regency/official/${official.nik}/reject`,
                    {}, // Data kosong karena hanya mengubah status
                    {
                        // headers: {
                        //     "X-CSRF-TOKEN": csrfToken, // Sertakan token CSRF
                        // },
                        onSuccess: () => {
                            // Tampilkan pesan sukses
                            Swal.fire(
                                "Rejected!",
                                "The official has been rejected.",
                                "success"
                            );

                            // Perbarui state lokal tanpa perlu refresh halaman
                            const updatedOfficials = officialsData.data.map(
                                (item) => {
                                    if (item.nik === official.nik) {
                                        return { ...item, status: "tolak" }; // Update status menjadi "tolak"
                                    }
                                    return item;
                                }
                            );

                            // Set state baru
                            setOfficialsData({
                                ...officialsData,
                                data: updatedOfficials,
                            });
                        },
                        onError: () => {
                            // Tampilkan pesan error jika terjadi kesalahan
                            Swal.fire(
                                "Error",
                                "An error occurred while rejecting the official.",
                                "error"
                            );
                        },
                    }
                );
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

        const url = isEdit
            ? `/regency/official/${selectedOfficial.id}`
            : "/regency/official";
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
                "X-CSRF-TOKEN": csrfToken, // Sertakan token CSRF
            },
            onSuccess: () => {
                Swal.fire(
                    "Success",
                    `Official ${isEdit ? "updated" : "added"} successfully.`,
                    "success"
                );
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
            breadcrumb={[
                {
                    name: "Official",
                    path: "/regency/official",
                    active: true,
                    icon: <HiUsers className="w-5 h-5 mr-3" />,
                },
            ]}
        >
            <Head title="Official" />

            <div className="p-4">
                <OfficialList
                    officials={officialsData}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onPrint={handlePrint}
                    onView={handleView}
                />
            </div>

            {/* Modal untuk Tambah/Edit */}
            <Modal
                isOpen={isModalOpen && !isViewMode}
                onClose={handleCloseModal}
                title={isEdit ? "Edit Official" : "Add Official"}
            >
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={newOfficial.nama_lengkap}
                                onChange={(e) =>
                                    setNewOfficial({
                                        ...newOfficial,
                                        nama_lengkap: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                NIK
                            </label>
                            <input
                                type="text"
                                value={newOfficial.nik}
                                onChange={(e) =>
                                    setNewOfficial({
                                        ...newOfficial,
                                        nik: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                NIAD
                            </label>
                            <input
                                type="text"
                                value={newOfficial.niad}
                                onChange={(e) =>
                                    setNewOfficial({
                                        ...newOfficial,
                                        niad: e.target.value,
                                    })
                                }
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
            {/* <Modal
                isOpen={isModalOpen && isViewMode}
                onClose={handleCloseModal}
                title="View Official"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nama Lengkap
                        </label>
                        <p className="mt-1 text-gray-900">
                            {selectedOfficial?.nama_lengkap}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            NIK
                        </label>
                        <p className="mt-1 text-gray-900">
                            {selectedOfficial?.nik}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            NIAD
                        </label>
                        <p className="mt-1 text-gray-900">
                            {selectedOfficial?.niad}
                        </p>
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
            </Modal> */}
            <Modal
                isOpen={isModalOpen && isViewMode}
                onClose={handleCloseModal}
                title={`Detail Pejabat: ${selectedOfficial?.nama_lengkap}`}
                size="xl" // Assuming your Modal component supports size prop
            >
                <div className="max-h-[90vh] overflow-y-auto pr-2 space-y-6">
                    {/* Personal Information Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
                            Informasi Pribadi
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Nama Lengkap
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.nama_lengkap}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    NIK
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.nik}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    NIAD
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.niad}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Tempat/Tanggal Lahir
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.tempat_lahir},{" "}
                                    {selectedOfficial?.tanggal_lahir}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Jenis Kelamin
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.jenis_kelamin === "L"
                                        ? "Laki-laki"
                                        : "Perempuan"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Status Perkawinan
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.status_perkawinan}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Agama
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.agama}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Status
                                </label>
                                <div className="mt-1">
                                    {/* <CustomBadge
                                        role={selectedOfficial?.status}
                                    /> */}
                                    <p className="mt-1 text-gray-900">
                                        {selectedOfficial?.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
                            Alamat
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Alamat Lengkap
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.addresses?.alamat}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    RT/RW
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.addresses?.rt}/
                                    {selectedOfficial?.addresses?.rw}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Provinsi
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.addresses?.province_name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Kabupaten/Kota
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.addresses?.regency_name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Kecamatan
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.addresses?.district_name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Desa/Kelurahan
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.addresses?.village_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
                            Kontak
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Nomor Handphone
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.contacts?.handphone}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Email
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.contacts?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Identity Documents Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
                            Identitas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Golongan Darah
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.identities?.gol_darah}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Pendidikan Terakhir
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.identities?.pendidikan}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    BPJS Kesehatan
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {
                                        selectedOfficial?.identities
                                            ?.bpjs_kesehatan
                                    }
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    BPJS Ketenagakerjaan
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {
                                        selectedOfficial?.identities
                                            ?.bpjs_ketenagakerjaan
                                    }
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    NPWP
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {selectedOfficial?.identities?.npwp}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Education History Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
                            Riwayat Pendidikan
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jenjang
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Sekolah
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Alamat Sekolah
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jurusan
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tahun
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedOfficial?.studies?.map(
                                        (study, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {study.study.name}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {study.nama_sekolah}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-900">
                                                    {study.alamat_sekolah}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {study.jurusan || "-"}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {study.tahun_masuk} -{" "}
                                                    {study.tahun_keluar}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Position History Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
                            Riwayat Jabatan
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jabatan
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Penetap
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nomor SK
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal SK
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Periode
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Keterangan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedOfficial?.positions?.map(
                                        (position, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {position?.position?.name}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {position?.penetap}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {position?.nomor_sk}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {position?.tanggal_sk}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {position?.mulai} -{" "}
                                                    {position?.selesai ||
                                                        "Sekarang"}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-900">
                                                    {position?.keterangan}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Footer Buttons */}
                <div className="flex justify-end space-x-3 py-2">
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
