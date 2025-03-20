import { useState } from "react";
import Modal from "../Section/Modal";

export default function FilterModal({ isOpen, onClose, onFilter }) {
    const [filters, setFilters] = useState({ role: "", year: "" });

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        onFilter(filters); // Kirim data filter ke komponen List
        onClose(); // Tutup modal
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Filter Data Pengguna</h2>
                <div className="grid grid-cols-1 gap-4">
                    {/* Filter Role */}
                    <div>
                        <label className="block text-sm font-medium">Role</label>
                        <select
                            name="role"
                            value={filters.role}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Pilih Role</option>
                            <option value="village">Village</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
                        onClick={onClose}
                    >
                        Batal
                    </button>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                        onClick={handleSubmit}
                    >
                        Terapkan
                    </button>
                </div>
            </div>
        </Modal>
    );
}
