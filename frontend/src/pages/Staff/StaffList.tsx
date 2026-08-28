import { useState, useEffect } from "react";
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

const StaffList = () => {
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
            alert("Nama petugas wajib diisi!");
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
            alert(error.response?.data?.message || "Gagal menyimpan data petugas.");
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
            alert(error.response?.data?.message || "Gagal menghapus data petugas.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link
                            to="/dashboard"
                            className="p-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-purple-500/50 transition-all flex items-center justify-center shadow-lg group"
                            title="Kembali ke Dashboard">
                            <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-[0.2em] text-white">
                            Petugas<span className="text-purple-500">.</span>
                        </h1>
                    </div>
                    <p className="text-sm text-neutral-400">
                        Kelola data staf teknisi, detailer, dan operator APEX Carwash
                    </p>
                </div>

                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center justify-center gap-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold transition-all duration-300 rounded-2xl py-3.5 px-6 text-xs shadow-lg shadow-purple-900/30 hover:scale-105 cursor-pointer">
                    <HiOutlinePlus className="w-5 h-5" />
                    <span>Tambah Petugas Baru</span>
                </button>
            </div>

            {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HiOutlineExclamationCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        onClick={fetchStaffsList}
                        className="underline hover:text-white font-semibold text-xs cursor-pointer">
                        Coba Lagi
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama atau telepon petugas..."
                        className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-2xl py-3 pl-12 pr-10 text-xs outline-none transition-all" />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                            <HiOutlineX className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-xs text-neutral-400 font-medium">
                        Total: <span className="text-white font-bold">{filteredStaffs.length}</span> Petugas
                    </div>

                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === "grid" ?
                                "bg-purple-600 text-white shadow-md" : "text-neutral-400 hover:text-white"}`}
                            title="Tampilan Kartu (Grid)">
                            <HiOutlineViewGrid className="w-4 h-4" />
                            <span>Kartu</span>
                        </button>

                        <button
                            onClick={() => setViewMode("table")}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === "table" ?
                                "bg-purple-600 text-white shadow-md" : "text-neutral-400 hover:text-white"}`}
                            title="Tampilan Tabel Modern">
                            <HiOutlineViewList className="w-4 h-4" />
                            <span>Tabel Modern</span>
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 text-center text-neutral-400">
                    <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Memuat data staf & petugas...</p>
                </div>
            ) : filteredStaffs.length === 0 ? (
                <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-3xl p-12 text-center text-neutral-400 shadow-2xl">
                    <p className="text-xl font-bold text-white mb-2">Belum Ada Data Petugas</p>
                    <p className="text-xs mb-6 max-w-sm mx-auto">
                        {searchQuery ?
                            "Tidak ada petugas yang cocok dengan kata kunci pencarian Anda." : "Silakan tambahkan data petugas / staf pertama Anda untuk memulai penugasan order APEX."}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={handleOpenAddModal}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-purple-900/40 hover:scale-105 cursor-pointer">
                            <HiOutlinePlus className="w-4 h-4" /> Tambah Petugas Pertama
                        </button>
                    )}
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStaffs.map((staff) => (
                        <div
                            key={staff.id}
                            className="group relative bg-neutral-950/90 border border-neutral-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/60 hover:shadow-[0_15px_35px_rgba(168,85,247,0.2)] overflow-hidden">
                            <div className="space-y-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3.5">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                staff.name
                                            )}&background=581c87&color=c084fc&bold=true&length=2`}
                                            alt={staff.name}
                                            className="w-12 h-12 rounded-2xl object-cover border border-purple-500/40 shadow-inner group-hover:scale-110 transition-all duration-300" />
                                        <div>
                                            <h3 className="font-extrabold text-white text-base group-hover:text-purple-300 transition-colors leading-tight">
                                                {staff.name}
                                            </h3>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold tracking-wider text-purple-400 mt-1">
                                                <HiOutlineBadgeCheck className="w-3.5 h-3.5 text-purple-400" />
                                                Staff APEX
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span
                                            className={`inline-flex items-center gap-1.5 font-medium ${staff.isActive ? "text-emerald-400" : "text-neutral-500"}`}>
                                            <span
                                                className={`w-2 h-2 rounded-full ${staff.isActive ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-neutral-600"}`} />
                                            {staff.isActive ? "Aktif" : "Cuti/Nonaktif"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HiOutlinePhone className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs text-neutral-400">Kontak WhatsApp</span>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-white">
                                        {staff.phone || "Tidak ada no. HP"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-neutral-800/60">
                                <button
                                    onClick={() => handleOpenEditModal(staff)}
                                    className="p-2.5 bg-neutral-900 hover:bg-purple-900/40 border border-neutral-800 hover:border-purple-500/50 text-neutral-300 hover:text-purple-300 rounded-xl transition-all cursor-pointer"
                                    title="Edit Profil Petugas">
                                    <HiOutlinePencilAlt className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(staff)}
                                    className="p-2.5 bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-500/50 text-neutral-300 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                                    title="Hapus Petugas">
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-neutral-950/90 border border-neutral-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-neutral-300">
                            <thead className="bg-neutral-900 text-xs font-semibold text-neutral-400 uppercase border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4">Petugas</th>
                                    <th className="px-6 py-4">Kontak Telepon</th>
                                    <th className="px-6 py-4">Status Tugas</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/60 font-sans">
                                {filteredStaffs.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-neutral-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3.5">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                        staff.name
                                                    )}&background=581c87&color=c084fc&bold=true&length=2`}
                                                    alt={staff.name}
                                                    className="w-10 h-10 rounded-xl object-cover border border-purple-500/30" />
                                                <div>
                                                    <p className="font-extrabold text-white text-sm">{staff.name}</p>
                                                    <p className="text-[11px] font-mono text-purple-400">Petugas APEX</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-white">
                                            {staff.phone || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 font-medium ${staff.isActive ? "text-emerald-400" : "text-neutral-500"}`}>
                                                <span
                                                    className={`w-2 h-2 rounded-full ${staff.isActive ? "bg-emerald-400" : "bg-neutral-600"}`} />
                                                {staff.isActive ? "Aktif" : "Cuti/Nonaktif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEditModal(staff)}
                                                    className="p-2 bg-neutral-900 hover:bg-purple-900/40 border border-neutral-800 hover:border-purple-500/50 text-neutral-300 hover:text-purple-300 rounded-xl transition-all cursor-pointer"
                                                    title="Edit Profil Petugas">
                                                    <HiOutlinePencilAlt className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(staff)}
                                                    className="p-2 bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-500/50 text-neutral-300 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                                                    title="Hapus Petugas">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-neutral-950 border border-neutral-800 w-full max-w-lg rounded-3xl shadow-2xl p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-5 top-5 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-neutral-900 transition-colors">
                            <HiOutlineX className="w-5 h-5" />
                        </button>

                        <div>
                            <h3 className="text-xl font-bold text-white">
                                {editStaff ? "Edit Data Petugas" : "Tambah Petugas Baru"}
                            </h3>
                            <p className="text-neutral-400 text-xs mt-1">
                                Masukkan identitas petugas cuci / detailer dan status penugasannya.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitForm} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">
                                    Nama Lengkap Petugas <span className="text-purple-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Rian Pratama"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 text-xs rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                    required />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">
                                    Nomor Telepon / WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Contoh: 081234567890"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 text-xs font-mono rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all" />
                            </div>

                            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-white">Status Penugasan</p>
                                    <p className="text-[11px] text-neutral-400">
                                        Aktifkan jika petugas siap menerima penugasan order cuci.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${formData.isActive ? "bg-purple-600" : "bg-neutral-800"}`}>
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition-all cursor-pointer">
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs shadow-lg shadow-purple-900/30 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50">
                                    {isSubmitting ? "Menyimpan..." : editStaff ? "Simpan Perubahan" : "Tambah Petugas"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-neutral-950 border border-neutral-800 w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/30">
                            <HiOutlineTrash className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white">Hapus Petugas Ini?</h3>
                            <p className="text-neutral-400 text-xs">
                                Anda yakin ingin menghapus data petugas{" "}
                                <span className="text-white font-bold">
                                    "{deleteTarget.name}"
                                </span>
                                ? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-bold py-3 px-5 rounded-2xl text-xs transition-all cursor-pointer">
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteStaff}
                                disabled={isDeleting}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-5 rounded-2xl text-xs shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50">
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
