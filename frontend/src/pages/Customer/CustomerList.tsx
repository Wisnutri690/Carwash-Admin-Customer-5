import { useState, useEffect } from "react";
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

const CustomerList = () => {
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
            alert("Nama dan No. Telepon wajib diisi!");
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
            alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
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
            alert(error.response?.data?.message || "Gagal menghapus pelanggan.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white max-w-7xl mx-auto p-6 md:p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-900/20 blur-[160px] pointer-events-none rounded-full" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center justify-center gap-2 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/50 text-neutral-400 hover:text-white px-3.5 py-3 rounded-2xl transition-all duration-300 shadow-lg group"
                        title="Kembali ke Dashboard">
                        <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-extrabold hidden sm:inline">Kembali</span>
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-[0.2em] text-white mb-1">
                            Pelanggan<span className="text-purple-500">.</span>
                        </h1>
                        <p className="text-sm text-neutral-400">Kelola data dan profil seluruh pelanggan APEX Carwash</p>
                    </div>
                </div>

                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center justify-center gap-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold transition-all duration-300 rounded-2xl py-3.5 px-6 text-xs shadow-lg shadow-purple-900/30 hover:scale-105">
                    <HiOutlineUserAdd className="w-5 h-5" />
                    Tambah Pelanggan Baru
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama, telepon, email pelanggan..."
                        className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-2xl py-3 pl-12 pr-4 text-xs outline-none transition-all" />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-xs text-neutral-400 font-medium">
                        Total: <span className="text-white font-bold">{filteredCustomers.length}</span> Pelanggan
                    </div>

                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === "grid" ?
                                "bg-purple-600 text-white shadow-md" : "text-neutral-400 hover:text-white"}`} title="Tampilan Kartu (Grid)">
                            <HiOutlineViewGrid className="w-4 h-4" />
                            <span>Kartu</span>
                        </button>

                        <button
                            onClick={() => setViewMode("table")}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === "table" ?
                                "bg-purple-600 text-white shadow-md" : "text-neutral-400 hover:text-white"}`}
                            title="Tampilan Tabel Modern">
                            <HiOutlineViewList className="w-4 h-4" />
                            <span>Tabel Modern</span>
                        </button>
                    </div>
                </div>
            </div>

            {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                    {errorMessage}
                </div>
            )}

            {isLoading ? (
                <div className="py-20 text-center text-neutral-400">
                    <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Memuat data pelanggan...</p>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-3xl p-12 text-center text-neutral-400 shadow-2xl">
                    <p className="text-xl font-bold text-white mb-2">Belum Ada Data Pelanggan</p>
                    <p className="text-xs mb-6 max-w-sm mx-auto">Silakan tambahkan pelanggan pertama kamu untuk memulai pencatatan transaksi pencucian APEX.</p>
                    <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-purple-900/40 hover:scale-105">
                        <HiOutlineUserAdd className="w-4 h-4" /> Tambah Pelanggan Pertama
                    </button>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((c) => (
                        <div
                            key={c.id}
                            className="group relative bg-neutral-950/90 border border-neutral-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/60 hover:shadow-[0_15px_35px_rgba(168,85,247,0.2)] overflow-hidden">
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div className="flex items-center gap-3.5">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=581c87&color=c084fc&bold=true&length=2`}
                                            alt={c.name}
                                            className="w-12 h-12 rounded-2xl object-cover border border-purple-500/40 shadow-inner group-hover:scale-110 transition-all duration-300" />
                                        <div>
                                            <h3 className="font-extrabold text-white text-base group-hover:text-purple-300 transition-colors leading-tight">
                                                {c.name}
                                            </h3>
                                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono font-semibold tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full mt-1">
                                                Pelanggan APEX
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-all" title="Kendaraan Terdaftar">
                                        <HiOutlineTruck className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="space-y-2.5 text-xs text-neutral-300 bg-neutral-900/60 border border-neutral-800/60 p-4 rounded-2xl mb-6">
                                    <div className="flex items-center gap-2.5">
                                        <HiOutlinePhone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <span className="font-semibold text-white">{c.phone}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <HiOutlineMail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                        <span className="truncate">{c.email || "Email tidak dicantumkan"}</span>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <HiOutlineLocationMarker className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{c.address || "Alamat belum diisi"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80">
                                <span className="text-[10px] text-neutral-500 font-mono">ID: {String(c.id).slice(0, 8)}</span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleOpenEditModal(c)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 hover:text-purple-300 text-neutral-400 rounded-xl transition-all text-xs font-semibold">
                                        <HiOutlinePencilAlt className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleTriggerDeleteModal(c)}
                                        className="p-1.5 bg-neutral-900 border border-neutral-800 hover:border-rose-500/50 hover:text-rose-400 text-neutral-400 rounded-xl transition-all"
                                        title="Hapus">
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-900/60 border border-neutral-800/60 rounded-2xl text-xs uppercase font-semibold text-neutral-400 tracking-wider">
                        <div className="col-span-4">Pelanggan</div>
                        <div className="col-span-3">No. Telepon</div>
                        <div className="col-span-3">Email & Alamat</div>
                        <div className="col-span-2 text-center">Aksi</div>
                    </div>

                    {filteredCustomers.map((c) => (
                        <div
                            key={c.id}
                            className="group bg-neutral-950/90 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-4 md:px-6 md:py-4 shadow-xl flex flex-col md:grid md:grid-cols-12 gap-4 items-center transition-all duration-300 hover:border-purple-500/50 hover:bg-neutral-900/40 hover:scale-[1.008]">
                            <div className="col-span-4 flex items-center gap-3.5 w-full">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=581c87&color=c084fc&bold=true&length=2`}
                                    alt={c.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-purple-500/30 group-hover:bg-purple-600 transition-all flex-shrink-0" />
                                <div>
                                    <h4 className="font-extrabold text-white text-sm group-hover:text-purple-300 transition-colors">
                                        {c.name}
                                    </h4>
                                    <span className="text-[10px] text-neutral-500 font-mono">ID: {String(c.id).slice(0, 8)}</span>
                                </div>
                            </div>

                            <div className="col-span-3 w-full">
                                <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                                    <HiOutlinePhone className="w-3.5 h-3.5" />
                                    {c.phone}
                                </span>
                            </div>

                            <div className="col-span-3 w-full text-xs space-y-1">
                                {c.email ? (
                                    <p className="text-neutral-300 flex items-center gap-1.5 truncate">
                                        <HiOutlineMail className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                        <span className="truncate">{c.email}</span>
                                    </p>
                                ) : (
                                    <p className="text-neutral-600 font-mono text-[11px]">-</p>
                                )}
                                {c.address && (
                                    <p className="text-neutral-400 text-[11px] truncate">
                                        📍 {c.address}
                                    </p>
                                )}
                            </div>

                            <div className="col-span-2 w-full flex items-center justify-end md:justify-center gap-2">
                                <button
                                    onClick={() => handleOpenEditModal(c)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 hover:text-purple-300 text-neutral-400 rounded-xl transition-all text-xs font-semibold">
                                    <HiOutlinePencilAlt className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                    onClick={() => handleTriggerDeleteModal(c)}
                                    className="p-1.5 bg-neutral-900 border border-neutral-800 hover:border-rose-500/50 hover:text-rose-400 text-neutral-400 rounded-xl transition-all"
                                    title="Hapus">
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
                            <h3 className="text-lg font-extrabold text-white">
                                {editCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-neutral-500 hover:text-white transition-colors">
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Budi Santoso"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:border-purple-500 rounded-2xl py-3 px-4 text-xs outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                                    No. Telepon / WhatsApp *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Contoh: 08123456789"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:border-purple-500 rounded-2xl py-3 px-4 text-xs outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                                    Email (Opsional)
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="budi@example.com"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:border-purple-500 rounded-2xl py-3 px-4 text-xs outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                                    Alamat (Opsional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Jl. Merdeka No. 123"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:border-purple-500 rounded-2xl py-3 px-4 text-xs outline-none resize-none" />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors">
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-purple-900/30">
                                    {isSubmitting ? "Memproses..." : editCustomer ? "Simpan Perubahan" : "Tambah Pelanggan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteCustomerTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
                            <HiOutlineExclamationCircle className="w-8 h-8" />
                        </div>

                        <h3 className="text-lg font-extrabold text-white mb-2">Hapus Pelanggan?</h3>
                        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                            Apakah kamu yakin ingin menghapus data pelanggan <span className="font-bold text-white">"{deleteCustomerTarget.name}"</span>? Perubahan ini bersifat permanen.
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteCustomerTarget(null)}
                                className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white font-bold text-xs rounded-2xl transition-all">
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-950/60 transition-all disabled:opacity-50">
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
