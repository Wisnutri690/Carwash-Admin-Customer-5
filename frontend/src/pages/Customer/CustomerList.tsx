import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineUserAdd,
  HiOutlineSearch,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineX,
  HiOutlineTruck,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineExclamationCircle,
  HiOutlineArrowLeft
} from "react-icons/hi";
import {
  getCustomer, createCustomer, updateCustomer, deleteCustomer
} from "../../services/customerService";
import type { Customer, CreateCustomerPayload } from "../../types/customer";

const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateCustomerPayload>({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getCustomer();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Gagal memuat data pelanggan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.toLowerCase().includes(query) ||
          (c.email && c.email.toLowerCase().includes(query))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const handleOpenAddModal = () => {
    setEditCustomer(null);
    setFormData({ name: "", phone: "", email: "", address: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Nama dan No. Telepon wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editCustomer) {
        await updateCustomer(editCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerDeleteModal = (customer: Customer) => {
    setDeleteCustomerTarget(customer);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCustomerTarget) return;

    setIsDeleting(true);
    try {
      await deleteCustomer(deleteCustomerTarget.id);
      setDeleteCustomerTarget(null);
      fetchCustomers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menghapus pelanggan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-full transition shadow-sm"
            title="Kembali ke Dashboard"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Kembali</span>
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Pelanggan<span className="text-purple-600">.</span>
            </h1>
            <p className="text-xs text-slate-500">Kelola data dan profil seluruh pelanggan APEX Carwash</p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold transition rounded-full py-3 px-6 text-xs shadow-md"
        >
          <HiOutlineUserAdd className="w-4 h-4" />
          Tambah Pelanggan Baru
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, telepon, email pelanggan..."
            className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 rounded-full py-2.5 pl-11 pr-4 text-xs outline-none transition shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs text-slate-500 font-medium">
            Total: <span className="text-slate-900 font-bold">{filteredCustomers.length}</span> Pelanggan
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

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl">
          <div className="inline-block w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold uppercase tracking-wider">Memuat data pelanggan...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <p className="text-lg font-bold text-slate-900 mb-1">Belum Ada Data Pelanggan</p>
          <p className="text-xs mb-6 max-w-sm mx-auto">Silakan tambahkan pelanggan pertama untuk memulai pencatatan transaksi pencucian</p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-full transition shadow-md"
          >
            <HiOutlineUserAdd className="w-4 h-4" /> Tambah Pelanggan
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0f172a&color=ffffff&bold=true&length=2`}
                      alt={c.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shadow-sm"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {c.name}
                      </h3>
                      <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1">
                        Pelanggan
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                    <HiOutlineTruck className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-5">
                  <div className="flex items-center gap-2">
                    <HiOutlinePhone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-900">{c.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <HiOutlineMail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{c.email || "Email tidak dicantumkan"}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <HiOutlineLocationMarker className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{c.address || "Alamat belum diisi"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-mono">ID: {String(c.id).slice(0, 8)}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full transition text-xs font-bold shadow-sm"
                  >
                    <HiOutlinePencilAlt className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleTriggerDeleteModal(c)}
                    className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-full transition"
                    title="Hapus"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <div className="col-span-4">Pelanggan</div>
            <div className="col-span-3">No. Telepon</div>
            <div className="col-span-3">Email &amp; Alamat</div>
            <div className="col-span-2 text-center">Aksi</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                className="p-4 md:px-6 md:py-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center hover:bg-slate-50/80 transition"
              >
                <div className="col-span-4 flex items-center gap-3.5 w-full">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0f172a&color=ffffff&bold=true&length=2`}
                    alt={c.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{c.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {String(c.id).slice(0, 8)}</span>
                  </div>
                </div>

                <div className="col-span-3 w-full">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                    <HiOutlinePhone className="w-3.5 h-3.5 text-slate-500" />
                    {c.phone}
                  </span>
                </div>

                <div className="col-span-3 w-full text-xs space-y-0.5">
                  <p className="text-slate-700 truncate">{c.email || "-"}</p>
                  <p className="text-slate-400 text-[11px] truncate">{c.address || "-"}</p>
                </div>

                <div className="col-span-2 w-full flex items-center justify-end md:justify-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full transition text-xs font-bold shadow-sm"
                  >
                    <HiOutlinePencilAlt className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleTriggerDeleteModal(c)}
                    className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-full transition"
                    title="Hapus"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-800 rounded-2xl py-2.5 px-4 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-800 rounded-2xl py-2.5 px-4 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="budi@example.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-800 rounded-2xl py-2.5 px-4 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Merdeka No. 123"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-800 rounded-2xl py-2.5 px-4 text-xs outline-none resize-none"
                />
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
                  {isSubmitting ? "Memproses..." : editCustomer ? "Simpan Perubahan" : "Tambah Pelanggan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteCustomerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <HiOutlineExclamationCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">Hapus Pelanggan</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pelanggan <span className="font-bold text-slate-900">"{deleteCustomerTarget.name}"</span>?
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteCustomerTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-md transition disabled:opacity-50"
              >
                {isDeleting ? "Hapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
