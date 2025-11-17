import { useForm } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function SubscriberForm({ isEdit, initialData, onClose }) {
    const { data, setData, post, put, errors, processing, reset } = useForm(initialData);

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const onSuccess = () => {
            Swal.fire({
                title: "Berhasil!",
                text: isEdit ? "Data berhasil diperbarui." : "Data berhasil ditambahkan.",
                icon: "success",
            });
            onClose();
            reset();
        };

        const onError = (errorData) => {
            Swal.fire({
                title: "Validasi Gagal",
                text: Object.values(errorData).flat().join(", "),
                icon: "error",
            });
        };

        isEdit
            ? post(`/admin/aparatus/${data.id}`, { onSuccess, onError })
            : post("/admin/aparatus", { onSuccess, onError });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 p-6 max-h-[90vh] overflow-y-auto"
        >
            {/* Alert Error Global */}
            {/* {Object.keys(errors).length > 0 && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-1 mb-4">
                    <p><strong>Terjadi kesalahan!</strong></p>
                    <ul className="list-disc pl-5">
                        {Object.entries(errors).map(([key, value], index) => (
                            <li key={index}>{value}</li>
                        ))}
                    </ul>
                </div>
            )} */}

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Judul</label>
                <input
                    type="text"
                    name="title"
                    value={data.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                    name="description"
                    value={data.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Price */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Harga</label>
                <input
                    type="number"
                    name="price"
                    value={data.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700">URL Gambar</label>
                <input
                    type="text"
                    name="image"
                    value={data.image}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>

            {/* Slug */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                    type="text"
                    name="slug"
                    value={data.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
            </div>

            {/* Is Active */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="is_active"
                    checked={data.is_active}
                    onChange={(e) => setData("is_active", e.target.checked)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">Aktif</label>
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
