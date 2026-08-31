import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineX,
  HiOutlineExclamationCircle,
  HiOutlineArrowLeft,
  HiOutlineColorSwatch,
  HiOutlineCalendar,
  HiOutlinePlus
} from "react-icons/hi";
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from "../../services/vehicleService";
import { getCustomer } from "../../services/customerService";
import type { Vehicle, CreateVehiclePayload } from "../../types/vehicle";
import type { Customer } from "../../types/customer";
import { getVehicleImage } from "../../utils/vehicleImage";

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    plateNumber: string;
    brand: string;
    model: string;
    color: string;
    year: string;
    customerId: string | number;
  }>({
    plateNumber: "",
    brand: "",
    model: "",
    color: "",
    year: "",
    customerId: ""
  });

  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [vehicleData, customerData] = await Promise.all([
        getVehicles(),
        getCustomer()
      ]);
      setVehicles(vehicleData);
      setFilteredVehicles(vehicleData);
      setCustomers(customerData);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Gagal memuat data kendaraan & pelanggan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVehicles(vehicles);
    } else {
      const query = searchQuery.toLowerCase();
      const result = vehicles.filter(
        (v) =>
          v.plateNumber.toLowerCase().includes(query) ||
          v.brand.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          (v.customer && v.customer.name.toLowerCase().includes(query))
      );
      setFilteredVehicles(result);
    }
  }, [searchQuery, vehicles]);

  const handleOpenAddModal = () => {
    setEditVehicle(null);
    setFormData({
      plateNumber: "",
      brand: "",
      model: "",
      color: "",
      year: "",
      customerId: customers.length > 0 ? customers[0].id : ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setFormData({
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color || "",
      year: vehicle.year ? String(vehicle.year) : "",
      customerId: vehicle.customerId
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.plateNumber.trim() || !formData.brand.trim() || !formData.model.trim()) {
      alert("Plat Nomor, Merk, dan Model kendaraan wajib diisi");
      return;
    }

    if (!formData.customerId) {
      alert("Silakan pilih pemilik kendaraan");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateVehiclePayload = {
        plateNumber: formData.plateNumber.trim().toUpperCase(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        color: formData.color.trim() || undefined,
        year: formData.year ? parseInt(formData.year, 10) : undefined,
        customerId: formData.customerId
      };

      if (editVehicle) {
        await updateVehicle(editVehicle.id, payload);
      } else {
        await createVehicle(payload);
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menyimpan data kendaraan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menghapus data kendaraan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              to="/dashboard"
              className="flex items-center justify-center p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full transition shadow-sm"
              title="Kembali ke Dashboard"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Kendaraan<span className="text-purple-600">.</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Kelola data armada dan kendaraan seluruh pelanggan APEX Carwash
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold transition rounded-full py-3 px-6 text-xs shadow-md"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Tambah Kendaraan Baru</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchData}
            className="underline hover:text-rose-900 font-bold text-xs"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari plat nomor, merk, model, pemilik..."
            className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 rounded-full py-2.5 pl-11 pr-10 text-xs outline-none transition shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs text-slate-500 font-medium">
            Total: <span className="text-slate-900 font-bold">{filteredVehicles.length}</span> Kendaraan
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                viewMode === "grid" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <HiOutlineViewGrid className="w-4 h-4" />
              <span>Kartu</span>
            </button>

            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                viewMode === "table" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <HiOutlineViewList className="w-4 h-4" />
              <span>Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl">
          <div className="inline-block w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold uppercase tracking-wider">Memuat data kendaraan...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <p className="text-lg font-bold text-slate-900 mb-1">Belum Ada Data Kendaraan</p>
          <p className="text-xs mb-6 max-w-sm mx-auto">
            {searchQuery ? "Tidak ada kendaraan yang cocok dengan kata kunci pencarian Anda" : "Silakan tambahkan kendaraan pertama untuk memulai pencatatan armada"}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-full transition shadow-md"
            >
              <HiOutlinePlus className="w-4 h-4" /> Tambah Kendaraan
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const carImage = getVehicleImage(vehicle.brand, vehicle.model);

            return (
              <div
                key={vehicle.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={carImage}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <div className="absolute bottom-2.5 left-3 text-slate-900 font-mono font-bold text-xs tracking-wider bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                      {vehicle.plateNumber}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-mono uppercase text-purple-700 font-bold tracking-wider">
                      {vehicle.brand}
                    </p>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {vehicle.color && (
                        <span className="flex items-center gap-1">
                          <HiOutlineColorSwatch className="w-3.5 h-3.5 text-slate-400" />
                          {vehicle.color}
                        </span>
                      )}
                      {vehicle.year && (
                        <span className="flex items-center gap-1">
                          <HiOutlineCalendar className="w-3.5 h-3.5 text-slate-400" />
                          Tahun {vehicle.year}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        <HiOutlineUser className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Pemilik</p>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                          {vehicle.customer?.name || "Pelanggan"}
                        </p>
                      </div>
                    </div>
                    {vehicle.customer?.phone && (
                      <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-slate-200">
                        <HiOutlinePhone className="w-3 h-3 text-slate-400" />
                        {vehicle.customer.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEditModal(vehicle)}
                    className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full transition shadow-sm"
                    title="Edit Kendaraan"
                  >
                    <HiOutlinePencilAlt className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(vehicle)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-full transition"
                    title="Hapus Kendaraan"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Kendaraan</th>
                  <th className="px-6 py-4">Plat Nomor</th>
                  <th className="px-6 py-4">Merk</th>
                  <th className="px-6 py-4">Pemilik</th>
                  <th className="px-6 py-4">Warna &amp; Tahun</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((vehicle) => {
                  const carImage = getVehicleImage(vehicle.brand, vehicle.model);

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={carImage}
                            alt={vehicle.model}
                            className="w-14 h-9 rounded-xl object-cover bg-slate-100 border border-slate-200"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{vehicle.model}</p>
                            <p className="text-xs text-slate-400">{vehicle.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {vehicle.plateNumber}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {vehicle.brand}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{vehicle.customer?.name || "Pelanggan"}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{vehicle.customer?.phone || "-"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <span>{vehicle.color || "-"}</span>
                        {vehicle.year && <span className="ml-1 text-slate-400 font-mono">({vehicle.year})</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(vehicle)}
                            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full transition shadow-sm"
                            title="Edit Kendaraan"
                          >
                            <HiOutlinePencilAlt className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(vehicle)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-full transition"
                            title="Hapus Kendaraan"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editVehicle ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Masukkan spesifikasi kendaraan dan hubungkan dengan pemiliknya
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pemilik Kendaraan (Customer)
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition"
                  required
                >
                  <option value="" disabled>-- Pilih Pelanggan --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor Plat Kendaraan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: B 1234 WIS"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-mono font-bold rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Merk (Brand)
                  </label>
                  <input
                    type="text"
                    placeholder="Toyota, Porsche, Honda, dll"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Seri / Model
                  </label>
                  <input
                    type="text"
                    placeholder="Avanza, 911, Civic, dll"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Warna</label>
                  <input
                    type="text"
                    placeholder="Hitam, Putih, Silver, dll"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    placeholder="Contoh: 2023"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 font-mono focus:bg-white focus:border-slate-800 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-full transition disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? "Menyimpan..." : editVehicle ? "Simpan Perubahan" : "Tambah Kendaraan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <HiOutlineTrash className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 mb-1">Hapus Kendaraan</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Anda yakin ingin menghapus data kendaraan{" "}
                <span className="text-slate-900 font-mono font-bold">
                  {deleteTarget.plateNumber} ({deleteTarget.brand} {deleteTarget.model})
                </span>
                ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteVehicle}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-md transition disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
