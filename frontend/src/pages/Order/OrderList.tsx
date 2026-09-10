import React, { useState, useEffect } from "react";
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
  HiOutlinePrinter,
  HiOutlineUserGroup,
  HiCheck
} from "react-icons/hi";
import {
  getOrders, createOrder, updateOrderStatus, updateOrderPayment, deleteOrder, updateOrder
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

const OrderList: React.FC = () => {
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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const [paymentTargetOrder, setPaymentTargetOrder] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("QRIS");

  const [deleteTargetOrder, setDeleteTargetOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [assignStaffTargetOrder, setAssignStaffTargetOrder] = useState<Order | null>(null);
  const [assignStaffSelectedId, setAssignStaffSelectedId] = useState<string | number>("");
  const [isAssigningStaff, setIsAssigningStaff] = useState(false);

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

  const handleCustomerChange = (custId: string | number) => {
    setSelectedCustomerId(custId);
    const availableVehicles = vehicles.filter((v) => String(v.customerId) === String(custId));
    setSelectedVehicleId(availableVehicles.length > 0 ? availableVehicles[0].id : "");
  };

  const handleToggleService = (serviceId: string | number) => {
    const exists = selectedServices.find((s) => String(s.serviceId) === String(serviceId));
    if (exists) {
      if (selectedServices.length === 1) {
        alert("Minimal harus memilih 1 paket layanan");
        return;
      }
      setSelectedServices(selectedServices.filter((s) => String(s.serviceId) !== String(serviceId)));
    } else {
      setSelectedServices([...selectedServices, { serviceId, quantity: 1 }]);
    }
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      alert("Silakan pilih Pelanggan");
      return;
    }

    if (!selectedVehicleId) {
      alert("Silakan pilih Kendaraan Pelanggan");
      return;
    }

    if (!selectedStaffId) {
      alert("Silakan pilih Petugas");
      return;
    }

    if (selectedServices.length === 0) {
      alert("Pilih minimal 1 paket layanan");
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
      const errData = error.response?.data;
      const detailMsg = errData?.message || error.message || "Gagal membuat transaksi order baru";
      alert(`Gagal: ${detailMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId: string | number, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, { status: nextStatus });
      await fetchAllData();
    } catch (error: any) {
      const errData = error.response?.data;
      const detailMsg = errData?.message || error.message || "Gagal memperbarui status order";
      alert(`Gagal: ${detailMsg}`);
    }
  };

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
      const errData = error.response?.data;
      const detailMsg = errData?.message || error.message || "Gagal memproses pembayaran order";
      alert(`Gagal: ${detailMsg}`);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteTargetOrder) return;
    setIsDeleting(true);
    try {
      await deleteOrder(deleteTargetOrder.id);
      setDeleteTargetOrder(null);
      await fetchAllData();
    } catch (error: any) {
      const errData = error.response?.data;
      const detailMsg = errData?.message || error.message || "Gagal menghapus transaksi order";
      alert(`Gagal: ${detailMsg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenAssignStaff = (order: Order) => {
    setAssignStaffTargetOrder(order);
    setAssignStaffSelectedId(order.staffId || "");
  };

  const handleAssignStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStaffTargetOrder) return;
    if (!assignStaffSelectedId) {
      alert("Silakan pilih staf teknisi yang bertugas.");
      return;
    }

    setIsAssigningStaff(true);
    try {
      await updateOrder(assignStaffTargetOrder.id, {
        staffId: Number(assignStaffSelectedId),
      });
      setAssignStaffTargetOrder(null);
      await fetchAllData();
    } catch (error: any) {
      const errData = error.response?.data;
      const detailMsg = errData?.message || error.message || "Gagal menugaskan staf";
      alert(`Gagal: ${detailMsg}`);
    } finally {
      setIsAssigningStaff(false);
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
        return { label: "Menunggu Antrean", badge: "bg-amber-50 text-amber-700 border-amber-200" };
      case "IN_PROGRESS":
        return { label: "Sedang Dicuci", badge: "bg-purple-50 text-purple-700 border-purple-200" };
      case "COMPLETED":
        return { label: "Selesai", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "CANCELLED":
        return { label: "Dibatalkan", badge: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: status, badge: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const calculateModalTotal = () => {
    return selectedServices.reduce((acc, item) => {
      const s = services.find((srv) => String(srv.id) === String(item.serviceId));
      return acc + (s ? Number(s.price) * item.quantity : 0);
    }, 0);
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
              Antrean Kasir<span className="text-purple-600">.</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Kelola antrean pencucian, penugasan teknisi, dan penerimaan pembayaran APEX
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold transition rounded-full py-3 px-6 text-xs shadow-md"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Buat Order Cuci Baru</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchAllData}
            className="underline hover:text-rose-900 font-bold text-xs"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari plat, mobil, pelanggan, petugas..."
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

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 text-xs shadow-sm">
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
                className={`px-3.5 py-1.5 rounded-full font-bold transition ${
                  filterCategory === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition ${viewMode === "grid" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              title="Tampilan Kartu"
            >
              <HiOutlineViewGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-full transition ${viewMode === "table" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              title="Tampilan Tabel"
            >
              <HiOutlineViewList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl">
          <div className="inline-block w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold uppercase tracking-wider">Memuat data order...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
          <p className="text-lg font-bold text-slate-900 mb-1">Belum Ada Transaksi Order</p>
          <p className="text-xs mb-6 max-w-sm mx-auto">
            {searchQuery ? "Tidak ada order yang cocok dengan pencarian Anda" : "Silakan buat order cuci baru untuk memulai transaksi kasir"}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-full transition shadow-md"
            >
              <HiOutlinePlus className="w-4 h-4" /> Buat Order Baru
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const statusMeta = getStatusText(order.status);
            const isPaid = order.paymentStatus === "PAID";
            const servicesList = order.orderItems?.map((item) => item.service?.name).join(", ");

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #ORD-{String(order.id).padStart(3, "0")}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusMeta.badge}`}>
                        {order.status}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {isPaid ? "Lunas" : "Belum Bayar"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      {order.customer?.name || "Pelanggan"}
                    </h3>
                    <p className="text-xs font-mono text-purple-700 font-bold mt-0.5">
                      {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.plateNumber})` : "Kendaraan -"}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                    <p className="text-slate-700">
                      <span className="text-slate-400 font-semibold">Layanan:</span> {servicesList || "Layanan Cuci"}
                    </p>
                    <p className="text-slate-700">
                      <span className="text-slate-400 font-semibold">Petugas:</span> {order.staff?.name || "Belum Ditugaskan"}
                    </p>
                    {order.notes && (
                      <p className="text-slate-500 text-[11px] italic">
                        Catatan: "{order.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">Total Tagihan</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleOpenAssignStaff(order)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-full border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                        title="Tugaskan / Ganti Staf Cuci"
                      >
                        <HiOutlineUserGroup className="w-3.5 h-3.5 text-slate-600" />
                        <span>{order.staffId ? "Ganti Staf" : "Pilih Staf"}</span>
                      </button>
                    )}
                    {order.status === "WAITING" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "IN_PROGRESS")}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-full transition shadow-sm"
                      >
                        Mulai Cuci
                      </button>
                    )}
                    {order.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "COMPLETED")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full transition shadow-sm"
                      >
                        Selesai
                      </button>
                    )}
                    {!isPaid && (
                      <button
                        onClick={() => setPaymentTargetOrder(order)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs rounded-full transition"
                      >
                        Bayar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full transition shadow-sm"
                      title="Cetak Faktur"
                    >
                      <HiOutlinePrinter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetOrder(order)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-full transition"
                      title="Hapus Order"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
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
                  <th className="px-6 py-4">Order &amp; Pelanggan</th>
                  <th className="px-6 py-4">Kendaraan</th>
                  <th className="px-6 py-4">Layanan</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status &amp; Pembayaran</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const statusMeta = getStatusText(order.status);
                  const isPaid = order.paymentStatus === "PAID";
                  const servicesList = order.orderItems?.map((item) => item.service?.name).join(", ");

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-mono font-bold text-slate-400 block">
                          #ORD-{String(order.id).padStart(3, "0")}
                        </span>
                        <p className="font-extrabold text-slate-900 text-sm">{order.customer?.name || "Pelanggan"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{order.vehicle?.brand} {order.vehicle?.model}</p>
                        <p className="text-[11px] font-mono text-purple-700 font-bold">{order.vehicle?.plateNumber}</p>
                      </td>
                      <td className="px-6 py-4 max-w-xs text-slate-600 truncate">
                        {servicesList || "Layanan Cuci"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusMeta.badge}`}>
                            {order.status}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {isPaid ? "Lunas" : "Belum Bayar"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                            <button
                              onClick={() => handleOpenAssignStaff(order)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-full border border-slate-200 cursor-pointer"
                              title="Tugaskan / Ganti Staf Cuci"
                            >
                              {order.staffId ? "Ganti Staf" : "Pilih Staf"}
                            </button>
                          )}
                          {order.status === "WAITING" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "IN_PROGRESS")}
                              className="px-2.5 py-1 bg-slate-900 text-white font-bold text-[11px] rounded-full"
                            >
                              Cuci
                            </button>
                          )}
                          {order.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "COMPLETED")}
                              className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-full"
                            >
                              Selesai
                            </button>
                          )}
                          {!isPaid && (
                            <button
                              onClick={() => setPaymentTargetOrder(order)}
                              className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px] rounded-full"
                            >
                              Bayar
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="p-1.5 bg-white border border-slate-200 text-slate-700 rounded-full"
                            title="Faktur"
                          >
                            <HiOutlinePrinter className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetOrder(order)}
                            className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-full"
                            title="Hapus"
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

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl p-6 relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Buat Transaksi Order Baru</h3>
                <p className="text-slate-400 text-xs mt-0.5">Daftarkan antrean pencucian dan detailing kendaraan</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pelanggan</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none"
                    required
                  >
                    <option value="" disabled>-- Pilih Pelanggan --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kendaraan</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none"
                    required
                  >
                    <option value="" disabled>-- Pilih Kendaraan --</option>
                    {vehicles
                      .filter((v) => !selectedCustomerId || String(v.customerId) === String(selectedCustomerId))
                      .map((v) => (
                        <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plateNumber})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Petugas Cuci / Detailer</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none"
                  required
                >
                  <option value="" disabled>-- Pilih Petugas --</option>
                  {staffs.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} {s.isActive ? "(Aktif)" : "(Off)"}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Pilih Paket Layanan</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {services.map((srv) => {
                    const isSelected = selectedServices.some((s) => String(s.serviceId) === String(srv.id));
                    return (
                      <div
                        key={srv.id}
                        onClick={() => handleToggleService(srv.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs ${
                          isSelected ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <div>
                          <p className="font-bold">{srv.name}</p>
                          <p className={`text-[11px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>{formatCurrency(srv.price)}</p>
                        </div>
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? "bg-white text-slate-900 border-white" : "border-slate-300 text-transparent"
                        }`}>
                          <HiCheck className="w-3 h-3" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Fokus bersihkan interior dan velg"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-slate-800 outline-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">Total Estimasi Biaya</span>
                <span className="text-lg font-black text-slate-900">{formatCurrency(calculateModalTotal())}</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-full transition disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? "Memproses..." : "Buat Order Cuci"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Pembayaran Kasir</h3>
              <button onClick={() => setPaymentTargetOrder(null)} className="text-slate-400 hover:text-slate-700">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400">Order #{paymentTargetOrder.id} • {paymentTargetOrder.customer?.name}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(paymentTargetOrder.totalPrice)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Metode Pembayaran</label>
              {(["CASH", "QRIS", "TRANSFER"] as PaymentMethod[]).map((m) => (
                <div
                  key={m}
                  onClick={() => setSelectedPaymentMethod(m)}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between text-xs font-bold transition ${
                    selectedPaymentMethod === m ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <span>{m}</span>
                  {selectedPaymentMethod === m && <HiCheck className="w-4 h-4" />}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPaymentTargetOrder(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md transition"
              >
                Konfirmasi Lunas
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Faktur Transaksi APEX</h3>
              <button onClick={() => setSelectedInvoiceOrder(null)} className="text-slate-400 hover:text-slate-700">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 text-xs space-y-3 font-mono">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-black text-base text-slate-900">APEX CARWASH</p>
                <p className="text-[10px] text-slate-400">Jl. Premium Automotive No. 88</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">No. Order:</span>
                  <span className="font-bold text-slate-900">#ORD-{String(selectedInvoiceOrder.id).padStart(3, "0")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pelanggan:</span>
                  <span className="font-bold text-slate-900">{selectedInvoiceOrder.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kendaraan:</span>
                  <span className="font-bold text-slate-900">{selectedInvoiceOrder.vehicle?.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Petugas:</span>
                  <span className="font-bold text-slate-900">{selectedInvoiceOrder.staff?.name || "-"}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 space-y-1.5">
                {selectedInvoiceOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-800">
                    <span>{item.service?.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-300 flex justify-between font-black text-slate-900 text-sm">
                <span>TOTAL:</span>
                <span>{formatCurrency(selectedInvoiceOrder.totalPrice)}</span>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400">
                <p>Status: {selectedInvoiceOrder.paymentStatus === "PAID" ? "LUNAS" : "BELUM LUNAS"}</p>
                <p>Terima kasih atas kepercayaan Anda</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-full shadow-md flex items-center gap-1.5"
              >
                <HiOutlinePrinter /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <HiOutlineTrash className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 mb-1">Hapus Transaksi Order</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Anda yakin ingin menghapus order <span className="font-bold text-slate-900">#ORD-{deleteTargetOrder.id}</span>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-md transition disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {assignStaffTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Tugaskan Petugas Cuci
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Order #ORD-{String(assignStaffTargetOrder.id).padStart(3, "0")} • {assignStaffTargetOrder.vehicle?.brand} {assignStaffTargetOrder.vehicle?.model} ({assignStaffTargetOrder.vehicle?.plateNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignStaffTargetOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <HiOutlineX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignStaffSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Daftar Petugas (Aktif &amp; Tidak Aktif):
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {staffs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada data staf terdaftar.</p>
                  ) : (
                    staffs.map((staff) => {
                      const isSelected = String(assignStaffSelectedId) === String(staff.id);
                      return (
                        <div
                          key={staff.id}
                          onClick={() => {
                            if (staff.isActive) {
                              setAssignStaffSelectedId(staff.id);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                            !staff.isActive
                              ? "opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed"
                              : isSelected
                              ? "border-slate-900 bg-slate-900 text-white cursor-pointer shadow-sm"
                              : "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="staffOptionOrderList"
                              checked={isSelected}
                              disabled={!staff.isActive}
                              onChange={() => setAssignStaffSelectedId(staff.id)}
                              className="accent-slate-900 cursor-pointer"
                            />
                            <div>
                              <p className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                                {staff.name}
                              </p>
                              <p className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                                {staff.phone || "Teknisi Cuci"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              staff.isActive
                                ? isSelected
                                  ? "bg-emerald-500 text-white"
                                  : "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {staff.isActive ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignStaffTargetOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAssigningStaff || !assignStaffSelectedId}
                  className="px-5 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer"
                >
                  {isAssigningStaff ? "Menyimpan..." : "Tugaskan Staf"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
