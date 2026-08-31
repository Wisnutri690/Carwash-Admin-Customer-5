import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineX,
  HiOutlineExclamationCircle,
  HiOutlineArrowLeft,
  HiOutlineBadgeCheck
} from "react-icons/hi";
import {
  getStaffs, createStaff, updateStaff, deleteStaff
} from "../../services/staffService";
import type { Staff, CreateStaffPayload } from "../../types/staff";

const StaffList: React.FC = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [filteredStaffs, setFilteredStaffs] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    isActive: boolean;
  }>({
    name: "",
    phone: "",
    isActive: true
  });

  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStaffsList = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getStaffs();
      setStaffs(data);
      setFilteredStaffs(data);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Gagal memuat data staf & petugas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffsList();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStaffs(staffs);
    } else {
      const query = searchQuery.toLowerCase();
      const result = staffs.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.phone && s.phone.toLowerCase().includes(query))
      );
      setFilteredStaffs(result);
    }
  }, [searchQuery, staffs]);

  const handleOpenAddModal = () => {
    setEditStaff(null);
    setFormData({
      name: "",
      phone: "",
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: Staff) => {
    setEditStaff(staff);
    setFormData({
      name: staff.name,
      phone: staff.phone || "",
      isActive: staff.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama petugas wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateStaffPayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        isActive: formData.isActive
      };

      if (editStaff) {
        await updateStaff(editStaff.id, payload);
      } else {
        await createStaff(payload);
      }

      setIsModalOpen(false);
      await fetchStaffsList();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menyimpan data petugas");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStaff(deleteTarget.id);
      setDeleteTarget(null);
      await fetchStaffsList();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menghapus data petugas");
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
              Petugas<span className="text-purple-600">.</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Kelola data staf teknisi, detailer, dan operator APEX Carwash
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold transition rounded-full py-3 px-6 text-xs shadow-md"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Tambah Petugas Baru</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchStaffsList}
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
            placeholder="Cari nama atau telepon petugas..."
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
            Total: <span className="text-slate-900 font-bold">{filteredStaffs.length}</span> Petugas
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
          <p className="text-xs font-semibold uppercase tracking-wider">Memuat data staf &amp; petugas...</p>
        </div>
      ) : filteredStaffs.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <p className="text-lg font-bold text-slate-900 mb-1">Belum Ada Data Petugas</p>
          <p className="text-xs mb-6 max-w-sm mx-auto">
            {searchQuery ? "Tidak ada petugas yang cocok dengan kata kunci pencarian Anda" : "Silakan tambahkan data petugas pertama untuk memulai penugasan order"}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-full transition shadow-md"
            >
              <HiOutlinePlus className="w-4 h-4" /> Tambah Petugas Pertama
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaffs.map((staff) => (
            <div
              key={staff.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        staff.name
                      )}&background=0f172a&color=ffffff&bold=true&length=2`}
                      alt={staff.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shadow-sm"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {staff.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 mt-1">
                        <HiOutlineBadgeCheck className="w-3.5 h-3.5 text-purple-600" />
                        Staff APEX
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      staff.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {staff.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HiOutlinePhone className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">Kontak WhatsApp</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {staff.phone || "Tidak ada no. HP"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEditModal(staff)}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full transition shadow-sm"
                  title="Edit Profil Petugas"
                >
                  <HiOutlinePencilAlt className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(staff)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-full transition"
                  title="Hapus Petugas"
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
                  <th className="px-6 py-4">Petugas</th>
                  <th className="px-6 py-4">Kontak Telepon</th>
                  <th className="px-6 py-4">Status Tugas</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaffs.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            staff.name
                          )}&background=0f172a&color=ffffff&bold=true&length=2`}
                          alt={staff.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{staff.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">Petugas APEX</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {staff.phone || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${
                          staff.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {staff.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(staff)}
                          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full transition shadow-sm"
                          title="Edit Profil Petugas"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(staff)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-full transition"
                          title="Hapus Petugas"
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
                  {editStaff ? "Edit Data Petugas" : "Tambah Petugas Baru"}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Masukkan identitas petugas cuci / detailer dan status penugasannya
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
                  Nama Lengkap Petugas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Pratama"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-mono rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none transition"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Status Penugasan</p>
                  <p className="text-[11px] text-slate-500">
                    Aktifkan jika petugas siap menerima penugasan order cuci
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
                  {isSubmitting ? "Menyimpan..." : editStaff ? "Simpan Perubahan" : "Tambah Petugas"}
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
              <h3 className="text-base font-black text-slate-900 mb-1">Hapus Petugas</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Anda yakin ingin menghapus data petugas{" "}
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
                onClick={handleDeleteStaff}
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

export default StaffList;
