import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { HiUsers, HiSave } from "react-icons/hi";
import { motion } from "framer-motion";
import axios from "axios";
import OfficialIdentifyForm from "./Partials/Form/OfficialIdentifyForm";
import StudiesForm from "./Partials/Form/StudiesForm";
import OfficialTempatKerjaForm from "./Partials/Form/OfficialTempatKerjaForm";
import OrangTuaForm from "./Partials/Form/OrangTuaForm";
import HubunganForm from "./Partials/Form/HubunganForm";
import AnakForm from "./Partials/Form/AnakForm";
// import OfficialIdentityForm from "./Partials/Form/OfficialIdentityForm";
import PositionsForm from "./Partials/Form/PositionsForm";
import TrainingsForm from "./Partials/Form/TrainingsForm";
import OrganizationsForm from "./Partials/Form/OrganizationsForm";

// Ambil token CSRF
const csrfToken =
    document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

export default function UpdateOfficial({
    official: initialOfficial,
    initialPositions,
    initialOrganizations,
    position
}) {

    // State untuk data utama (Official Form)
    // const [official, setOfficial] = useState(
    //     {
    //         nik: "",
    //         nipd: "",
    //         nama_lengkap: "",
    //         gelar_depan: "",
    //         gelar_belakang: "",
    //         tempat_lahir: "",
    //         tanggal_lahir: "",
    //         jenis_kelamin: "",
    //         agama: "",
    //         status_perkawinan: "",
    //         alamat: "",
    //         rt: "",
    //         rw: "",
    //         postal: "",
    //         province: "",
    //         regency: "",
    //         district: "",
    //         village: "",
    //         gol_darah: "",
    //         handphone: "",
    //         pendidikan: "",
    //         bpjs_kesehatan: "",
    //         bpjs_ketenagakerjaan: "",
    //         npwp: "",
    //     }
    // );
    const [official, setOfficial] = useState([]);

    // State untuk data Tempat Kerja (dinamis)
    const [officialTempatKerja, setOfficialTempatKerja] = useState([]);

    // State untuk data studies (dinamis)
    const [officialStudies, setOfficialStudies] = useState([]);

    // State untuk data positions (dinamis)
    const [officialPosition, setOfficialPosition] = useState([]);

    // State untuk data trainings (dinamis)
    const [officialTrainings, setOfficialTrainings] = useState([]);

    // State untuk data organizations (dinamis)
    const [officialOrganizations, setOfficialOrganizations] = useState([]);

    const [orangTua, setOrangTua] = useState([]);
    const [hubungan, setHubungan] = useState([]);
    const [anak, setAnak] = useState([]);

    // State untuk loading dan error
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Handle submit form
    const handleSubmit = async (e, position) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();


        // Add official data
        for (const key in official) {
            // formData.append(`official[${key}]`, official[key]);
            if (key === "foto" && official[key] instanceof File) {
                formData.append(`official[${key}]`, official[key]);
            } else {
                formData.append(`official[${key}]`, official[key]);
            }
        }

        // Add tempat kerja data
        for (const key in officialTempatKerja) {
            formData.append(`tempat_kerja[${key}]`, officialTempatKerja[key]);
        }

        // Add positions data
        for (const key in officialPosition) {
            formData.append(`position[${key}]`, officialPosition[key]);
        }

        // Add organizations data
        officialOrganizations.forEach((organization, index) => {
            for (const key in organization) {
                if (key === "doc_scan" && organization[key] instanceof File) {
                    formData.append(
                        `organizations[${index}][${key}]`,
                        organization[key]
                    );
                } else {
                    formData.append(
                        `organizations[${index}][${key}]`,
                        organization[key]
                    );
                }
            }
        });

        // Add studies data
        officialStudies.forEach((study, index) => {
            for (const key in study) {
                if (key === "doc_scan" && study[key] instanceof File) {
                    formData.append(`studies[${index}][${key}]`, study[key]);
                } else {
                    formData.append(`studies[${index}][${key}]`, study[key]);
                }
            }
        });


        // Add trainings data
        officialTrainings.forEach((training, index) => {
            for (const key in training) {
                if (key === "doc_scan" && training[key] instanceof File) {
                    formData.append(`trainings[${index}][${key}]`, training[key]);
                } else {
                    formData.append(`trainings[${index}][${key}]`, training[key]);
                }
            }
        });


        // Add orang tua data
        // Add orang tua data
        orangTua.forEach((orang_tua, index) => {
        for (const key in orang_tua) {
            // Skip if value is undefined or null
            if (orang_tua[key] !== undefined && orang_tua[key] !== null) {
            formData.append(`orang_tua[${index}][${key}]`, orang_tua[key]);
            }
        }
        });

        // add Hubungan data
        for (const key in hubungan) {
            formData.append(`hubungan[${key}]`, hubungan[key]);
        }

        // Add anak data lebih dari 1
        anak.forEach((anak, index) => {
            for (const key in anak) {
                formData.append(`anak[${index}][${key}]`, anak[key]);
            }
        })

        try {
            const response = await axios.post(
                `/village/official/${position}/store`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            Swal.fire("Success", "Data berhasil diperbarui.", "success");
        } catch (error) {
            Swal.fire(
                "Error",
                error.response?.data?.message || "Terjadi kesalahan",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={(
                <div className="text-2xl font-semibold leading-tight">
                    Tambah Pejabat Desa
                    <p className="text-sm font-thin mt-1">
                        Formulir Penambahan Data Pejabat Desa
                    </p>
                </div>
            )}
            breadcrumb={[{
                name: "Tambah Official",
                path: `/village/official/create`,
                active: true,
                icon: <HiUsers className="w-5 h-5 mr-3" />,
            }]}
        >
            <Head title="Update Official" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4"
            >
                <form
                    onSubmit={(e) => handleSubmit(e, position)}
                    className="space-y-8"
                >
                    {/* A. Identitas */}
                    <OfficialIdentifyForm
                        official={official}
                        setOfficial={setOfficial}
                        errors={errors}
                    />

                    <OfficialTempatKerjaForm
                        tempat_kerja={officialTempatKerja}
                        setTempatKerja={setOfficialTempatKerja}
                        errors={errors}
                    />

                    <PositionsForm
                        position={position}
                        positions={initialPositions}
                        officialPosition={officialPosition}
                        setOfficialPosition={setOfficialPosition}
                    />

                    <OrganizationsForm
                        organizations={initialOrganizations}
                        setOrganizations={setOfficialOrganizations}
                        officialOrganizations={officialOrganizations}
                        setOfficialOrganizations={setOfficialOrganizations}
                    />

                    <StudiesForm
                        officialStudies={officialStudies}
                        setOfficialStudies={setOfficialStudies}
                    />

                    <TrainingsForm
                        officialTrainings={officialTrainings}
                        setOfficialTrainings={setOfficialTrainings}
                    />

                    <OrangTuaForm
                        orang_tua={orangTua}
                        setOrangTua={setOrangTua}
                        errors={errors}
                    />

                    <HubunganForm
                        hubungan={hubungan}
                        setHubungan={setHubungan}
                        errors={errors}
                    />

                    <AnakForm
                        anak={anak}
                        setAnak={setAnak}
                        errors={errors}
                    />

                    {/* Tombol Submit */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex justify-end mt-8"
                    >
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                            disabled={isLoading}
                        >
                            <HiSave className="mr-2" />
                            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </AuthenticatedLayout>
    );
}
