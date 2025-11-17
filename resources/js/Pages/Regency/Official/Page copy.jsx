import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import OfficialList from "./Partials/Component/List";
import { HiUsers } from "react-icons/hi";
import Modal from "./Partials/Section/Modal";
import OfficialPDF from "./Partials/Component/PDF";

import { motion, AnimatePresence } from "framer-motion";
import {
    FiUser,
    FiHome,
    FiMail,
    FiPhone,
    FiFileText,
    FiMapPin,
    FiCalendar,
    FiDroplet,
    FiAward,
    FiBriefcase,
    FiX,
    FiChevronDown,
    FiChevronUp,
    FiImage,
    FiClock,
} from "react-icons/fi";
// Ambil token CSRF
const csrfToken =
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") || "";

export default function Official({
    initialOfficials,
    officials,
    role,
    position,
    regency_code,
}) {
    // console.log(role);
    const { flash } = usePage().props;
    const [officialsData, setOfficialsData] = useState(initialOfficials);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedOfficial, setSelectedOfficial] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
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
        kecamatan,
        desa,
    }) => {
        setLoading(true);
        router.get(
            `/regency/official/${role}`,
            {
                page,
                per_page: perPage,
                search,
                filters,
                sort_field: sortField,
                sort_direction: sortDirection,
                kecamatan,
                desa,
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
    const handleEdit = (official, role) => {
        // alert(official.id);
        // console.log(official);
        window.location.href = `/village/official/${role}/${official.nik}/edit`;

        // setSelectedOfficial(official); // Set data yang akan diedit
        // setIsEdit(true); // Set mode edit
        // setIsViewMode(false); // Nonaktifkan mode view
        // setIsModalOpen(true); // Buka modal

        // // Isi form dengan data official yang dipilih
        // setNewOfficial({
        //     village_id: official.village_id,
        //     nik: official.nik,
        //     niad: official.niad,
        //     nama_lengkap: official.nama_lengkap,
        //     gelar_depan: official.gelar_depan,
        //     gelar_belakang: official.gelar_belakang,
        //     tempat_lahir: official.tempat_lahir,
        //     tanggal_lahir: official.tanggal_lahir,
        //     jenis_kelamin: official.jenis_kelamin,
        //     status_perkawinan: official.status_perkawinan,
        //     agama: official.agama,
        //     alamat: official.alamat,
        //     rt: official.rt,
        //     rw: official.rw,
        //     regency_code: official.regency_code,
        //     regency_name: official.regency_name,
        //     district_code: official.district_code,
        //     district_name: official.district_name,
        //     village_code: official.village_code,
        //     village_name: official.village_name,
        //     handphone: official.handphone,
        //     gol_darah: official.gol_darah,
        //     pendidikan: official.pendidikan,
        //     bpjs_kesehatan: official.bpjs_kesehatan,
        //     bpjs_ketenagakerjaan: official.bpjs_ketenagakerjaan,
        //     npwp: official.npwp,
        //     status: official.status,
        // });
    };

    // Handle view official
    const handleView = (official) => {
        setSelectedOfficial(official); // Set data yang akan dilihat
        setIsEdit(false); // Nonaktifkan mode edit
        setIsViewMode(true); // Aktifkan mode view
        setIsModalOpen(true); // Buka modal
    };

    // Handle delete official
    const handleDelete = (official, role) => {
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
                router.delete(
                    `/village/official/${role}/${official.nik}/delete`,
                    {
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
            ? `/village/official/${role}/${selectedOfficial.id}`
            : `/village/official/${role}`;
        const method = isEdit ? "put" : "post";

        // Data yang akan dikirim ke backend
        const payload = {
            village_id: newOfficial.village_id,
            nik: newOfficial.nik,
            nipd: newOfficial.nipd,
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

    const handleAccept = (official) => {
        Swal.fire({
            title: `Apakah anda yakin?`,
            text: `Pilih terima untuk menyetujui verifikasi ${official.nama_lengkap}`,
            icon: "question",
            input: "textarea",
            inputLabel: "Catatan",
            inputPlaceholder: "Masukkan catatan untuk verifikasi...",
            inputAttributes: {
                "aria-label": "Catatan untuk verifikasi",
            },
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Terima",
            cancelButtonText: "Batal",
            preConfirm: (notes) => {
                return { notes }; // Catatan boleh kosong
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setIsProcessing(true); // Set loading state
                router.post(
                    `/regency/official/${role}/status/${official.nik}/accept`,
                    { notes: result.value.notes }, // Kirim catatan sebagai data POST
                    {
                        onSuccess: (response) => {
                            const officialData = response.data; // Ambil data dari respons
                            Swal.fire({
                                toast: true,
                                position: "top-end",
                                icon: "success",
                                title: `Verifikasi ${officialData.nama_lengkap} diterima`,
                                text: officialData.notes || "Tidak ada catatan",
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                                customClass: {
                                    container: "swal2-toast-container",
                                },
                            });

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

                            // Reload halaman
                            Inertia.reload({
                                preserveState: true,
                                preserveScroll: true,
                            });
                        },
                        onError: (error) => {
                            Swal.fire({
                                toast: true,
                                position: "top-end",
                                icon: "error",
                                title: "Error",
                                text:
                                    error.response?.data?.message ||
                                    `Verifikasi Terima ${official.nama_lengkap} dalam kendala`,
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                                customClass: {
                                    container: "swal2-toast-container",
                                },
                            });
                            setIsProcessing(false); // Reset loading state
                        },
                    }
                );
            }
        });
    };

    const handleReject = (official) => {
        Swal.fire({
            title: `Apakah anda yakin?`,
            text: `Pilih tolak untuk menolak verifikasi ${official.nama_lengkap}`,
            icon: "warning",
            input: "textarea",
            inputLabel: "Catatan",
            inputPlaceholder: "Masukkan catatan untuk penolakan...",
            inputAttributes: {
                "aria-label": "Catatan untuk penolakan",
            },
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Tolak",
            cancelButtonText: "Batal",
            preConfirm: (notes) => {
                return { notes }; // Catatan boleh kosong
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setIsProcessing(true); // Set loading state
                router.post(
                    `/regency/official/${role}/status/${official.nik}/reject`,
                    { notes: result.value.notes }, // Kirim catatan sebagai data PUT
                    {
                        onSuccess: (response) => {
                            const officialData = response.data || {
                                nama_lengkap: official.nama_lengkap,
                                status: "tolak",
                                notes: result.value.notes,
                            };
                            Swal.fire({
                                toast: true,
                                position: "top-end",
                                icon: "success",
                                title: `Verifikasi ${officialData.nama_lengkap} ditolak`,
                                text: officialData.notes || "Tidak ada catatan",
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                                customClass: {
                                    container: "swal2-toast-container",
                                },
                            });

                            // Perbarui state lokal
                            const updatedOfficials = officialsData.data.map(
                                (item) => {
                                    if (item.nik === official.nik) {
                                        return { ...item, status: "tolak" }; // Update status
                                    }
                                    return item;
                                }
                            );

                            setOfficialsData({
                                ...officialsData,
                                data: updatedOfficials,
                            });
                            setIsProcessing(false); // Reset loading state

                            // Reload halaman
                            Inertia.reload({
                                preserveState: true,
                                preserveScroll: true,
                            });
                        },
                        onError: (error) => {
                            Swal.fire({
                                toast: true,
                                position: "top-end",
                                icon: "error",
                                title: "Error",
                                text:
                                    error.response?.data?.message ||
                                    `Verifikasi Tolak ${official.nama_lengkap} dalam kendala`,
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                                customClass: {
                                    container: "swal2-toast-container",
                                },
                            });
                            setIsProcessing(false); // Reset loading state
                        },
                    }
                );
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Daftar {position.name}
                    <p className="text-sm font-thin mt-1">
                        Daftar pejabat desa dengan jabatan {position.name}
                    </p>
                </div>
            }
            breadcrumb={[
                {
                    name: "Pejabat",
                    path: `/admin/official/${role}`,
                    active: true,
                    icon: <HiUsers className="w-5 h-5 mr-3" />,
                },
            ]}
        >
            <Head title="Official" />

            <div className="p-4">
                {/* <button
                    onClick={handleAdd}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Add Official
                </button> */}
                <OfficialList
                    officials={officialsData}
                    fetchData={fetchData}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onPrint={handlePrint}
                    position={position}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    regencyCode={regency_code}
                    role={role}
                />
            </div>

            {/* Modal untuk View */}
            <Modal
                isOpen={isModalOpen && isViewMode}
                onClose={handleCloseModal}
                title="Detail Pejabat Desa"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-y-auto max-h-[90vh]"
                >
                    {/* Header dengan Foto Profil */}
                    <div className="flex flex-col md:flex-row gap-6 items-start bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                        {selectedOfficial?.identities?.foto ? (
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="relative group cursor-pointer"
                            >
                                {/* <img
                                    src={selectedOfficial.identities.foto}
                                    alt={`Foto ${selectedOfficial.nama_lengkap}`}
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                                /> */}
                                <img
                                    src={`/private-images/${selectedOfficial?.identities?.foto}`}
                                    alt={`Foto ${selectedOfficial.nama_lengkap}`}
                                    className="w-32 h-32 rounded-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiImage className="text-white text-2xl" />
                                </div>
                            </motion.div>
                        ) : (
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                <FiUser className="text-5xl" />
                            </div>
                        )}

                        <div className="flex-1">
                            <motion.h2
                                className="text-2xl font-bold text-gray-800 mb-1"
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {selectedOfficial?.gelar_depan &&
                                    `${selectedOfficial.gelar_depan} `}
                                {selectedOfficial?.nama_lengkap}
                                {selectedOfficial?.gelar_belakang &&
                                    `, ${selectedOfficial.gelar_belakang}`}
                            </motion.h2>

                            <motion.p
                                className="text-lg text-blue-600 font-medium mb-3"
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.15 }}
                            >
                                {
                                    selectedOfficial?.position_current?.position
                                        ?.name
                                }
                            </motion.p>

                            <div className="flex flex-wrap gap-2">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                                >
                                    <FiUser size={14} />{" "}
                                    {selectedOfficial?.jenis_kelamin === "L"
                                        ? "Laki-laki"
                                        : "Perempuan"}
                                </motion.div>

                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
                                >
                                    <FiCalendar size={14} />{" "}
                                    {selectedOfficial?.tanggal_lahir} (
                                    {calculateAge(
                                        selectedOfficial?.tanggal_lahir
                                    )}{" "}
                                    tahun)
                                </motion.div>

                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1"
                                >
                                    <FiDroplet size={14} /> Gol. Darah:{" "}
                                    {selectedOfficial?.identities?.gol_darah ||
                                        "-"}
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Accordion Sections */}
                    <div className="space-y-3">
                        {/* Informasi Pribadi */}
                        <AccordionSection
                            title="Informasi Pribadi"
                            icon={<FiUser className="text-blue-500" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                <InfoField
                                    label="NIK"
                                    value={selectedOfficial?.nik}
                                />
                                <InfoField
                                    label="NIPD"
                                    value={selectedOfficial?.nipd}
                                />
                                <InfoField
                                    label="Tempat Lahir"
                                    value={selectedOfficial?.tempat_lahir}
                                />
                                <InfoField
                                    label="Tanggal Lahir"
                                    value={selectedOfficial?.tanggal_lahir}
                                />
                                <InfoField
                                    label="Agama"
                                    value={selectedOfficial?.agama}
                                />
                                <InfoField
                                    label="Status Perkawinan"
                                    value={selectedOfficial?.status_perkawinan}
                                />
                                <InfoField
                                    label="Pendidikan Terakhir"
                                    value={
                                        selectedOfficial?.identities
                                            ?.pendidikan_terakhir
                                    }
                                />
                            </div>
                        </AccordionSection>

                        {/* Alamat */}
                        <AccordionSection
                            title="Alamat"
                            icon={<FiMapPin className="text-green-500" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                <InfoField
                                    label="Alamat"
                                    value={selectedOfficial?.addresses?.alamat}
                                    fullWidth
                                />
                                <div className="flex gap-4">
                                    <InfoField
                                        label="RT"
                                        value={selectedOfficial?.addresses?.rt}
                                    />
                                    <InfoField
                                        label="RW"
                                        value={selectedOfficial?.addresses?.rw}
                                    />
                                </div>
                                <InfoField
                                    label="Desa/Kelurahan"
                                    value={`${selectedOfficial?.addresses?.village_name} (${selectedOfficial?.village?.name_dagri})`}
                                />
                                <InfoField
                                    label="Kecamatan"
                                    value={`${selectedOfficial?.addresses?.district_name} (${selectedOfficial?.village?.district?.name_dagri})`}
                                />
                                <InfoField
                                    label="Kabupaten/Kota"
                                    value={`${selectedOfficial?.addresses?.regency_name} (${selectedOfficial?.village?.district?.regency?.name_dagri})`}
                                />
                                <InfoField
                                    label="Provinsi"
                                    value={
                                        selectedOfficial?.addresses
                                            ?.province_name
                                    }
                                />
                            </div>
                        </AccordionSection>

                        {/* Kontak */}
                        <AccordionSection
                            title="Kontak"
                            icon={<FiPhone className="text-purple-500" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                <InfoField
                                    label="Nomor Handphone"
                                    value={
                                        selectedOfficial?.contacts?.handphone
                                    }
                                />
                                <InfoField
                                    label="Email"
                                    value={
                                        selectedOfficial?.contacts?.email || "-"
                                    }
                                />
                            </div>
                        </AccordionSection>

                        {/* Dokumen Identitas */}
                        <AccordionSection
                            title="Dokumen Identitas"
                            icon={<FiFileText className="text-yellow-500" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                <InfoField
                                    label="BPJS Kesehatan"
                                    value={
                                        selectedOfficial?.identities
                                            ?.bpjs_kesehatan || "-"
                                    }
                                />
                                <InfoField
                                    label="BPJS Ketenagakerjaan"
                                    value={
                                        selectedOfficial?.identities
                                            ?.bpjs_ketenagakerjaan || "-"
                                    }
                                />
                                <InfoField
                                    label="NPWP"
                                    value={
                                        selectedOfficial?.identities?.npwp ||
                                        "-"
                                    }
                                />
                            </div>
                        </AccordionSection>

                        {/* Posisi & Jabatan */}
                        <AccordionSection
                            title="Posisi & Jabatan"
                            icon={<FiBriefcase className="text-red-500" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                <InfoField
                                    label="Jabatan"
                                    value={
                                        selectedOfficial?.position_current
                                            ?.position?.name
                                    }
                                />
                                <InfoField
                                    label="Penetap"
                                    value={
                                        selectedOfficial?.position_current
                                            ?.penetap
                                    }
                                />
                                <InfoField
                                    label="Nomor SK"
                                    value={
                                        selectedOfficial?.position_current
                                            ?.nomor_sk
                                    }
                                />
                                <InfoField
                                    label="Tanggal SK"
                                    value={
                                        selectedOfficial?.position_current
                                            ?.tanggal_sk
                                    }
                                />
                                <InfoField
                                    label="TMT Jabatan"
                                    value={
                                        selectedOfficial?.position_current
                                            ?.tmt_jabatan
                                    }
                                />
                                {selectedOfficial?.position_current
                                    ?.file_sk && (
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block text-sm font-medium text-gray-500">
                                            File SK
                                        </label>
                                        <a
                                            href={
                                                selectedOfficial
                                                    .position_current.file_sk
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 inline-flex items-center text-blue-600 hover:underline"
                                        >
                                            <FiFileText className="mr-1" />{" "}
                                            Lihat Dokumen SK
                                        </a>
                                    </div>
                                )}
                            </div>
                        </AccordionSection>
                        {/* History Status Log */}
                        {/* Detail Status Log */}
                        <AccordionSection
                            title="History Status Log"
                            icon={<FiClock className="text-green-500" />}
                        >
                            {selectedOfficial?.status_logs?.length ? (
                                <div className="p-4 space-y-6">
                                    {selectedOfficial.status_logs.map(
                                        (log, idx) => (
                                            <div
                                                key={log.id}
                                                className="border rounded-lg shadow-sm p-4 bg-white"
                                            >
                                                <h4 className="font-semibold text-gray-700 mb-3">
                                                    #{idx + 1} –{" "}
                                                    {log.status_baru?.toUpperCase()}
                                                </h4>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                                    <InfoField
                                                        label="ID Log"
                                                        value={log.id}
                                                    />
                                                    <InfoField
                                                        label="Status Sebelumnya"
                                                        value={
                                                            log.status_sebelumnya ??
                                                            "-"
                                                        }
                                                    />
                                                    <InfoField
                                                        label="Status Baru"
                                                        value={log.status_baru}
                                                    />
                                                    <InfoField
                                                        label="User ID"
                                                        value={log.user_id}
                                                    />
                                                    <InfoField
                                                        label="Dibuat"
                                                        value={new Date(
                                                            log.created_at
                                                        ).toLocaleString()}
                                                    />
                                                    <InfoField
                                                        label="Diubah"
                                                        value={new Date(
                                                            log.updated_at
                                                        ).toLocaleString()}
                                                    />
                                                    {log.keterangan && (
                                                        <div className="md:col-span-2 lg:col-span-3">
                                                            <InfoField
                                                                label="Keterangan"
                                                                value={
                                                                    log.keterangan
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="p-4 text-gray-500 italic">
                                    Belum ada history perubahan status.
                                </p>
                            )}
                        </AccordionSection>
                    </div>

                    {/* Tombol Close */}
                    <div className="flex justify-end pt-4 p-4">
                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCloseModal}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 shadow-md"
                        >
                            <FiX size={18} /> Tutup
                        </motion.button>
                    </div>
                </motion.div>
            </Modal>
        </AuthenticatedLayout>
    );
}

// Komponen AccordionSection
const AccordionSection = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <motion.div
            className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 hover:bg-gray-100 bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="text-lg">{icon}</div>
                    <h3 className="text-lg font-medium text-gray-800">
                        {title}
                    </h3>
                </div>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Komponen InfoField
const InfoField = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "md:col-span-2 lg:col-span-3" : ""}>
        <label className="block text-sm font-medium text-gray-500">
            {label}
        </label>
        <p className="mt-1 text-gray-900 font-medium">{value || "-"}</p>
    </div>
);

// Helper untuk menghitung usia
const calculateAge = (birthDate) => {
    if (!birthDate) return "-";
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
        age--;
    }
    return age;
};
