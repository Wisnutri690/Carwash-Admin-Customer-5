import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineX,
  HiOutlineExclamationCircle,
  HiOutlineArrowLeft
} from "react-icons/hi";
import {
  getServices, createService, updateService, deleteService
} from "../../services/serviceService";
import type { Service, CreateServicePayload } from "../../types/service";

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    duration: string;
    isActive: boolean;
  }>({
    name: "",
    description: "",
    price: "",
    duration: "45",
    isActive: true
  });

  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServicesList = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getServices();
      setServices(data);
      setFilteredServices(data);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Gagal memuat katalog layanan cuci & detailing.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesList();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
    } else {
      const query = searchQuery.toLowerCase();
      const result = services.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query))
      );
      setFilteredServices(result);
    }
  }, [searchQuery, services]);

  const handleOpenAddModal = () => {
    setEditService(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "45",
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: String(service.price),
      duration: String(service.duration),
      isActive: service.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama layanan wajib diisi");
      return;
    }

    const priceNum = parseFloat(formData.price);
    const durationNum = parseInt(formData.duration, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      alert("Harga layanan harus berupa angka yang valid");
      return;
    }

    if (isNaN(durationNum) || durationNum <= 0) {
      alert("Durasi pengerjaan harus lebih dari 0 menit");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateServicePayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: priceNum,
        duration: durationNum,
        isActive: formData.isActive
      };

      if (editService) {
        await updateService(editService.id, payload);
      } else {
        await createService(payload);
      }

      setIsModalOpen(false);
      await fetchServicesList();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menyimpan data layanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteService(deleteTarget.id);
      setDeleteTarget(null);
      await fetchServicesList();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menghapus data layanan");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
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
              Layanan<span className="text-purple-600">.</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Katalog paket perawatan cuci, detailing, dan proteksi APEX Carwash
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold transition rounded-full py-3 px-6 text-xs shadow-md"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Tambah Paket Layanan</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchServicesList}
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
            placeholder="Cari paket layanan, detailing, cuci..."
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
            Total: <span className="text-slate-900 font-bold">{filteredServices.length}</span> Layanan
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
          <p className="text-xs font-semibold uppercase tracking-wider">Memuat katalog layanan...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <p className="text-lg font-bold text-slate-900 mb-1">Belum Ada Paket Layanan</p>
          <p className="text-xs mb-6 max-w-sm mx-auto">
            {searchQuery ? "Tidak ada layanan yang cocok dengan kata kunci pencarian Anda" : "Silakan tambahkan paket layanan cuci pertama untuk memulai operasional APEX"}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-full transition shadow-md"
            >
              <HiOutlinePlus className="w-4 h-4" /> Tambah Paket Pertama
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-sm">
                    <HiOutlineSparkles className="w-5 h-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      service.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {service.isActive ? "Tersedia" : "Nonaktif"}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                    {service.description || "Layanan perawatan standar profesional APEX Carwash."}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tarif Layanan</p>
                    <p className="text-base font-black text-slate-900">
                      {formatCurrency(service.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimasi</p>
                    <p className="text-xs font-semibold text-slate-700 flex items-center justify-end gap-1 mt-0.5">
                      <HiOutlineClock className="w-3.5 h-3.5 text-purple-600" />
                      {service.duration} Menit
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEditModal(service)}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full transition shadow-sm"
                  title="Edit Layanan"
                >
                  <HiOutlinePencilAlt className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(service)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-full transition"
                  title="Hapus Layanan"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Paket Layanan</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Durasi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                          <HiOutlineSparkles className="w-4 h-4" />
                        </div>
                        <p className="font-extrabold text-slate-900 text-sm">{service.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-slate-500 truncate">
                      {service.description || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatCurrency(service.price)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <HiOutlineClock className="w-3.5 h-3.5 text-purple-600" />
                        {service.duration} Menit
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${
                          service.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {service.isActive ? "Tersedia" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full transition shadow-sm"
                          title="Edit Layanan"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(service)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-full transition"
                          title="Hapus Layanan"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                  {editService ? "Edit Paket Layanan" : "Tambah Paket Layanan Baru"}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Tentukan nama paket, harga, durasi pengerjaan, dan status ketersediaan
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
                  Nama Layanan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Signature Ceramic Detailing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tarif / Harga (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 150000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-bold rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 45"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Deskripsi Layanan
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan tahapan pencucian dan area pembersihan"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition resize-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Status Ketersediaan</p>
                  <p className="text-[11px] text-slate-500">
                    Aktifkan jika paket layanan ini siap dipesan pelanggan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? "bg-slate-900" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
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
                  {isSubmitting ? "Menyimpan..." : editService ? "Simpan Perubahan" : "Tambah Layanan"}
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
              <h3 className="text-base font-black text-slate-900 mb-1">Hapus Layanan</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Anda yakin ingin menghapus paket layanan{" "}
                <span className="text-slate-900 font-bold">
                  "{deleteTarget.name}"
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
                onClick={handleDeleteService}
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

export default ServiceList;
