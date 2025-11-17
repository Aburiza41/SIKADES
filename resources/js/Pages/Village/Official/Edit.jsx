import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { HiUsers, HiSave, HiTrash } from "react-icons/hi";
import { motion } from "framer-motion";
import axios from "axios";
import OfficialIdentifyForm from "./Partials/Form/OfficialIdentifyForm";
import StudiesForm from "./Partials/Form/StudiesForm";
import OfficialTempatKerjaForm from "./Partials/Form/OfficialTempatKerjaForm";
import OrangTuaForm from "./Partials/Form/OrangTuaForm";
import HubunganForm from "./Partials/Form/HubunganForm";
import AnakForm from "./Partials/Form/AnakForm";
import PositionsForm from "./Partials/Form/PositionsForm";
import TrainingsForm from "./Partials/Form/TrainingsForm";
import OrganizationsForm from "./Partials/Form/OrganizationsForm";

// Ambil token CSRF
const csrfToken =
  document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

export default function UpdateOfficial({
  official: initialOfficial,
  studies: initialStudies,
  initialPositions,
  position,
  initialOrganizations,
  currentPosition,
  anak: initialAnak,
  initialTrainings,
  orang_tua: initialOrangtua,
  pasangan: initialPasangan,
  id,
  jabatan,
  tempat_kerja: initialTempatKerja,
}) {
  // Fungsi untuk mendapatkan data dari localStorage dengan fallback ke props
  const getSavedData = (key, defaultValue) => {
    const saved = localStorage.getItem(`officialForm_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // Fungsi untuk menyimpan data ke localStorage
  const saveDataToLocal = (key, data) => {
    localStorage.setItem(`officialForm_${key}`, JSON.stringify(data));
  };

  // Inisialisasi state dengan data dari server (props)
  const [official, setOfficial] = useState(initialOfficial || {});
  const [officialTempatKerja, setOfficialTempatKerja] = useState(initialTempatKerja || {});
  const [officialStudies, setOfficialStudies] = useState(initialStudies || []);
  const [officialPosition, setOfficialPosition] = useState(currentPosition || {});
  const [officialTrainings, setOfficialTrainings] = useState(initialTrainings || []);
  const [officialOrganizations, setOfficialOrganizations] = useState(initialOrganizations || []);
  const [orangTua, setOrangTua] = useState(initialOrangtua || []);
  const [hubungan, setHubungan] = useState(initialPasangan || {});
  const [anak, setAnak] = useState(initialAnak || []);

  // State untuk loading dan error
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Effect untuk menyimpan data ke localStorage setiap ada perubahan
  useEffect(() => {
    saveDataToLocal("official", official);
  }, [official]);

  useEffect(() => {
    saveDataToLocal("officialTempatKerja", officialTempatKerja);
  }, [officialTempatKerja]);

  useEffect(() => {
    saveDataToLocal("officialStudies", officialStudies);
  }, [officialStudies]);

  useEffect(() => {
    saveDataToLocal("officialPosition", officialPosition);
  }, [officialPosition]);

  useEffect(() => {
    saveDataToLocal("officialTrainings", officialTrainings);
  }, [officialTrainings]);

  useEffect(() => {
    saveDataToLocal("officialOrganizations", officialOrganizations);
  }, [officialOrganizations]);

  useEffect(() => {
    saveDataToLocal("orangTua", orangTua);
  }, [orangTua]);

  useEffect(() => {
    saveDataToLocal("hubungan", hubungan);
  }, [hubungan]);

  useEffect(() => {
    saveDataToLocal("anak", anak);
  }, [anak]);

  // Effect untuk menangani beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasData =
        Object.keys(official).length > 0 ||
        Object.keys(officialTempatKerja).length > 0 ||
        officialStudies.length > 0 ||
        Object.keys(officialPosition).length > 0 ||
        officialTrainings.length > 0 ||
        officialOrganizations.length > 0 ||
        orangTua.length > 0 ||
        Object.keys(hubungan).length > 0 ||
        anak.length > 0;

      if (hasData) {
        e.preventDefault();
        e.returnValue =
          "Anda memiliki data yang belum tersimpan. Apakah Anda yakin ingin meninggalkan halaman ini?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    official,
    officialTempatKerja,
    officialStudies,
    officialPosition,
    officialTrainings,
    officialOrganizations,
    orangTua,
    hubungan,
    anak,
  ]);

  // Fungsi untuk membersihkan data dari localStorage
  const clearLocalData = () => {
    [
      "official",
      "officialTempatKerja",
      "officialStudies",
      "officialPosition",
      "officialTrainings",
      "officialOrganizations",
      "orangTua",
      "hubungan",
      "anak",
    ].forEach((key) => localStorage.removeItem(`officialForm_${key}`));
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();

    // Add official data
    for (const key in official) {
      if (key === "foto" && official[key] instanceof File) {
        formData.append(`official[${key}]`, official[key]);
      } else {
        formData.append(`official[${key}]`, official[key] ?? "");
      }
    }

    // Add tempat kerja data
    for (const key in officialTempatKerja) {
      formData.append(`tempat_kerja[${key}]`, officialTempatKerja[key] ?? "");
    }

    // Add positions data
    for (const key in officialPosition) {
      formData.append(`position[${key}]`, officialPosition[key] ?? "");
    }

    // Add organizations data
    officialOrganizations.forEach((organization, index) => {
      for (const key in organization) {
        if (key === "doc_scan" && organization[key] instanceof File) {
          formData.append(`organizations[${index}][${key}]`, organization[key]);
        } else {
          formData.append(`organizations[${index}][${key}]`, organization[key] ?? "");
        }
      }
    });

    // Add studies data
    officialStudies.forEach((study, index) => {
      for (const key in study) {
        if (key === "doc_scan" && study[key] instanceof File) {
          formData.append(`studies[${index}][${key}]`, study[key]);
        } else {
          formData.append(`studies[${index}][${key}]`, study[key] ?? "");
        }
      }
    });

    // Add trainings data
    officialTrainings.forEach((training, index) => {
      for (const key in training) {
        if (key === "doc_scan" && training[key] instanceof File) {
          formData.append(`trainings[${index}][${key}]`, training[key]);
        } else {
          formData.append(`trainings[${index}][${key}]`, training[key] ?? "");
        }
      }
    });

    // Add orang tua data
    orangTua.forEach((orang_tua, index) => {
      for (const key in orang_tua) {
        if (orang_tua[key] !== undefined && orang_tua[key] !== null) {
          formData.append(`orang_tua[${index}][${key}]`, orang_tua[key]);
        }
      }
    });

    // Add hubungan data
    for (const key in hubungan) {
      formData.append(`hubungan[${key}]`, hubungan[key] ?? "");
    }

    // Add anak data
    anak.forEach((anak, index) => {
      for (const key in anak) {
        formData.append(`anak[${index}][${key}]`, anak[key] ?? "");
      }
    });

    try {
      const response = await axios.post(
        `/village/official/${position?.position?.slug ?? jabatan?.slug}/${id}/edit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );

      // Bersihkan data dari localStorage setelah submit berhasil
      clearLocalData();

      Swal.fire("Success", "Data berhasil diperbarui.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
      setErrors(error.response?.data?.errors || {});
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk reset semua form dan reload halaman
  const handleResetForm = () => {
    Swal.fire({
      title: "Bersihkan Form?",
      text: "Semua data yang belum tersimpan akan dihapus. Anda yakin?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        // Reset semua state ke nilai awal
        setOfficial(initialOfficial || {});
        setOfficialTempatKerja(initialTempatKerja || {});
        setOfficialStudies(initialStudies || []);
        setOfficialPosition(currentPosition || {});
        setOfficialTrainings(initialTrainings || []);
        setOfficialOrganizations(initialOrganizations || []);
        setOrangTua(initialOrangtua || []);
        setHubungan(initialPasangan || {});
        setAnak(initialAnak || []);

        // Bersihkan localStorage
        clearLocalData();

        Swal.fire(
          "Dihapus!",
          "Form telah berhasil dibersihkan.",
          "success"
        ).then(() => {
          window.location.reload();
        });
      }
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="text-2xl font-semibold leading-tight">
          Ubah Pejabat Desa {official.nama_lengkap || "Pejabat"}
          <p className="text-sm font-thin mt-1">
            Formulir Perubahan Data Pejabat Desa
          </p>
        </div>
      }
      breadcrumb={[
        {
          name: "Ubah Pejabat Desa",
          path: `/village/official/edit/${position?.position?.slug ?? jabatan?.slug}/${id}`,
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
        <form onSubmit={handleSubmit} className="space-y-8">
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
            jabatan={jabatan}
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
            trainings={initialTrainings}
            setTrainings={setOfficialTrainings}
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
              type="button"
              onClick={handleResetForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center mr-4"
              disabled={isLoading}
            >
              <HiTrash className="mr-2" />
              Reset Form
            </motion.button>

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
