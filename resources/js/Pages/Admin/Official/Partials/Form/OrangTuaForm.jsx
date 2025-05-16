import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaUserTie, FaCalendarAlt, FaHome, FaPhone } from "react-icons/fa";
import { HiInformationCircle } from "react-icons/hi";

export default function OrangTuaForm({ orang_tua = [], setOrangTua = () => {} }) {
  // Parent types
  const PARENT_TYPES = ['ayah', 'ibu'];

  // Initial form data structure
  const initialFormData = {
    jenis: '',
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    bulanLahir: "",
    tahunLahir: "",
    pekerjaan: "",
    alamat: "",
    rt: "",
    rw: "",
    telp: "",
    kodePos: "",
    province_code: "",
    province_name: "",
    regency_code: "",
    regency_name: "",
    district_code: "",
    district_name: "",
    village_code: "",
    village_name: ""
  };

  // Initialize form data
  const initializeFormData = () => {
    const defaultData = {
      ayah: { ...initialFormData, jenis: 'ayah' },
      ibu: { ...initialFormData, jenis: 'ibu' }
    };

    if (orang_tua && orang_tua.length > 0) {
      orang_tua.forEach(parent => {
        if (parent.jenis === 'ayah') {
          const { tanggalLahir, ...rest } = parent;
          const [tgl, bln, thn] = tanggalLahir?.split('-') || ['', '', ''];
          defaultData.ayah = {
            ...rest,
            tanggalLahir: tgl,
            bulanLahir: bln,
            tahunLahir: thn
          };
        } else if (parent.jenis === 'ibu') {
          const { tanggalLahir, ...rest } = parent;
          const [tgl, bln, thn] = tanggalLahir?.split('-') || ['', '', ''];
          defaultData.ibu = {
            ...rest,
            tanggalLahir: tgl,
            bulanLahir: bln,
            tahunLahir: thn
          };
        }
      });
    }

    return defaultData;
  };

  // State management
  const [formData, setFormData] = useState(initializeFormData());
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState({ ayah: [], ibu: [] });
  const [districts, setDistricts] = useState({ ayah: [], ibu: [] });
  const [villages, setVillages] = useState({ ayah: [], ibu: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Get provinces data
  useEffect(() => {
    axios.get("/village/bps/wilayah")
      .then((response) => setProvinces(response.data))
      .catch((error) => console.error("Error fetching provinces:", error))
      .finally(() => setIsLoading(false));
  }, []);

  // Update form when parent data changes
  useEffect(() => {
    setFormData(initializeFormData());
  }, [orang_tua]);

  // Handle input changes and auto-save
  const handleChange = (e, parentType, field) => {
    const { value } = e.target;
    const updatedFormData = {
      ...formData,
      [parentType]: {
        ...formData[parentType],
        [field]: value
      }
    };

    setFormData(updatedFormData);
    updateParentData(updatedFormData);
  };

  // Handle wilayah changes and auto-save
  const handleWilayahChange = async (type, parentType, code) => {
    try {
      // Update form data first
      const updatedFormData = {
        ...formData,
        [parentType]: {
          ...formData[parentType],
          [`${type}_code`]: code,
          [`${type}_name`]: code ?
            (type === 'province' ?
              provinces.find(p => p.kode_bps === code)?.nama_bps :
              type === 'regency' ?
                regencies[parentType].find(r => r.kode_bps === code)?.nama_bps :
                type === 'district' ?
                  districts[parentType].find(d => d.kode_bps === code)?.nama_bps :
                  villages[parentType].find(v => v.kode_bps === code)?.nama_bps) : "",
          ...(type === 'province' && {
            regency_code: "", regency_name: "",
            district_code: "", district_name: "",
            village_code: "", village_name: ""
          }),
          ...(type === 'regency' && {
            district_code: "", district_name: "",
            village_code: "", village_name: ""
          }),
          ...(type === 'district' && {
            village_code: "", village_name: ""
          })
        }
      };

      setFormData(updatedFormData);

      // Fetch next level data if code exists
      if (code) {
        let url = '';
        let setState = () => {};

        if (type === 'province') {
          url = `/village/bps/wilayah/kabupaten/${code}`;
          setState = (data) => setRegencies(prev => ({ ...prev, [parentType]: data }));
        } else if (type === 'regency') {
          url = `/village/bps/wilayah/kecamatan/${code}`;
          setState = (data) => setDistricts(prev => ({ ...prev, [parentType]: data }));
        } else if (type === 'district') {
          url = `/village/bps/wilayah/desa/${code}`;
          setState = (data) => setVillages(prev => ({ ...prev, [parentType]: data }));
        }

        const response = await axios.get(url);
        setState(response.data);
      }

      // Update parent data after all changes
      updateParentData(updatedFormData);
    } catch (error) {
      console.error(`Error handling ${type} change:`, error);
    }
  };

  // Update parent data whenever form changes
  const updateParentData = (currentFormData) => {
    const formattedData = PARENT_TYPES.map(parentType => ({
      ...currentFormData[parentType],
      tanggalLahir: `${currentFormData[parentType].tanggalLahir}-${currentFormData[parentType].bulanLahir}-${currentFormData[parentType].tahunLahir}`
    }));

    setOrangTua(formattedData);
  };

  // Render parent form section
  const renderParentForm = (parentType) => {
    if (isLoading) return <div>Memuat data...</div>;

    const parentData = formData[parentType];
    const parentLabel = parentType === 'ayah' ? 'Ayah' : 'Ibu';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 mb-8 p-4 border rounded-lg bg-gray-50"
      >
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <FaUserTie className="mr-2 text-blue-500" />
          Data {parentLabel}
        </h2>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              value={parentData.nama}
              onChange={(e) => handleChange(e, parentType, 'nama')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={`Nama ${parentLabel}`}
            />
          </div>

          {/* Tempat Lahir */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir *</label>
            <input
              type="text"
              value={parentData.tempatLahir}
              onChange={(e) => handleChange(e, parentType, 'tempatLahir')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Tempat Lahir"
            />
          </div>

          {/* Tanggal Lahir */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir *</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="1"
                max="31"
                value={parentData.tanggalLahir}
                onChange={(e) => handleChange(e, parentType, 'tanggalLahir')}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholder="DD"
              />
              <input
                type="number"
                min="1"
                max="12"
                value={parentData.bulanLahir}
                onChange={(e) => handleChange(e, parentType, 'bulanLahir')}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholder="MM"
              />
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={parentData.tahunLahir}
                onChange={(e) => handleChange(e, parentType, 'tahunLahir')}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholder="YYYY"
              />
            </div>
          </div>

          {/* Pekerjaan */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan *</label>
            <input
              type="text"
              value={parentData.pekerjaan}
              onChange={(e) => handleChange(e, parentType, 'pekerjaan')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Pekerjaan"
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="mt-6 space-y-4">
          <h3 className="text-md font-medium text-gray-700 flex items-center">
            <FaHome className="mr-2 text-blue-500" />
            Alamat {parentLabel}
          </h3>

          {/* Alamat Lengkap */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
            <textarea
              value={parentData.alamat}
              onChange={(e) => handleChange(e, parentType, 'alamat')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Contoh: Jl. Merdeka No. 123"
              rows={3}
            />
          </div>

          {/* RT/RW/Kode Pos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">RT *</label>
              <input
                type="text"
                value={parentData.rt}
                onChange={(e) => handleChange(e, parentType, 'rt')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="001"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">RW *</label>
              <input
                type="text"
                value={parentData.rw}
                onChange={(e) => handleChange(e, parentType, 'rw')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="002"
              />
            </div>
            <div className="form-group md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={parentData.kodePos}
                onChange={(e) => handleChange(e, parentType, 'kodePos')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="12345"
              />
            </div>
          </div>

          {/* Wilayah */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Provinsi */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi *</label>
              <select
                value={parentData.province_code}
                onChange={(e) => handleWilayahChange('province', parentType, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map(province => (
                  <option key={province.kode_bps} value={province.kode_bps}>
                    {province.nama_bps}
                  </option>
                ))}
              </select>
            </div>

            {/* Kabupaten/Kota */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten/Kota *</label>
              <select
                value={parentData.regency_code}
                onChange={(e) => handleWilayahChange('regency', parentType, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={!parentData.province_code}
              >
                <option value="">Pilih Kabupaten</option>
                {regencies[parentType]?.map(regency => (
                  <option key={regency.kode_bps} value={regency.kode_bps}>
                    {regency.nama_bps}
                  </option>
                ))}
              </select>
            </div>

            {/* Kecamatan */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan *</label>
              <select
                value={parentData.district_code}
                onChange={(e) => handleWilayahChange('district', parentType, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={!parentData.regency_code}
              >
                <option value="">Pilih Kecamatan</option>
                {districts[parentType]?.map(district => (
                  <option key={district.kode_bps} value={district.kode_bps}>
                    {district.nama_bps}
                  </option>
                ))}
              </select>
            </div>

            {/* Desa/Kelurahan */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Desa/Kelurahan *</label>
              <select
                value={parentData.village_code}
                onChange={(e) => handleWilayahChange('village', parentType, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={!parentData.district_code}
              >
                <option value="">Pilih Desa</option>
                {villages[parentType]?.map(village => (
                  <option key={village.kode_bps} value={village.kode_bps}>
                    {village.nama_bps}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Telepon */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaPhone className="mr-2 text-blue-500" /> Nomor Telepon
            </label>
            <input
              type="tel"
              value={parentData.telp}
              onChange={(e) => handleChange(e, parentType, 'telp')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="081234567890"
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white w-full p-6 shadow-lg rounded-xl mt-8 border border-gray-200"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <FaUserTie className="text-2xl text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Data Orang Tua</h1>
            <p className="text-sm text-gray-600 mt-1 flex items-center">
              <HiInformationCircle className="mr-1 text-blue-500" />
              Lengkapi data orang tua (ayah dan ibu)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {PARENT_TYPES.map(parentType => (
          <div key={parentType}>
            {renderParentForm(parentType)}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
