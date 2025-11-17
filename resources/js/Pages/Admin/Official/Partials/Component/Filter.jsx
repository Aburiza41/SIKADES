import { useState, useEffect } from "react";

export default function Filter({ onFilter }) {
    const [filters, setFilters] = useState({
        search: "",
        education: "",
        kabupaten: "",
        kecamatan: "",
        desa: "",
        jenis_kelamin: "",
        agama: "",
        golongan_darah: "",
        pelatihan: "",
        organisasi: "",
        status: "",
    });

    const [kabupaten, setKabupaten] = useState([]);
    const [kecamatan, setKecamatan] = useState([]);
    const [desa, setDesa] = useState([]);

    const educationOptions = [
        "SD/MI",
        "SMP/MTS",
        "SMA/SMK/MA",
        "D1",
        "D2",
        "D3",
        "D4",
        "S1",
        "S2",
        "S3",
    ];

    const genderOptions = [
        "Laki-laki",
        "Perempuan",
    ];

    const religionOptions = [
        "Islam",
        "Kristen Protestan",
        "Kristen Katolik",
        "Hindu",
        "Buddha",
        "Konghucu",
        "Lainnya",
    ];

    const bloodTypeOptions = [
        "A",
        "B",
        "AB",
        "O",
    ];

    const trainingOptions = [
        "Ya",
        "Tidak",
    ];

    const organizationOptions = [
        "Ya",
        "Tidak",
    ];

    const statusOptions = [
        "daftar",
        "validasi",
        "tolak",
        "proses",
    ];

    // Fetch kabupaten on mount
    useEffect(() => {
        fetch("/local/regencies", {
            headers: {
                'Accept': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setKabupaten(data.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching kabupaten:", error);
            });
    }, []);

    // Fetch kecamatan when kabupaten changes
    useEffect(() => {
        if (filters.kabupaten) {
            fetch(`/local/districts/${filters.kabupaten}`, {
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setKecamatan(data.data);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching kecamatan:", error);
                });
        } else {
            setKecamatan([]);
            setFilters((prev) => ({ ...prev, kecamatan: "", desa: "" }));
        }
    }, [filters.kabupaten]);

    // Fetch desa when kecamatan changes
    useEffect(() => {
        if (filters.kecamatan) {
            fetch(`/local/villages/${filters.kecamatan}`, {
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setDesa(data.data);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching desa:", error);
                });
        } else {
            setDesa([]);
            setFilters((prev) => ({ ...prev, desa: "" }));
        }
    }, [filters.kecamatan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newFilters;
        if (name === 'kabupaten') {
            newFilters = { ...filters, kabupaten: value, kecamatan: "", desa: "" };
        } else if (name === 'kecamatan') {
            newFilters = { ...filters, kecamatan: value, desa: "" };
        } else {
            newFilters = { ...filters, [name]: value };
        }
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            search: "",
            education: "",
            kabupaten: "",
            kecamatan: "",
            desa: "",
            jenis_kelamin: "",
            agama: "",
            golongan_darah: "",
            pelatihan: "",
            organisasi: "",
            status: "",
        };
        setFilters(resetFilters);
        onFilter(resetFilters);
    };

    return (
        <>
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 my-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleChange}
                            placeholder="Cari nama, NIK, NIPD..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan</label>
                        <select
                            name="education"
                            value={filters.education}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Semua Pendidikan</option>
                            {educationOptions.map((education) => (
                                <option key={education} value={education}>
                                    {education}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten</label>
                        <select
                            name="kabupaten"
                            value={filters.kabupaten}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Semua Kabupaten</option>
                            {kabupaten.map((k) => (
                                <option key={k.value} value={k.value}>
                                    {k.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                        <select
                            name="kecamatan"
                            value={filters.kecamatan}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!filters.kabupaten}
                        >
                            <option value="">Semua Kecamatan</option>
                            {kecamatan.map((k) => (
                                <option key={k.value} value={k.value}>
                                    {k.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
                        <select
                            name="desa"
                            value={filters.desa}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!filters.kecamatan}
                        >
                            <option value="">Semua Desa</option>
                            {desa.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                        <select
                            name="jenis_kelamin"
                            value={filters.jenis_kelamin}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Semua</option>
                            {genderOptions.map((gender) => (
                                <option key={gender} value={gender}>
                                    {gender}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
                        <select
                            name="agama"
                            value={filters.agama}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Semua Agama</option>
                            {religionOptions.map((religion) => (
                                <option key={religion} value={religion}>
                                    {religion}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Golongan Darah</label>
                        <select
                            name="golongan_darah"
                            value={filters.golongan_darah}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Semua</option>
                            {bloodTypeOptions.map((bloodType) => (
                                <option key={bloodType} value={bloodType}>
                                    {bloodType}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pelatihan</label>
                        <select
                            name="pelatihan"
                            value={filters.pelatihan}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Semua</option>
                            {trainingOptions.map((training) => (
                                <option key={training} value={training}>
                                    {training}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organisasi</label>
                        <select
                            name="organisasi"
                            value={filters.organisasi}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Semua</option>
                            {organizationOptions.map((org) => (
                                <option key={org} value={org}>
                                    {org}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Semua Status</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status === "daftar" ? "Daftar" :
                                     status === "validasi" ? "Terima" :
                                     status === "tolak" ? "Tolak" :
                                     status === "proses" ? "Proses" : status}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* <div className="flex justify-end items-end my-4 gap-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Reset
                        </button>
                    </div> */}
                </div>
            </div>

        </>
    );
}
