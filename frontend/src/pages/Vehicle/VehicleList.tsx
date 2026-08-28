import { useState, useEffect } from "react";
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

const VehicleList = () => {
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
            alert("Plat Nomor, Merk, dan Model kendaraan wajib diisi!");
            return;
        }

        if (!formData.customerId) {
            alert("Silakan pilih pemilik kendaraan (Customer)!");
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
            alert(error.response?.data?.message || "Gagal menyimpan data kendaraan.");
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
            alert(error.response?.data?.message || "Gagal menghapus data kendaraan.");
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
                            Kendaraan<span className="text-purple-500">.</span>
                        </h1>
                    </div>
                    <p className="text-sm text-neutral-400">
                        Kelola data armada dan kendaraan seluruh pelanggan APEX Carwash
                    </p>
                </div>

                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center justify-center gap-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold transition-all duration-300 rounded-2xl py-3.5 px-6 text-xs shadow-lg shadow-purple-900/30 hover:scale-105 cursor-pointer">
                    <HiOutlinePlus className="w-5 h-5" />
                    <span>Tambah Kendaraan Baru</span>
                </button>
            </div>

            {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HiOutlineExclamationCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        onClick={fetchData}
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
                        placeholder="Cari plat nomor, merk, model, pemilik..."
                        className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-2xl py-3 pl-12 pr-10 text-xs outline-none transition-all" />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                            <HiOutlineX className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-xs text-neutral-400 font-medium">
                        Total: <span className="text-white font-bold">{filteredVehicles.length}</span> Kendaraan
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
                    <p className="text-xs font-semibold uppercase tracking-wider">Memuat data kendaraan...</p>
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-3xl p-12 text-center text-neutral-400 shadow-2xl">
                    <p className="text-xl font-bold text-white mb-2">Belum Ada Data Kendaraan</p>
                    <p className="text-xs mb-6 max-w-sm mx-auto">
                        {searchQuery ? "Tidak ada kendaraan yang cocok dengan kata kunci pencarian Anda." : "Silakan tambahkan kendaraan pertama Anda untuk memulai pencatatan armada APEX."}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={handleOpenAddModal}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-purple-900/40 hover:scale-105 cursor-pointer">
                            <HiOutlinePlus className="w-4 h-4" /> Tambah Kendaraan Pertama
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
                                className="group relative bg-neutral-950/90 border border-neutral-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/60 hover:shadow-[0_15px_35px_rgba(168,85,247,0.2)] overflow-hidden">
                                <div className="space-y-4">
                                    <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
                                        <img
                                            src={carImage}
                                            alt={`${vehicle.brand} ${vehicle.model}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";
                                            }} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                                        <div className="absolute bottom-2.5 left-3 text-white font-mono font-black text-xs tracking-wider bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-neutral-700/80">
                                            {vehicle.plateNumber}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-mono uppercase text-purple-400 font-semibold tracking-wider">
                                            {vehicle.brand}
                                        </p>
                                        <h3 className="text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors leading-tight">
                                            {vehicle.model}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400">
                                            {vehicle.color && (
                                                <span className="flex items-center gap-1">
                                                    <HiOutlineColorSwatch className="w-3.5 h-3.5 text-neutral-500" />
                                                    {vehicle.color}
                                                </span>
                                            )}
                                            {vehicle.year && (
                                                <span className="flex items-center gap-1">
                                                    <HiOutlineCalendar className="w-3.5 h-3.5 text-neutral-500" />
                                                    Tahun {vehicle.year}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-300 text-xs">
                                                <HiOutlineUser className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-neutral-500 font-bold uppercase">Pemilik</p>
                                                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                                                    {vehicle.customer?.name || "Customer Terhapus"}
                                                </p>
                                            </div>
                                        </div>
                                        {vehicle.customer?.phone && (
                                            <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-neutral-800">
                                                <HiOutlinePhone className="w-3 h-3 text-purple-400" />
                                                {vehicle.customer.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-neutral-800/60">
                                    <button
                                        onClick={() => handleOpenEditModal(vehicle)}
                                        className="p-2.5 bg-neutral-900 hover:bg-purple-900/40 border border-neutral-800 hover:border-purple-500/50 text-neutral-300 hover:text-purple-300 rounded-xl transition-all cursor-pointer"
                                        title="Edit Kendaraan">
                                        <HiOutlinePencilAlt className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(vehicle)}
                                        className="p-2.5 bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-500/50 text-neutral-300 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                                        title="Hapus Kendaraan">
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-neutral-950/90 border border-neutral-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-neutral-300">
                            <thead className="bg-neutral-900 text-xs font-semibold text-neutral-400 uppercase border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4">Kendaraan</th>
                                    <th className="px-6 py-4">Plat Nomor</th>
                                    <th className="px-6 py-4">Merk</th>
                                    <th className="px-6 py-4">Pemilik (Customer)</th>
                                    <th className="px-6 py-4">Warna & Tahun</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/60 font-sans">
                                {filteredVehicles.map((vehicle) => {
                                    const carImage = getVehicleImage(vehicle.brand, vehicle.model);

                                    return (
                                        <tr key={vehicle.id} className="hover:bg-neutral-900/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3.5">
                                                    <img
                                                        src={carImage}
                                                        alt={vehicle.model}
                                                        className="w-14 h-9 rounded-xl object-cover bg-neutral-900 border border-neutral-800"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";
                                                        }} />
                                                    <div>
                                                        <p className="font-extrabold text-white text-sm">{vehicle.model}</p>
                                                        <p className="text-xs text-neutral-400">{vehicle.brand}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-white">
                                                {vehicle.plateNumber}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-300 font-medium">
                                                {vehicle.brand}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-white">{vehicle.customer?.name || "Customer Terhapus"}</p>
                                                    <p className="text-[11px] text-neutral-400 font-mono">{vehicle.customer?.phone || "-"}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400">
                                                <span>{vehicle.color || "-"}</span>
                                                {vehicle.year && <span className="ml-1 text-neutral-500 font-mono">({vehicle.year})</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenEditModal(vehicle)}
                                                        className="p-2 bg-neutral-900 hover:bg-purple-900/40 border border-neutral-800 hover:border-purple-500/50 text-neutral-300 hover:text-purple-300 rounded-xl transition-all cursor-pointer"
                                                        title="Edit Kendaraan">
                                                        <HiOutlinePencilAlt className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(vehicle)}
                                                        className="p-2 bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-500/50 text-neutral-300 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                                                        title="Hapus Kendaraan">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-neutral-950 border border-neutral-800 w-full max-w-lg rounded-3xl shadow-2xl p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-5 top-5 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-neutral-900 transition-colors">
                            <HiOutlineX className="w-5 h-5" />
                        </button>

                        <div>
                            <h3 className="text-xl font-bold text-white">
                                {editVehicle ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}
                            </h3>
                            <p className="text-neutral-400 text-xs mt-1">
                                Masukkan spesifikasi kendaraan dan hubungkan dengan pemiliknya.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitForm} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">
                                    Pemilik Kendaraan (Customer) <span className="text-purple-500">*</span>
                                </label>
                                <select
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    className="w-full bg-neutral-900/80 border border-neutral-800 text-white text-xs rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all cursor-pointer"
                                    required>
                                    <option value="" disabled>-- Pilih Pelanggan --</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-neutral-950 text-white">
                                            {c.name} ({c.phone})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">
                                    Nomor Plat Kendaraan <span className="text-purple-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: B 1234 WIS"
                                    value={formData.plateNumber}
                                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                                    className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 text-xs font-mono font-bold rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                    required />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-300">
                                        Merk (Brand) <span className="text-purple-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Toyota, Porsche, BMW, dll"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 text-xs rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                        required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-300">
                                        Seri / Model <span className="text-purple-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="GR Supra, GT-R, 911, M4, dll"
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 text-xs rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                        required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-300">Warna</label>
                                    <input
                                        type="text"
                                        placeholder="Merah, Hitam, Putih, dll"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 text-xs rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-300">Tahun</label>
                                    <input
                                        type="number"
                                        placeholder="Contoh: 2023"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 text-xs rounded-2xl p-3.5 font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
                                <img
                                    src={getVehicleImage(formData.brand, formData.model)}
                                    alt="Preview"
                                    className="w-16 h-10 object-cover rounded-xl bg-black border border-neutral-800"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";
                                    }} />
                                <div>
                                    <p className="text-xs font-semibold text-purple-400">
                                        Smart Image Preview
                                    </p>
                                    <p className="text-[11px] text-neutral-400">
                                        {formData.brand && formData.model ?
                                            `Foto terdeteksi: ${formData.brand} ${formData.model}` : "Foto preview default akan aktif saat merk & model diisi"}
                                    </p>
                                </div>
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
                                    {isSubmitting ? "Menyimpan..." : editVehicle ? "Simpan Perubahan" : "Tambah Kendaraan"}
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
                            <h3 className="text-lg font-bold text-white">Hapus Kendaraan Ini?</h3>
                            <p className="text-neutral-400 text-xs">
                                Anda yakin ingin menghapus data kendaraan{" "}
                                <span className="text-white font-mono font-bold">
                                    {deleteTarget.plateNumber} ({deleteTarget.brand} {deleteTarget.model})
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
                                onClick={handleDeleteVehicle}
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

export default VehicleList;
