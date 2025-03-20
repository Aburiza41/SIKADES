import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import VillageInfo from "./Partials/Component/VillageInfo";
import DescriptionList from "./Partials/Component/DescriptionList";
import DescriptionModal from "./Partials/Section/Modal";
import EditVillageModal from "./Partials/Component/EditVillageModal";
import PDF from "./Partials/Component/PDF";
import { HiUsers } from "react-icons/hi";
import List from "./Partials/Component/List";

// Ambil token CSRF
const csrfToken =
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") || "";

export default function Profile({ village, descriptionLatest, descriptions }) {
    const { flash } = usePage().props;
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [isEditDescription, setIsEditDescription] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [newDescription, setNewDescription] = useState({
        score_idm: "",
        status_idm: "",
        score_prodeskel: "",
        score_epdeskel: "",
        status: "",
        classification: "",
        year: new Date().getFullYear().toString(),
    });

    const [isEditVillageModalOpen, setIsEditVillageModalOpen] = useState(false);
    const [editedVillage, setEditedVillage] = useState({ ...village });

    // Handle flash messages
    useEffect(() => {
        if (flash.success) Swal.fire("Success", flash.success, "success");
        if (flash.error) Swal.fire("Error", flash.error, "error");
    }, [flash]);

    // Handle add description
    const handleAddDescription = () => {
        setIsEditDescription(false);
        setIsViewMode(false);
        setIsDescriptionModalOpen(true);
        setNewDescription({
            score_idm: "",
            status_idm: "",
            score_prodeskel: "",
            score_epdeskel: "",
            status: "",
            classification: "",
            year: new Date().getFullYear().toString(),
        });
    };

    // Handle edit description
    const handleEditDescription = (description) => {
        setSelectedDescription(description);
        setIsEditDescription(true);
        setIsViewMode(false);
        setIsDescriptionModalOpen(true);
        setNewDescription({ ...description });
    };

    // Handle view description
    const handleViewDescription = (description) => {
        setSelectedDescription(description);
        setIsEditDescription(false);
        setIsViewMode(true);
        setIsDescriptionModalOpen(true);
    };

    // Handle delete description
    const handleDeleteDescription = (id) => {
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
                router.delete(`/village/profile/description/delete/${id}`, {
                    onSuccess: () => {
                        Swal.fire(
                            "Deleted!",
                            "Data has been successfully deleted.",
                            "success"
                        );
                        router.reload();
                    },
                    onError: () => {
                        Swal.fire(
                            "Error",
                            "An error occurred while deleting the data.",
                            "error"
                        );
                    },
                });
            }
        });
    };

    // Handle submit description form
    const handleSubmitDescription = (e) => {
        e.preventDefault();
        const dataToSubmit = { ...newDescription, village_id: village.id };
        const url = isEditDescription
        ? `/village/profile/description/update/${selectedDescription.id}`
        : "/village/profile/description/store";
        const method = isEditDescription ? "post" : "post";

        router[method](url, dataToSubmit, {
            onSuccess: () => {
                Swal.fire(
                    "Success",
                    `Description ${
                        isEditDescription ? "updated" : "added"
                    } successfully.`,
                    "success"
                );
                setIsDescriptionModalOpen(false);
                router.reload();
            },
            onError: (errors) => {
                Swal.fire("Error", Object.values(errors).join(", "), "error");
            },
        });
    };

    // Handle close description modal
    const handleCloseDescriptionModal = () => {
        setIsDescriptionModalOpen(false);
        setIsEditDescription(false);
        setIsViewMode(false);
        setSelectedDescription(null);
        setNewDescription({
            score_idm: "",
            status_idm: "",
            score_prodeskel: "",
            score_epdeskel: "",
            status: "",
            classification: "",
            year: new Date().getFullYear().toString(),
        });
    };

    // Handle edit village
    const handleEditVillage = () => {
        setIsEditVillageModalOpen(true);
        setEditedVillage({ ...village });
    };

    // Handle print description
    const handlePrintDescription = (description) => {
        PDF(description);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-2xl font-semibold leading-tight">
                    Profil Desa
                    <p className="text-sm font-thin mt-1">
                        Deskripsi dan Data Desa
                    </p>
                </div>
            }
            breadcrumb={[
                {
                    name: "Profil",
                    path: "/village/profile",
                    active: true,
                    icon: <HiUsers className="w-5 h-5 mr-3" />,
                },
            ]}
        >
            <Head title="Village Profile" />
            <div className="p-4">
                <VillageInfo
                    village={village}
                    handleEditVillage={handleEditVillage}
                />
                <DescriptionList
                    description={descriptionLatest}
                    onEdit={handleEditDescription}
                    onDelete={handleDeleteDescription}
                    onView={handleViewDescription}
                    onPrint={handlePrintDescription}
                />

                <List
                    descriptions={descriptions}
                    onView={handleViewDescription}
                    onPrint={handlePrintDescription}
                    onAdd={handleAddDescription}
                />
                <DescriptionModal
                    isOpen={isDescriptionModalOpen && !isViewMode}
                    onClose={handleCloseDescriptionModal}
                    title={
                        isEditDescription
                            ? "Edit Description"
                            : "Add Description"
                    }
                >
                    <form onSubmit={handleSubmitDescription}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Score IDM
                            </label>
                            <input
                                type="number"
                                value={newDescription.score_idm}
                                onChange={(e) =>
                                    setNewDescription({
                                        ...newDescription,
                                        score_idm: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="Masukkan Score IDM"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Status IDM
                            </label>
                            <input
                                type="text"
                                value={newDescription.status_idm}
                                onChange={(e) =>
                                    setNewDescription({
                                        ...newDescription,
                                        status_idm: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="Masukkan Status IDM"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Score Prodeskel
                            </label>
                            <input
                                type="number"
                                value={newDescription.score_prodeskel}
                                onChange={(e) =>
                                    setNewDescription({
                                        ...newDescription,
                                        score_prodeskel: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="Masukkan Score Prodeskel"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Score Epdeskel
                            </label>
                            <input
                                type="number"
                                value={newDescription.score_epdeskel}
                                onChange={(e) =>
                                    setNewDescription({
                                        ...newDescription,
                                        score_epdeskel: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="Masukkan Score Epdeskel"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <input
                                type="text"
                                value={newDescription.status}
                                onChange={(e) =>
                                    setNewDescription({
                                        ...newDescription,
                                        status: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="Masukkan Status"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Classification
                            </label>
                            <textarea
                                value={newDescription.classification}
                                onChange={(e) =>
                                    setNewDescription({
                                        ...newDescription,
                                        classification: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                rows={4}
                                placeholder="Masukkan Klasifikasi"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Year
                            </label>
                            <input
                                type="number"
                                value={newDescription.year}
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleCloseDescriptionModal}
                                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                {isEditDescription ? "Update" : "Save"}
                            </button>
                        </div>
                    </form>
                </DescriptionModal>
                <DescriptionModal
                    isOpen={isDescriptionModalOpen && isViewMode}
                    onClose={handleCloseDescriptionModal}
                    title="View Description"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Score IDM
                            </label>
                            <p className="mt-1 text-gray-900">
                                {selectedDescription?.score_idm}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Status IDM
                            </label>
                            <p className="mt-1 text-gray-900">
                                {selectedDescription?.status_idm}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Score Prodeskel
                            </label>
                            <p className="mt-1 text-gray-900">
                                {selectedDescription?.score_prodeskel}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Year
                            </label>
                            <p className="mt-1 text-gray-900">
                                {selectedDescription?.year}
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleCloseDescriptionModal}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </DescriptionModal>
                <EditVillageModal
                    isOpen={isEditVillageModalOpen}
                    onClose={() => setIsEditVillageModalOpen(false)}
                    editedVillage={editedVillage}
                    setEditedVillage={setEditedVillage}
                />
            </div>
        </AuthenticatedLayout>
    );
}
