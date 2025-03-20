import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import Modal from "../Section/Modal";

const EditVillageModal = ({ isOpen, onClose, editedVillage, setEditedVillage }) => {
  const [logoFile, setLogoFile] = useState(null);
  const [websiteError, setWebsiteError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const MAX_LOGO_SIZE = 2 * 1024 * 1024;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (logoFile && logoFile.size > MAX_LOGO_SIZE) {
      Swal.fire("Error", "Logo file size exceeds the maximum limit of 2MB.", "error");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", editedVillage.description);
    formData.append("website", editedVillage.website);
    if (logoFile) formData.append("logo", logoFile);

    try {
      const response = await axios.post(`/village/profile/${editedVillage.id}`, formData);

      if (response.data.success) {
        Swal.fire("Success", "Village profile updated successfully.", "success").then(() => {
          window.location.reload(); // Reload halaman setelah alert dikonfirmasi
        });

        setEditedVillage(response.data);
        onClose();
      } else {
        Swal.fire("Error", "Failed to update village profile.", "error");
      }

    } catch (error) {
      console.error("Error updating village profile:", error);
      Swal.fire("Error", "Failed to update village profile.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Village">
      <form onSubmit={handleFormSubmit} className="p-4" >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={editedVillage.description || ""}
            onChange={(e) => setEditedVillage({ ...editedVillage, description: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Website</label>
          <input
            type="url"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={editedVillage.website || ""}
            onChange={(e) => {
              setEditedVillage({ ...editedVillage, website: e.target.value });
              setWebsiteError("");
            }}
          />
          {websiteError && <p className="text-red-500 text-sm">{websiteError}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Logo</label>
          <input
            type="file"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            onChange={(e) => setLogoFile(e.target.files[0])}
            accept="image/*"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditVillageModal;
