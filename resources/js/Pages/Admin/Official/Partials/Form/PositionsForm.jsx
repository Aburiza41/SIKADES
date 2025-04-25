import { motion, AnimatePresence } from "framer-motion";
import { HiTrash, HiPlus, HiPencil } from "react-icons/hi";
import { useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import axios from "axios";

export default function PositionsForm({
    positions = [],
    setPositions = () => {},
    officialPositions = [],
    setOfficialPositions = () => {},
}) {
    const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false);
    const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false);
    const [newPositionName, setNewPositionName] = useState("");
    const [newPositionDescription, setNewPositionDescription] = useState("");
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [penetap, setPenetap] = useState("");
    const [nomorSk, setNomorSk] = useState("");
    const [tanggalSk, setTanggalSk] = useState("");
    const [fileSk, setFileSk] = useState(null);
    const [mulaiJabatan, setMulaiJabatan] = useState("");
    const [selesaiJabatan, setSelesaiJabatan] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [editIndex, setEditIndex] = useState(null);

    console.log(officialPositions);

    const positionOptions = positions.map((pos) => ({
        value: pos.id,
        label: pos.name,
    }));

    const openAddOptionModal = () => {
        setIsAddOptionModalOpen(true);
    };

    const closeAddOptionModal = () => {
        setIsAddOptionModalOpen(false);
        setNewPositionName("");
        setNewPositionDescription("");
    };

    const openAddDataModal = (index = null) => {
        if (index !== null) {
            const position = officialPositions[index].position;
            setSelectedPosition({
                value: position.id,
                label: position.name,
            });
            setPenetap(position.penetap);
            setNomorSk(position.nomor_sk);
            setTanggalSk(position.tanggal_sk);
            setFileSk(position.file_sk || null);
            setMulaiJabatan(position.mulai);
            setSelesaiJabatan(position.selesai || "");
            setKeterangan(position.keterangan || "");
            setEditIndex(index);
        } else {
            setSelectedPosition(null);
            setPenetap("");
            setNomorSk("");
            setTanggalSk("");
            setFileSk(null);
            setMulaiJabatan("");
            setSelesaiJabatan("");
            setKeterangan("");
            setEditIndex(null);
        }
        setIsAddDataModalOpen(true);
    };

    const closeAddDataModal = () => {
        setIsAddDataModalOpen(false);
        setSelectedPosition(null);
        setPenetap("");
        setNomorSk("");
        setTanggalSk("");
        setFileSk(null);
        setMulaiJabatan("");
        setSelesaiJabatan("");
        setKeterangan("");
        setEditIndex(null);
    };

    const addPositionOption = async () => {
        if (!newPositionName.trim()) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Nama posisi tidak boleh kosong!",
            });
            return;
        }

        try {
            const response = await axios.post(
                "/village/official/position/store",
                {
                    name: newPositionName,
                    description: newPositionDescription,
                }
            );

            if (response.data.success) {
                const newPosition = {
                    id: response.data.data.id,
                    name: response.data.data.name,
                    description: response.data.data.description,
                };

                setPositions((prevPositions) => [
                    ...prevPositions,
                    newPosition,
                ]);
                closeAddOptionModal();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text:
                        "Gagal menambahkan posisi baru: " +
                        response.data.message,
                });
            }
        } catch (error) {
            console.error("Gagal menambahkan posisi baru:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Terjadi kesalahan saat menambahkan posisi baru. Silakan coba lagi.",
            });
            closeAddOptionModal();
        }
    };

    const savePositionData = () => {
        if (
            !selectedPosition ||
            !penetap ||
            !nomorSk ||
            !tanggalSk ||
            !mulaiJabatan
        ) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Harap isi semua field yang diperlukan!",
            });
            return;
        }

        const newPositionData = {
            position_id: selectedPosition.value,
            position_name: selectedPosition.label,
            penetap,
            nomor_sk: nomorSk,
            tanggal_sk: tanggalSk,
            file_sk: fileSk,
            mulai: mulaiJabatan,
            selesai: selesaiJabatan,
            keterangan,
        };

        if (editIndex !== null) {
            const updatedPositions = [...officialPositions];
            updatedPositions[editIndex] = newPositionData;
            setOfficialPositions(updatedPositions);
        } else {
            setOfficialPositions([...officialPositions, newPositionData]);
        }

        closeAddDataModal();
    };

    const removePosition = (index) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                const newPositions = officialPositions.filter(
                    (_, i) => i !== index
                );
                setOfficialPositions(newPositions);
                Swal.fire("Dihapus!", "Data telah dihapus.", "success");
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white w-full p-4 shadow rounded-lg mt-8"
        >
            <div className="space-y-8">
                <div className="border-b">
                    <div className="space-y-0">
                        <h1 className="text-2xl font-semibold text-gray-700">
                        C. JABATAN SAAT INI
                        </h1>
                        <p className="text-sm text-gray-500">
                            Formulir ini digunakan untuk mengisi jabatan
                            pejabat desa.
                        </p>
                    </div>
                </div>
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div className="">
                        <label className="block text-sm font-medium text-gray-700">
                            Posisi
                        </label>
                        <Select
                            options={positionOptions}
                            value={selectedPosition}
                            onChange={setSelectedPosition}
                            placeholder="Pilih Posisi"
                            isClearable
                            isSearchable
                            className="mt-1"
                        />
                    </div>

                    <div className="">
                        <label className="block text-sm font-medium text-gray-700">
                            Penetap
                        </label>
                        <input
                            type="text"
                            value={penetap}
                            onChange={(e) => setPenetap(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            placeholder="Penetap"
                        />
                    </div>

                    <div className="">
                        <label className="block text-sm font-medium text-gray-700">
                            Nomor SK
                        </label>
                        <input
                            type="text"
                            value={nomorSk}
                            onChange={(e) => setNomorSk(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            placeholder="Nomor SK"
                        />
                    </div>

                    <div className="">
                        <label className="block text-sm font-medium text-gray-700">
                            Tanggal SK
                        </label>
                        <input
                            type="date"
                            value={tanggalSk}
                            onChange={(e) => setTanggalSk(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>

                    <div className=" col-span-2 p-1">
                        <label className="block text-sm font-medium text-gray-700">
                            File SK
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setFileSk(e.target.files[0])}
                            className="m-1 block w-full border-gray-300 shadow-sm"
                        />
                    </div>

                    <div className="">
                        <label className="block text-sm font-medium text-gray-700">
                            Mulai Jabatan
                        </label>
                        <input
                            type="date"
                            value={mulaiJabatan}
                            onChange={(e) => setMulaiJabatan(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>

                    <div className="">
                        <label className="block text-sm font-medium text-gray-700">
                            Selesai Jabatan
                        </label>
                        <input
                            type="date"
                            value={selesaiJabatan}
                            onChange={(e) => setSelesaiJabatan(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>

                    <div className=" col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Keterangan
                        </label>
                        <textarea
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            placeholder="Keterangan"
                            rows="3"
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
