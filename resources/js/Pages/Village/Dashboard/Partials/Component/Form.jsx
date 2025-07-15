import { useForm } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function Form({ isEdit, initialData, onClose }) {
    const { data, setData, post, put, errors, processing, reset } = useForm(initialData);

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const onSuccess = () => {
            Swal.fire({
                title: "Success!",
                text: isEdit ? "Data successfully updated." : "Data successfully added.",
                icon: "success",
            });
            onClose();
            reset();
        };

        const onError = (errorData) => {
            Swal.fire({
                title: "Validation Failed",
                text: Object.values(errorData).flat().join(", "),
                icon: "error",
            });
        };

        isEdit
            ? put(`/admin/official/${data.id}`, { onSuccess, onError })
            : post("/admin/official", { onSuccess, onError });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 p-6 max-h-[90vh] overflow-y-auto"
        >
            {/* Nama Lengkap */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input
                    type="text"
                    name="nama_lengkap"
                    value={data.nama_lengkap}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.nama_lengkap && <p className="text-red-500 text-sm mt-1">{errors.nama_lengkap}</p>}
            </div>

            {/* NIK */}
            <div>
                <label className="block text-sm font-medium text-gray-700">NIK</label>
                <input
                    type="text"
                    name="nik"
                    value={data.nik}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.nik && <p className="text-red-500 text-sm mt-1">{errors.nik}</p>}
            </div>

            {/* NIAD */}
            <div>
                <label className="block text-sm font-medium text-gray-700">NIAD</label>
                <input
                    type="text"
                    name="niad"
                    value={data.niad}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.niad && <p className="text-red-500 text-sm mt-1">{errors.niad}</p>}
            </div>

            {/* Nomor HP */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Nomor HP</label>
                <input
                    type="text"
                    name="handphone"
                    value={data.handphone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.handphone && <p className="text-red-500 text-sm mt-1">{errors.handphone}</p>}
            </div>

            {/* Posisi */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Posisi</label>
                <input
                    type="text"
                    name="position"
                    value={data.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
            </div>

            {/* Status */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="status"
                    checked={data.status === "validasi"}
                    onChange={(e) => setData("status", e.target.checked ? "validasi" : "daftar")}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">Validasi</label>
            </div>

            {/* Buttons */}
            <div className="flex space-x-2">
                <button
                    type="submit"
                    disabled={processing}
                    className={`px-4 py-2 text-white rounded-lg transition ${isEdit ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}`}>
                    {isEdit ? "Update Data" : "Tambah Data"}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-200 transition">
                    Batal
                </button>
            </div>
        </form>
    );
}
