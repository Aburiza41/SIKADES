import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { HiUsers, HiSave } from "react-icons/hi";
import { motion } from "framer-motion";
import axios from "axios";
import OfficialForm from "./Partials/Form/OfficialForm";
import OfficialAddressForm from "./Partials/Form/OfficialAddressForm";
import StudiesForm from "./Partials/Form/StudiesForm";
import OfficialContactForm from "./Partials/Form/OfficialContactForm";
import OfficialIdentityForm from "./Partials/Form/OfficialIdentityForm";
import PositionsForm from "./Partials/Form/PositionsForm";
import TrainingsForm from "./Partials/Form/TrainingsForm";
import OrganizationsForm from "./Partials/Form/OrganizationsForm";


// Ambil token CSRF
const csrfToken =
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") || "";

export default function UpdateOfficial({
    official: initialOfficial,
    addresses: initialAddresses,
    contacts: initialContacts,
    identities: initialIdentities,
    studies: initialStudies,
    positions: initialPositions,
    trainings: initialTrainings,
    organizations: initialOrganizations,
    opsPositions: initialOpsPositions,
    opsTrainings: initialOpsTrainings,
    opsOrganizations: initialOpsOrganizations,
    opsStudies: initialOpsStudies,
}) {
    // Debugging all props
    // console.log('official',initialOfficial);
    // console.log('addresses',initialAddresses);
    // console.log('contacts',initialContacts);
    // console.log('identities',initialIdentities);
    // console.log('studies',initialStudies);
    // console.log('positions',initialPositions);
    // console.log('trainings',initialTrainings);
    // console.log('organizations',initialOrganizations);

    // console.log(initialOpsPositions);
    // console.log(initialOpsTrainings);
    // console.log(initialOpsOrganizations);
    // console.log(initialOpsStudies);

    // State untuk data utama
    const [official, setOfficial] = useState(initialOfficial);
    // console.log(initialOfficial);

    // State untuk data alamat (Address Form)
    const [address, setAddress] = useState(initialAddresses);

    // State untuk data kontak (Contact Form)
    const [contact, setContact] = useState(initialContacts);

    // State untuk data identitas (Identity Form)
    const [identity, setIdentity] = useState(initialIdentities);

    // State untuk data studies (dinamis)
    const [officialStudies, setOfficialStudies] = useState(
        initialStudies
    );

    // State untuk data positions (dinamis)
    const [officialPositions, setOfficialPositions] = useState(
        initialPositions
    );

    // State untuk data trainings (dinamis)
    const [officialTrainings, setOfficialTrainings] = useState(
        initialTrainings
    );

    // State untuk data organizations (dinamis)
    const [officialOrganizations, setOfficialOrganizations] = useState(
        initialOrganizations
    );

    // State untuk data wilayah
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    // State untuk loading dan error
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Ambil data provinsi
    useEffect(() => {
        axios
            .get("/village/bps/wilayah")
            .then((response) => setProvinces(response.data))
            .catch((error) =>
                console.error("Error fetching provinces:", error)
            );
    }, []);

    // Handle perubahan provinsi
    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        const selectedProvince = provinces.find(
            (province) => province.kode_bps === e.target.value
        );
        setAddress({
            ...address,
            province_code: selectedProvince.kode_bps,
            province_name: selectedProvince.nama_bps,
            regency_code: "",
            regency_name: "",
            district_code: "",
            district_name: "",
            village_code: "",
            village_name: "",
        });
        axios
            .get(`/village/bps/wilayah/kabupaten/${provinceCode}`)
            .then((response) => setRegencies(response.data))
            .catch((error) =>
                console.error("Error fetching regencies:", error)
            );
    };

    // Handle perubahan kabupaten
    const handleRegencyChange = (e) => {
        const regencyCode = e.target.value;
        const selectedRegency = regencies.find(
            (regency) => regency.kode_bps === e.target.value
        );
        setAddress({
            ...address,
            regency_code: selectedRegency.kode_bps,
            regency_name: selectedRegency.nama_bps,
            district_code: "",
            district_name: "",
            village_code: "",
            village_name: "",
        });
        axios
            .get(`/village/bps/wilayah/kecamatan/${regencyCode}`)
            .then((response) => setDistricts(response.data))
            .catch((error) =>
                console.error("Error fetching districts:", error)
            );
    };

    // Handle perubahan kecamatan
    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        const selectedDistrict = districts.find(
            (district) => district.kode_bps === e.target.value
        );
        setAddress({
            ...address,
            district_code: selectedDistrict.kode_bps,
            district_name: selectedDistrict.nama_bps,
            village_code: "",
            village_name: "",
        });
        axios
            .get(`/village/bps/wilayah/desa/${districtCode}`)
            .then((response) => setVillages(response.data))
            .catch((error) => console.error("Error fetching villages:", error));
    };

    const handleVillageChange = (e) => {
        const selectedVillage = villages.find(
            (village) => village.kode_bps === e.target.value
        );
        setAddress({
            ...address,
            village_code: selectedVillage.kode_bps,
            village_name: selectedVillage.nama_bps,
        });
    };

    // Validasi form
    const validateForm = () => {
        const newErrors = {};

        if (!official.nik) newErrors.nik = "NIK wajib diisi";
        if (!official.nama_lengkap)
            newErrors.nama_lengkap = "Nama lengkap wajib diisi";
        if (!official.tanggal_lahir)
            newErrors.tanggal_lahir = "Tanggal lahir wajib diisi";
        if (!official.jenis_kelamin)
            newErrors.jenis_kelamin = "Jenis kelamin wajib diisi";
        if (!official.alamat) newErrors.alamat = "Alamat wajib diisi";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit form
    const handleSubmit = (e) => {
        e.preventDefault();

        // if (!validateForm()) {
        //     Swal.fire("Error", "Tolong periksa kembali form Anda.", "error");
        //     return;
        // }

        setIsLoading(true);

        // Buat FormData untuk mengirim file
        const formData = new FormData();

        // Tambahkan data utama
        for (const key in official) {
            formData.append(`official[${key}]`, official[key]);
        }

        // Tambahkan data alamat
        for (const key in address) {
            formData.append(`address[${key}]`, address[key]);
        }

        // Tambahkan data kontak
        for (const key in contact) {
            formData.append(`contact[${key}]`, contact[key]);
        }

        // Tambahkan data identitas
        for (const key in identity) {
            formData.append(`identity[${key}]`, identity[key]);
        }

        // Tambahkan data studies
        officialStudies.forEach((study, index) => {
            for (const key in study) {
                if (key === "doc_scan" && study[key] instanceof File) {
                    formData.append(`studies[${index}][${key}]`, study[key]);
                } else {
                    formData.append(`studies[${index}][${key}]`, study[key]);
                }
            }
        });

        // Tambahkan data positions
        officialPositions.forEach((position, index) => {
            for (const key in position) {
                if (key === "foto" && position[key] instanceof File) {
                    formData.append(
                        `positions[${index}][${key}]`,
                        position[key]
                    );
                } else {
                    formData.append(
                        `positions[${index}][${key}]`,
                        position[key]
                    );
                }
            }
        });

        // Tambahkan data trainings
        officialTrainings.forEach((training, index) => {
            for (const key in training) {
                if (key === "doc_scan" && training[key] instanceof File) {
                    formData.append(
                        `trainings[${index}][${key}]`,
                        training[key]
                    );
                } else {
                    formData.append(
                        `trainings[${index}][${key}]`,
                        training[key]
                    );
                }
            }
        });

        // Tambahkan data organizations
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

        // Kirim data ke backend menggunakan metode PUT
        router.post(`/village/official/${official.nik}/update`, formData, {
            headers: {
                "Content-Type": "multipart/form-data", // Penting untuk upload file
            },
            onSuccess: () => {
                Swal.fire("Success", "Data berhasil diperbarui.", "success");
            },
            onError: (errors) => {
                Swal.fire("Error", Object.values(errors).join(", "), "error");
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Update Official
                    <p className="text-sm font-thin mt-1">
                        Formulir Pembaruan Data Official
                    </p>
                </div>
            }
            breadcrumb={[
                {
                    name: "Update Official",
                    path: `/village/official/update/${official.id}`,
                    active: true,
                    icon: <HiUsers className="w-5 h-5 mr-3" />,
                },
            ]}
        >
            <Head title="Update Official" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form Data Utama */}
                    <OfficialForm
                        official={official}
                        setOfficial={setOfficial}
                        errors={errors}
                    />

                    {/* Form Data Alamat */}
                    <OfficialAddressForm
                        address={address}
                        setAddress={setAddress}
                        provinces={provinces}
                        regencies={regencies}
                        districts={districts}
                        villages={villages}
                        handleProvinceChange={handleProvinceChange}
                        handleRegencyChange={handleRegencyChange}
                        handleDistrictChange={handleDistrictChange}
                        handleVillageChange={handleVillageChange}
                        errors={errors}
                    />

                    {/* Form Data Kontak */}
                    <OfficialContactForm
                        contact={contact}
                        setContact={setContact}
                        errors={errors}
                    />

                    {/* Form Data Identitas */}
                    <OfficialIdentityForm
                        identity={identity}
                        setIdentity={setIdentity}
                        errors={errors}
                    />

                    {/* Form Data Studies */}
                    <StudiesForm
                        studies={initialOpsStudies}
                        setStudies={setOfficialStudies}
                        officialStudies={officialStudies}
                        setOfficialStudies={setOfficialStudies}
                    />

                    {/* Form Data Positions */}
                    <PositionsForm
                        positions={initialOpsPositions}
                        setPositions={setOfficialPositions}
                        officialPositions={officialPositions}
                        setOfficialPositions={setOfficialPositions}
                    />

                    {/* Form Data Trainings */}
                    <TrainingsForm
                        trainings={initialOpsTrainings}
                        setTrainings={setOfficialTrainings}
                        officialTrainings={officialTrainings}
                        setOfficialTrainings={setOfficialTrainings}
                    />

                    {/* Form Data Organizations */}
                    <OrganizationsForm
                        organizations={initialOpsOrganizations}
                        setOrganizations={setOfficialOrganizations}
                        officialOrganizations={officialOrganizations}
                        setOfficialOrganizations={setOfficialOrganizations}
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
                            <HiSave className="mr-2" />{" "}
                            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </AuthenticatedLayout>
    );
}
