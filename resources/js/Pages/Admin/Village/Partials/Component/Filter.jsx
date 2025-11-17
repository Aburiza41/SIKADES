import { useState, useEffect } from "react";
import Modal from "../Section/Modal";

export default function Filter({ isOpen, onClose, onFilter, csrfToken }) {
    const [filters, setFilters] = useState({
        year: "2024",
        district: "",
        subdistrict: "",
        village: "",
        gender: "",
        period: "",
        education: "",
        bloodType: "",
        religion: "",
        position: "",
    });

    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    // Fetch regencies on mount
    useEffect(() => {
        fetch("/admin/village/regencies", {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json',
            },
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setRegencies(data.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching regencies:", error);
            });
    }, [csrfToken]);

    // Fetch districts when district (regency) changes
    useEffect(() => {
        if (filters.district) {
            fetch(`/admin/village/districts/${filters.district}`, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'include',
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setDistricts(data.data);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching districts:", error);
                });
        } else {
            setDistricts([]);
            setFilters((prev) => ({ ...prev, subdistrict: "", village: "" }));
        }
    }, [filters.district, csrfToken]);

    // Fetch villages when subdistrict (district) changes
    useEffect(() => {
        if (filters.subdistrict) {
            fetch(`/api/villages/${filters.subdistrict}`, {
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setVillages(data.data);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching villages:", error);
                });
        } else {
            setVillages([]);
            setFilters((prev) => ({ ...prev, village: "" }));
        }
    }, [filters.subdistrict]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'district') {
            setFilters((prev) => ({ ...prev, district: value, subdistrict: "", village: "" }));
        } else if (name === 'subdistrict') {
            setFilters((prev) => ({ ...prev, subdistrict: value, village: "" }));
        } else {
            setFilters({ ...filters, [name]: value });
        }
    };

    const handleSubmit = () => {
        onFilter(filters);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Filter Data Pejabat Desa</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Tahun</label>
                        <input type="text" name="year" value={filters.year} className="w-full p-2 border rounded" disabled />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Periode ke</label>
                        <input type="text" name="period" value={filters.period} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Pilih Kabupaten</label>
                        <select name="district" value={filters.district} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="">Pilih Kabupaten</option>
                            {regencies.map((regency) => (
                                <option key={regency.value} value={regency.value}>
                                    {regency.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Pilih Kecamatan</label>
                        <select name="subdistrict" value={filters.subdistrict} onChange={handleChange} className="w-full p-2 border rounded" disabled={!filters.district}>
                            <option value="">Pilih Kecamatan</option>
                            {districts.map((district) => (
                                <option key={district.value} value={district.value}>
                                    {district.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Pilih Desa</label>
                        <select name="village" value={filters.village} onChange={handleChange} className="w-full p-2 border rounded" disabled={!filters.subdistrict}>
                            <option value="">Pilih Desa</option>
                            {villages.map((village) => (
                                <option key={village.value} value={village.value}>
                                    {village.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Jenis Kelamin</label>
                        <select name="gender" value={filters.gender} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="">Pilih Jenis Kelamin</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Riwayat Pendidikan</label>
                        <select name="education" value={filters.education} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="">Pilih Riwayat Pendidikan</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Golongan Darah</label>
                        <select name="bloodType" value={filters.bloodType} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="">Pilih Golongan Darah</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Agama</label>
                        <select name="religion" value={filters.religion} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="">Pilih Agama</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Jabatan</label>
                        <select name="position" value={filters.position} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="">Pilih Jabatan</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2" onClick={onClose}>Batal</button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={handleSubmit}>Terapkan</button>
                </div>
            </div>
        </Modal>
    );
}
