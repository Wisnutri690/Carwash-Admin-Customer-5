import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    HiOutlineSearch,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineViewGrid,
    HiOutlineViewList,
    HiOutlineX,
    HiOutlineExclamationCircle,
    HiOutlineArrowLeft,
    HiOutlineCheck,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlinePrinter
} from "react-icons/hi";
import {
    getOrders, createOrder, updateOrderStatus, updateOrderPayment, deleteOrder
} from "../../services/orderService";
import { getCustomer } from "../../services/customerService";
import { getVehicles } from "../../services/vehicleService";
import { getStaffs } from "../../services/staffService";
import { getServices } from "../../services/serviceService";
import type {
    Order, OrderStatus, PaymentMethod, CreateOrderPayload
} from "../../types/order";
import type { Customer } from "../../types/customer";
import type { Vehicle } from "../../types/vehicle";
import type { Staff } from "../../types/staff";
import type { Service } from "../../types/service";

const OrderList = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("ALL");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Selected state for invoice modal
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

    // Payment modal state
    const [paymentTargetOrder, setPaymentTargetOrder] = useState<Order | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("QRIS");

    // Delete state
    const [deleteTargetOrder, setDeleteTargetOrder] = useState<Order | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create Order Form State
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | number>("");
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | number>("");
    const [selectedStaffId, setSelectedStaffId] = useState<string | number>("");
    const [selectedServices, setSelectedServices] = useState<{ serviceId: string | number; quantity: number }[]>([]);
    const [orderNotes, setOrderNotes] = useState("");

    const fetchAllData = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const [ordersData, customersData, vehiclesData, staffsData, servicesData] = await Promise.all([
                getOrders(),
                getCustomer(),
                getVehicles(),
                getStaffs(),
                getServices()
            ]);
            setOrders(ordersData);
            setFilteredOrders(ordersData);
            setCustomers(customersData);
            setVehicles(vehiclesData);
            setStaffs(staffsData);
            setServices(servicesData);
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || "Gagal memuat data transaksi order.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Single Unified Filter Logic
    useEffect(() => {
        let result = [...orders];

        if (filterCategory === "WAITING" || filterCategory === "IN_PROGRESS" || filterCategory === "COMPLETED" || filterCategory === "CANCELLED") {
            result = result.filter((o) => o.status === filterCategory);
        } else if (filterCategory === "UNPAID" || filterCategory === "PAID") {
            result = result.filter((o) => o.paymentStatus === filterCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (o) =>
                    (o.vehicle?.plateNumber && o.vehicle.plateNumber.toLowerCase().includes(query)) ||
                    (o.vehicle?.model && o.vehicle.model.toLowerCase().includes(query)) ||
                    (o.customer?.name && o.customer.name.toLowerCase().includes(query)) ||
                    (o.staff?.name && o.staff.name.toLowerCase().includes(query))
            );
        }

        setFilteredOrders(result);
    }, [searchQuery, filterCategory, orders]);

    // Handle Open Create Modal
    const handleOpenCreateModal = () => {
        const firstCust = customers.length > 0 ? customers[0].id : "";
        setSelectedCustomerId(firstCust);

        const availableVehicles = vehicles.filter((v) => String(v.customerId) === String(firstCust));
        setSelectedVehicleId(availableVehicles.length > 0 ? availableVehicles[0].id : "");

        const activeStaffs = staffs.filter((s) => s.isActive);
        setSelectedStaffId(activeStaffs.length > 0 ? activeStaffs[0].id : staffs.length > 0 ? staffs[0].id : "");

        if (services.length > 0) {
            setSelectedServices([{ serviceId: services[0].id, quantity: 1 }]);
        } else {
            setSelectedServices([]);
        }

        setOrderNotes("");
        setIsCreateModalOpen(true);
    };

    // When customer changes in create modal, auto filter vehicle
    const handleCustomerChange = (custId: string | number) => {
        setSelectedCustomerId(custId);
        const availableVehicles = vehicles.filter((v) => String(v.customerId) === String(custId));
        setSelectedVehicleId(availableVehicles.length > 0 ? availableVehicles[0].id : "");
    };

    // Toggle service in create modal
    const handleToggleService = (serviceId: string | number) => {
        const exists = selectedServices.find((s) => String(s.serviceId) === String(serviceId));
        if (exists) {
            if (selectedServices.length === 1) {
                alert("Minimal harus memilih 1 paket layanan!");
                return;
            }
            setSelectedServices(selectedServices.filter((s) => String(s.serviceId) !== String(serviceId)));
        } else {
            setSelectedServices([...selectedServices, { serviceId, quantity: 1 }]);
        }
    };

    // Submit Create Order
    const handleCreateOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCustomerId) {
            alert("Silakan pilih Pelanggan!");
            return;
        }

        if (!selectedVehicleId) {
            alert("Silakan pilih Kendaraan Pelanggan!");
            return;
        }

        if (!selectedStaffId) {
            alert("Silakan pilih Petugas / Detailer!");
            return;
        }

        if (selectedServices.length === 0) {
            alert("Pilih minimal 1 paket layanan!");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CreateOrderPayload = {
                customerId: Number(selectedCustomerId),
                vehicleId: Number(selectedVehicleId),
                staffId: Number(selectedStaffId),
                services: selectedServices.map((item) => ({
                    serviceId: Number(item.serviceId),
                    quantity: Number(item.quantity) || 1
                })),
                notes: orderNotes.trim() || undefined
            };


            await createOrder(payload);
            setIsCreateModalOpen(false);
            await fetchAllData();
        } catch (error: any) {
            console.error("Detail Error Backend:", error.response?.data);
            const errData = error.response?.data;
            const validationErrors = errData?.error || errData?.errors;
            const detailMsg = validationErrors
                ? JSON.stringify(validationErrors, null, 2)
                : errData?.message || error.message || "Gagal membuat transaksi order baru.";
            alert(`Penyebab Error:\n${detailMsg}`);
        } finally {

            setIsSubmitting(false);
        }
    };

    // Quick Update Order Status
    const handleStatusChange = async (orderId: string | number, nextStatus: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, { status: nextStatus });
            await fetchAllData();
        } catch (error: any) {
            console.error("Status Change Error:", error.response?.data);
            const errData = error.response?.data;
            const detailMsg = errData?.error || errData?.errors
                ? JSON.stringify(errData.error || errData.errors, null, 2)
                : errData?.message || error.message || "Gagal memperbarui status order.";
            alert(`Gagal memperbarui status order:\n${detailMsg}`);
        }
    };

    // Submit Payment
    const handlePaymentSubmit = async () => {
        if (!paymentTargetOrder) return;
        try {
            await updateOrderPayment(paymentTargetOrder.id, {
                paymentStatus: "PAID",
                paymentMethod: selectedPaymentMethod
            });
            setPaymentTargetOrder(null);
            await fetchAllData();
        } catch (error: any) {
            console.error("Payment Error:", error.response?.data);
            const errData = error.response?.data;
            const detailMsg = errData?.error || errData?.errors
                ? JSON.stringify(errData.error || errData.errors, null, 2)
                : errData?.message || error.message || "Gagal memproses pembayaran order.";
            alert(`Gagal memproses pembayaran:\n${detailMsg}`);
        }
    };

    // Delete Order
    const handleDeleteOrder = async () => {
        if (!deleteTargetOrder) return;
        setIsDeleting(true);
        try {
            await deleteOrder(deleteTargetOrder.id);
            setDeleteTargetOrder(null);
            await fetchAllData();
        } catch (error: any) {
            console.error("Delete Error:", error.response?.data);
            const errData = error.response?.data;
            const detailMsg = errData?.error || errData?.errors
                ? JSON.stringify(errData.error || errData.errors, null, 2)
                : errData?.message || error.message || "Gagal menghapus transaksi order.";
            alert(`Gagal menghapus order:\n${detailMsg}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const getStatusText = (status: OrderStatus) => {
        switch (status) {
            case "WAITING":
                return { label: "Menunggu Antrean", dot: "bg-amber-400 shadow-[0_0_8px_#fbbf24]", text: "text-amber-400" };
            case "IN_PROGRESS":
                return { label: "Sedang Dikerjakan", dot: "bg-blue-400 shadow-[0_0_8px_#60a5fa]", text: "text-blue-400" };
            case "COMPLETED":
                return { label: "Selesai", dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]", text: "text-emerald-400" };
            case "CANCELLED":
                return { label: "Dibatalkan", dot: "bg-rose-500", text: "text-rose-500" };
            default:
                return { label: status, dot: "bg-neutral-500", text: "text-neutral-400" };
        }
    };

    // Calculated total for modal
    const calculateModalTotal = () => {
        return selectedServices.reduce((acc, item) => {
            const s = services.find((srv) => String(srv.id) === String(item.serviceId));
            return acc + (s ? s.price * item.quantity : 0);
        }, 0);
    };

    return (
        <div className="space-y-8 relative overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link
                            to="/dashboard"
                            className="p-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-purple-500/50 transition-all flex items-center justify-center shadow-lg group"
                            title="Kembali ke Dashboard"
                        >
                            <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-[0.2em] text-white">
                            Transaksi Order<span className="text-purple-500">.</span>
                        </h1>
                    </div>
                    <p className="text-sm text-neutral-400">
                        Kelola antrean pencucian, penugasan teknisi, dan penerimaan pembayaran APEX
                    </p>
                </div>

                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold transition-all duration-300 rounded-2xl py-3.5 px-6 text-xs shadow-lg shadow-purple-900/30 hover:scale-105 cursor-pointer"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    <span>Buat Order Cuci Baru</span>
                </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HiOutlineExclamationCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="underline hover:text-white font-semibold text-xs cursor-pointer"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Filter & Control Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full lg:w-80">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari plat, mobil, pelanggan, petugas..."
                        className="w-full bg-neutral-900/80 border border-neutral-800 text-white placeholder-neutral-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-2xl py-3 pl-12 pr-10 text-xs outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                            <HiOutlineX className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* 1 Single Practical Filter Bar & View Switcher */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl p-1 text-xs">
                        {[
                            { id: "ALL", label: "Semua" },
                            { id: "WAITING", label: "Antrean" },
                            { id: "IN_PROGRESS", label: "Dicuci" },
                            { id: "COMPLETED", label: "Selesai" },
                            { id: "UNPAID", label: "Belum Lunas" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterCategory(tab.id)}
                                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${filterCategory === tab.id
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "text-neutral-400 hover:text-white"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "grid" ? "bg-purple-600 text-white shadow-md" : "text-neutral-400 hover:text-white"
                                }`}
                            title="Tampilan Kartu"
                        >
                            <HiOutlineViewGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "table" ? "bg-purple-600 text-white shadow-md" : "text-neutral-400 hover:text-white"
                                }`}
                            title="Tampilan Tabel"
                        >
                            <HiOutlineViewList className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {isLoading ? (
                <div className="py-20 text-center text-neutral-400">
                    <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Memuat data transaksi order...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-3xl p-12 text-center text-neutral-400 shadow-2xl">
                    <p className="text-xl font-bold text-white mb-2">Belum Ada Transaksi Order</p>
                    <p className="text-xs mb-6 max-w-sm mx-auto">
                        {searchQuery || filterCategory !== "ALL"
                            ? "Tidak ada order yang cocok dengan kriteria filter Anda."
                            : "Silakan buat transaksi order pencucian pertama untuk memulai aktivitas carwash."}
                    </p>
                    {filterCategory === "ALL" && !searchQuery && (
                        <button
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-purple-900/40 hover:scale-105 cursor-pointer"
                        >
                            <HiOutlinePlus className="w-4 h-4" /> Buat Order Pertama
                        </button>
                    )}
                </div>
            ) : viewMode === "grid" ? (
                /* Clean Card Grid View without Photos */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map((order) => {
                        const statusObj = getStatusText(order.status);

                        return (
                            <div
                                key={order.id}
                                className="group relative bg-neutral-950/90 border border-neutral-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/60 hover:shadow-[0_15px_35px_rgba(168,85,247,0.2)] overflow-hidden"
                            >
                                <div className="space-y-4">
                                    {/* Card Header: Vehicle & Quick Actions */}
                                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-800/80">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-lg border border-neutral-800">
                                                    #{order.id}
                                                </span>
                                                <h3 className="font-mono font-black text-white text-lg tracking-wider group-hover:text-purple-300 transition-colors">
                                                    {order.vehicle?.plateNumber || "NO PLAT"}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-neutral-400 font-medium mt-0.5">
                                                {order.vehicle?.brand} {order.vehicle?.model} {order.vehicle?.color ? `• ${order.vehicle.color}` : ""}
                                            </p>
                                        </div>

                                        {/* Action Icons */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => setSelectedInvoiceOrder(order)}
                                                className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer"
                                                title="Lihat Nota / Invoice"
                                            >
                                                <HiOutlinePrinter className="w-4 h-4 text-purple-400" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTargetOrder(order)}
                                                className="p-2 bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-500/50 text-neutral-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                                                title="Hapus / Batalkan Order"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status & Payment Indicator Row */}
                                    <div className="flex items-center justify-between text-xs pb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${statusObj.dot}`} />
                                            <span className={`font-semibold ${statusObj.text}`}>{statusObj.label}</span>
                                        </div>
                                        <div>
                                            <span
                                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg ${order.paymentStatus === "PAID"
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                    }`}
                                            >
                                                {order.paymentStatus === "PAID" ? `LUNAS (${order.paymentMethod || "PAID"})` : "BELUM BAYAR"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer & Staff Info */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase">Pelanggan</p>
                                            <p className="font-bold text-white truncate mt-0.5">{order.customer?.name || "Customer"}</p>
                                            <p className="text-[10px] text-neutral-400 font-mono truncate">{order.customer?.phone || "-"}</p>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase">Petugas</p>
                                            <p className="font-bold text-white truncate mt-0.5">{order.staff?.name || "Belum Ditugaskan"}</p>
                                            <p className="text-[10px] text-purple-400 font-mono">Detailer APEX</p>
                                        </div>
                                    </div>

                                    {/* Service Items Summary */}
                                    <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1.5">
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase">Layanan Dipilih</p>
                                        <div className="space-y-1">
                                            {order.orderItems?.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between text-xs">
                                                    <span className="text-neutral-300 truncate max-w-[150px]">
                                                        {item.service?.name || "Layanan Cuci"}
                                                    </span>
                                                    <span className="font-mono text-neutral-400">{formatCurrency(item.subtotal || item.price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total Price */}
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs text-neutral-400">Total Tagihan:</span>
                                        <span className="text-lg font-mono font-black text-white">
                                            {formatCurrency(order.totalPrice)}
                                        </span>
                                    </div>
                                </div>

                                {/* Single Dynamic Progression Button */}
                                <div className="mt-5 pt-4 border-t border-neutral-800/60">
                                    {order.status === "WAITING" && (
                                        <button
                                            onClick={() => handleStatusChange(order.id, "IN_PROGRESS")}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-4 rounded-2xl text-xs transition-all duration-300 shadow-lg shadow-blue-900/30 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <HiOutlineClock className="w-4 h-4" />
                                            <span>Mulai Cuci</span>
                                        </button>
                                    )}

                                    {order.status === "IN_PROGRESS" && (
                                        <button
                                            onClick={() => handleStatusChange(order.id, "COMPLETED")}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-2xl text-xs transition-all duration-300 shadow-lg shadow-emerald-900/30 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <HiOutlineCheck className="w-4 h-4" />
                                            <span>Tandai Selesai</span>
                                        </button>
                                    )}

                                    {order.status === "COMPLETED" && order.paymentStatus === "UNPAID" && (
                                        <button
                                            onClick={() => setPaymentTargetOrder(order)}
                                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3 px-4 rounded-2xl text-xs transition-all duration-300 shadow-lg shadow-purple-900/30 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <HiOutlineCurrencyDollar className="w-4 h-4" />
                                            <span>Bayar Sekarang</span>
                                        </button>
                                    )}

                                    {order.status === "COMPLETED" && order.paymentStatus === "PAID" && (
                                        <button
                                            onClick={() => setSelectedInvoiceOrder(order)}
                                            className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white font-bold py-3 px-4 rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <HiOutlinePrinter className="w-4 h-4 text-purple-400" />
                                            <span>Transaksi Lunas • Lihat Nota</span>
                                        </button>
                                    )}

                                    {order.status === "CANCELLED" && (
                                        <div className="w-full text-center py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs font-semibold">
                                            Order Dibatalkan
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Table View */
                <div className="bg-neutral-950/90 border border-neutral-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-neutral-300">
                            <thead className="bg-neutral-900 text-xs font-semibold text-neutral-400 uppercase border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4">ID & Kendaraan</th>
                                    <th className="px-6 py-4">Pelanggan</th>
                                    <th className="px-6 py-4">Petugas</th>
                                    <th className="px-6 py-4">Layanan</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status Cuci</th>
                                    <th className="px-6 py-4">Pembayaran</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/60 font-sans">
                                {filteredOrders.map((order) => {
                                    const statusObj = getStatusText(order.status);

                                    return (
                                        <tr key={order.id} className="hover:bg-neutral-900/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-mono font-bold text-white text-sm">
                                                        {order.vehicle?.plateNumber || "NO PLAT"}
                                                    </p>
                                                    <p className="text-[11px] text-neutral-400">
                                                        {order.vehicle?.brand} {order.vehicle?.model}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-white">{order.customer?.name || "Customer"}</p>
                                                <p className="text-[11px] text-neutral-400 font-mono">{order.customer?.phone || "-"}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-neutral-200 font-medium">{order.staff?.name || "Belum Ditugaskan"}</p>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate text-neutral-400">
                                                {order.orderItems?.map((i) => i.service?.name).join(", ") || "-"}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-white">
                                                {formatCurrency(order.totalPrice)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 font-medium ${statusObj.text}`}>
                                                    <span className={`w-2 h-2 rounded-full ${statusObj.dot}`} />
                                                    {statusObj.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${order.paymentStatus === "PAID"
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                        }`}
                                                >
                                                    {order.paymentStatus === "PAID" ? "LUNAS" : "BELUM BAYAR"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {order.paymentStatus === "UNPAID" && (
                                                        <button
                                                            onClick={() => setPaymentTargetOrder(order)}
                                                            className="p-2 bg-purple-950/60 hover:bg-purple-900 border border-purple-800/40 text-purple-300 rounded-xl transition-all cursor-pointer"
                                                            title="Bayar"
                                                        >
                                                            <HiOutlineCurrencyDollar className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedInvoiceOrder(order)}
                                                        className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl transition-all cursor-pointer"
                                                        title="Lihat Nota"
                                                    >
                                                        <HiOutlinePrinter className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTargetOrder(order)}
                                                        className="p-2 bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-500/50 text-neutral-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                                                        title="Hapus Order"
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

            {/* Create Order Modal - Wide & Spacious Layout */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-neutral-950 border border-neutral-800 w-full max-w-4xl rounded-3xl shadow-2xl p-6 sm:p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between pb-4 border-b border-neutral-800/80">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-white">Buat Transaksi Order Baru</h3>
                                <p className="text-neutral-400 text-xs mt-1">
                                    Hubungkan pelanggan, kendaraan, staf penanggung jawab, dan pilih paket perawatan APEX.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-neutral-900 transition-colors"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrderSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Column: Client, Vehicle, Staff & Notes (5 Cols) */}
                                <div className="lg:col-span-5 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-300">
                                            Pilih Pelanggan <span className="text-purple-500">*</span>
                                        </label>
                                        <select
                                            value={selectedCustomerId}
                                            onChange={(e) => handleCustomerChange(e.target.value)}
                                            className="w-full bg-neutral-900/90 border border-neutral-800 text-white text-xs rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all cursor-pointer"
                                            required
                                        >
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
                                            Pilih Kendaraan Pelanggan <span className="text-purple-500">*</span>
                                        </label>
                                        <select
                                            value={selectedVehicleId}
                                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                                            className="w-full bg-neutral-900/90 border border-neutral-800 text-white text-xs rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>-- Pilih Kendaraan --</option>
                                            {vehicles
                                                .filter((v) => String(v.customerId) === String(selectedCustomerId))
                                                .map((v) => (
                                                    <option key={v.id} value={v.id} className="bg-neutral-950 text-white font-mono">
                                                        {v.plateNumber} - {v.brand} {v.model} ({v.color || "Standar"})
                                                    </option>
                                                ))}
                                        </select>
                                        {vehicles.filter((v) => String(v.customerId) === String(selectedCustomerId)).length === 0 && (
                                            <p className="text-[11px] text-amber-400 mt-1">
                                                Pelanggan ini belum memiliki kendaraan terdaftar.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-300">
                                            Petugas / Detailer yang Bertugas <span className="text-purple-500">*</span>
                                        </label>
                                        <select
                                            value={selectedStaffId}
                                            onChange={(e) => setSelectedStaffId(e.target.value)}
                                            className="w-full bg-neutral-900/90 border border-neutral-800 text-white text-xs rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>-- Pilih Petugas --</option>
                                            {staffs.map((s) => (
                                                <option key={s.id} value={s.id} className="bg-neutral-950 text-white">
                                                    {s.name} ({s.isActive ? "Siap Bertugas" : "Cuti"})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-300">Catatan Khusus (Opsional)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Contoh: Fokus pembersihan jamur kaca & velg..."
                                            value={orderNotes}
                                            onChange={(e) => setOrderNotes(e.target.value)}
                                            className="w-full bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 text-xs rounded-2xl p-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Services Multi-Select & Total Summary (7 Cols) */}
                                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-neutral-300">
                                                Pilih Paket Layanan Perawatan <span className="text-purple-500">*</span>
                                            </label>
                                            <span className="text-[11px] text-purple-400 font-medium">Bisa memilih lebih dari 1</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                                            {services.map((srv) => {
                                                const isSelected = selectedServices.some((s) => String(s.serviceId) === String(srv.id));

                                                return (
                                                    <div
                                                        key={srv.id}
                                                        onClick={() => handleToggleService(srv.id)}
                                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                                                            ? "bg-purple-950/50 border-purple-500 text-white shadow-lg shadow-purple-900/30"
                                                            : "bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900"
                                                            }`}
                                                    >
                                                        <div className="space-y-0.5">
                                                            <p className="font-extrabold text-xs text-white">{srv.name}</p>
                                                            <p className="text-[10px] text-neutral-400">{srv.duration || 45} Menit pengerjaan</p>
                                                            <p className="text-xs font-mono font-bold text-purple-400 mt-1">{formatCurrency(srv.price)}</p>
                                                        </div>
                                                        <div
                                                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${isSelected ? "bg-purple-600 border-purple-500 text-white" : "border-neutral-700 bg-neutral-950"
                                                                }`}
                                                        >
                                                            {isSelected && <HiOutlineCheck className="w-3.5 h-3.5" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Total Summary Box */}
                                    <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Estimasi Total Tagihan</p>
                                            <p className="text-2xl font-mono font-black text-white">{formatCurrency(calculateModalTotal())}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-300 font-semibold text-xs">
                                                {selectedServices.length} Layanan Terpilih
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 px-8 rounded-2xl text-xs shadow-lg shadow-purple-900/40 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? "Membuat Order..." : "Konfirmasi & Buat Order"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {paymentTargetOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
                    <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                            <div>
                                <h3 className="text-lg font-bold text-white">Pembayaran Order #{paymentTargetOrder.id}</h3>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                    {paymentTargetOrder.vehicle?.plateNumber} - {paymentTargetOrder.customer?.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setPaymentTargetOrder(null)}
                                className="text-neutral-400 hover:text-white"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Amount Due */}
                        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                            <p className="text-xs text-neutral-400">Total Tagihan Pembayaran</p>
                            <p className="text-2xl font-mono font-black text-white mt-1">
                                {formatCurrency(paymentTargetOrder.totalPrice)}
                            </p>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-300">Pilih Metode Pembayaran</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["QRIS", "CASH", "TRANSFER"] as PaymentMethod[]).map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setSelectedPaymentMethod(method)}
                                        className={`py-3 px-2 rounded-2xl font-mono font-bold text-xs border transition-all cursor-pointer ${selectedPaymentMethod === method
                                            ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30"
                                            : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                                            }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setPaymentTargetOrder(null)}
                                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-bold py-3 px-5 rounded-2xl text-xs transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handlePaymentSubmit}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-6 rounded-2xl text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                            >
                                Terima Pembayaran
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice / Official Detailing Receipt Modal */}
            {selectedInvoiceOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
                        {/* Receipt Container */}
                        <div className="bg-neutral-900/60 border border-neutral-800/90 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                            {/* Watermark Logo */}
                            <div className="absolute right-6 bottom-16 opacity-5 pointer-events-none select-none text-8xl font-black text-white font-mono">
                                APEX
                            </div>

                            {/* Header: Company Profile & Receipt Meta */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-dashed border-neutral-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-black tracking-widest text-white">
                                            APEX<span className="text-purple-500">.</span>
                                        </h2>
                                        <span className="text-[10px] uppercase font-mono tracking-widest bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full font-bold">
                                            Carwash & Detailing
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Nota Transaksi Layanan Carwash APEX
                                    </p>
                                </div>

                                <div className="text-left sm:text-right space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Official Receipt</p>
                                    <p className="font-mono font-bold text-white text-sm">
                                        INV-APX-{String(selectedInvoiceOrder.id).padStart(5, "0")}
                                    </p>
                                    <p className="text-[11px] text-neutral-400 font-mono">
                                        {new Date(selectedInvoiceOrder.createdAt || Date.now()).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric"
                                        })}
                                    </p>
                                    <div className="inline-block mt-1">
                                        <span
                                            className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg border ${selectedInvoiceOrder.paymentStatus === "PAID"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                                }`}
                                        >
                                            {selectedInvoiceOrder.paymentStatus === "PAID"
                                                ? `✓ LUNAS (${selectedInvoiceOrder.paymentMethod || "QRIS"})`
                                                : "✕ BELUM LUNAS"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Client & Vehicle Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs">
                                <div>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Data Pelanggan</p>
                                    <p className="font-bold text-white text-sm mt-0.5">{selectedInvoiceOrder.customer?.name || "Customer"}</p>
                                    <p className="text-neutral-400 font-mono">{selectedInvoiceOrder.customer?.phone || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Kendaraan</p>
                                    <p className="font-mono font-black text-purple-300 text-sm mt-0.5">
                                        {selectedInvoiceOrder.vehicle?.plateNumber || "NO PLAT"}
                                    </p>
                                    <p className="text-neutral-400">
                                        {selectedInvoiceOrder.vehicle?.brand} {selectedInvoiceOrder.vehicle?.model} {selectedInvoiceOrder.vehicle?.color ? `(${selectedInvoiceOrder.vehicle.color})` : ""}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Detailer Bertugas</p>
                                    <p className="font-bold text-white text-sm mt-0.5">{selectedInvoiceOrder.staff?.name || "Petugas APEX"}</p>
                                    <p className="text-neutral-400">Status: {selectedInvoiceOrder.status === "COMPLETED" ? "Selesai Dicuci" : "Dalam Pengerjaan"}</p>
                                </div>
                            </div>

                            {/* Itemized Table */}
                            <div className="space-y-2">
                                <div className="border border-neutral-800 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left text-xs text-neutral-300">
                                        <thead className="bg-neutral-950 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                                            <tr>
                                                <th className="py-3 px-4">Deskripsi Layanan</th>
                                                <th className="py-3 px-3 text-center">Durasi</th>
                                                <th className="py-3 px-3 text-center">Qty</th>
                                                <th className="py-3 px-4 text-right">Harga Satuan</th>
                                                <th className="py-3 px-4 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-800/80 bg-neutral-900/40">
                                            {selectedInvoiceOrder.orderItems?.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-neutral-900/80 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <p className="font-bold text-white">{item.service?.name || "Layanan Cuci"}</p>
                                                        <p className="text-[10px] text-neutral-500">{item.service?.description || "Standar treatment"}</p>
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-mono text-neutral-400">
                                                        {item.service?.duration || 45} mnt
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-mono font-bold text-white">
                                                        {item.quantity || 1}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono text-neutral-400">
                                                        {formatCurrency(item.price)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                                                        {formatCurrency(item.subtotal || item.price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Financial Summary & Breakdown */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                                <div className="space-y-1 text-xs">
                                    <p className="text-neutral-400">
                                        Metode Pembayaran: <span className="font-mono font-bold text-white">{selectedInvoiceOrder.paymentMethod || "QRIS"}</span>
                                    </p>
                                    <p className="text-neutral-500 text-[11px]">
                                        Status Transaksi: <span className="text-purple-400 font-semibold">{selectedInvoiceOrder.paymentStatus === "PAID" ? "Lunas" : "Menunggu Pembayaran"}</span>
                                    </p>
                                </div>

                                <div className="text-left sm:text-right">
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Total Pembayaran</p>
                                    <p className="text-2xl sm:text-3xl font-mono font-black text-purple-400">
                                        {formatCurrency(selectedInvoiceOrder.totalPrice)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setSelectedInvoiceOrder(null)}
                                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition-all cursor-pointer"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 px-7 rounded-2xl text-xs shadow-lg shadow-purple-900/40 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <HiOutlinePrinter className="w-4 h-4" />
                                <span>Cetak Nota</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTargetOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
                    <div className="bg-neutral-950 border border-neutral-800 w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/30">
                            <HiOutlineTrash className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white">Hapus Order #{deleteTargetOrder.id}?</h3>
                            <p className="text-neutral-400 text-xs">
                                Anda yakin ingin menghapus transaksi order ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setDeleteTargetOrder(null)}
                                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-bold py-3 px-5 rounded-2xl text-xs transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteOrder}
                                disabled={isDeleting}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-5 rounded-2xl text-xs shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
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

export default OrderList;
