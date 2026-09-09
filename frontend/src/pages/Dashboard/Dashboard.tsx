import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineExternalLink,
  HiOutlineCalendar
} from "react-icons/hi";
import { getCustomer } from "../../services/customerService";
import { getOrders, updateOrderStatus, updateOrderPayment, updateOrder } from "../../services/orderService";
import { getStaffs } from "../../services/staffService";
import type { Customer } from "../../types/customer";
import type { Order, OrderStatus } from "../../types/order";
import type { Staff } from "../../types/staff";
import socket from "../../config/socket";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTabFilter, setActiveTabFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [assignStaffTargetOrder, setAssignStaffTargetOrder] = useState<Order | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | string>("");
  const [isAssigningStaff, setIsAssigningStaff] = useState<boolean>(false);

  // State Rekap Pendapatan (Hari Ini, Bulan Ini, Tahun Ini, Total)
  const [revenuePeriod, setRevenuePeriod] = useState<"TODAY" | "MONTH" | "YEAR" | "ALL">("TODAY");
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState<boolean>(false);
  const [modalTransactionFilter, setModalTransactionFilter] = useState<"TODAY" | "MONTH" | "YEAR" | "ALL">("TODAY");

  const adminDataString = localStorage.getItem("admin");
  const admin = adminDataString ? JSON.parse(adminDataString) : { name: "Admin APEX", email: "admin@apexcarwash.com" };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [customersData, ordersData, staffsData] = await Promise.all([
        getCustomer().catch(() => []),
        getOrders().catch(() => []),
        getStaffs().catch(() => []),
      ]);
      setCustomers(customersData);
      setOrders(ordersData);
      setStaffs(staffsData);
    } catch (error) {
      console.error("Gagal mengambil data dashboard", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleStatusUpdate = () => {
      fetchDashboardData();
    };

    socket.on("ORDER_STATUS_UPDATED", handleStatusUpdate);

    return () => {
      socket.off("ORDER_STATUS_UPDATED", handleStatusUpdate);
    };
  }, []);

  // --- PERHITUNGAN REKAP PENDAPATAN (HARI INI, BULAN INI, TAHUN INI, TOTAL) ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");

  // 1. Pendapatan Hari Ini
  const todayPaidOrders = paidOrders.filter((o) => {
    const d = new Date(o.createdAt);
    return (
      !isNaN(d.getTime()) &&
      d.getFullYear() === currentYear &&
      d.getMonth() === currentMonth &&
      d.getDate() === currentDate
    );
  });
  const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

  // 2. Pendapatan Bulan Ini
  const thisMonthPaidOrders = paidOrders.filter((o) => {
    const d = new Date(o.createdAt);
    return (
      !isNaN(d.getTime()) &&
      d.getFullYear() === currentYear &&
      d.getMonth() === currentMonth
    );
  });
  const thisMonthRevenue = thisMonthPaidOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

  // 3. Pendapatan Tahun Ini
  const thisYearPaidOrders = paidOrders.filter((o) => {
    const d = new Date(o.createdAt);
    return !isNaN(d.getTime()) && d.getFullYear() === currentYear;
  });
  const thisYearRevenue = thisYearPaidOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

  // 4. Total Keseluruhan
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

  // Nominal & Label yang aktif di kartu metrik Dashboard
  const displayedRevenue =
    revenuePeriod === "TODAY"
      ? todayRevenue
      : revenuePeriod === "MONTH"
      ? thisMonthRevenue
      : revenuePeriod === "YEAR"
      ? thisYearRevenue
      : totalRevenue;

  const displayedCount =
    revenuePeriod === "TODAY"
      ? todayPaidOrders.length
      : revenuePeriod === "MONTH"
      ? thisMonthPaidOrders.length
      : revenuePeriod === "YEAR"
      ? thisYearPaidOrders.length
      : paidOrders.length;

  const displayedLabel =
    revenuePeriod === "TODAY"
      ? "Hari Ini"
      : revenuePeriod === "MONTH"
      ? "Bulan Ini"
      : revenuePeriod === "YEAR"
      ? `Tahun ${currentYear}`
      : "Total Keseluruhan";

  // Data transaksi untuk Modal Rekap berdasarkan tab yang dipilih
  const modalFilteredOrders =
    modalTransactionFilter === "TODAY"
      ? todayPaidOrders
      : modalTransactionFilter === "MONTH"
      ? thisMonthPaidOrders
      : modalTransactionFilter === "YEAR"
      ? thisYearPaidOrders
      : paidOrders;

  // Rekap per bulan (12 bulan dalam tahun aktif) untuk visual breakdown
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  const monthlyBreakdown = monthNames.map((name, idx) => {
    const monthOrders = thisYearPaidOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === idx;
    });
    const rev = monthOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    return {
      monthName: name,
      revenue: rev,
      count: monthOrders.length,
    };
  });
  const maxMonthRev = Math.max(...monthlyBreakdown.map((m) => m.revenue), 1);

  const formatOrderDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const waitingOrders = orders.filter((o) => o.status === "WAITING");
  const inProgressOrders = orders.filter((o) => o.status === "IN_PROGRESS");
  const activeOrdersCount = waitingOrders.length + inProgressOrders.length;

  const filteredOrders = orders.filter((o) => {
    if (activeTabFilter === "ACTIVE") return o.status === "WAITING" || o.status === "IN_PROGRESS";
    if (activeTabFilter === "COMPLETED") return o.status === "COMPLETED";
    return true;
  });

  const handleAdvanceStatus = async (orderId: string | number, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, { status: nextStatus });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui status order");
    }
  };

  const handleMarkPaid = async (orderId: string | number) => {
    try {
      await updateOrderPayment(orderId, { paymentStatus: "PAID", paymentMethod: "CASH" });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memproses pembayaran");
    }
  };

  const handleOpenAssignStaff = (order: Order) => {
    setAssignStaffTargetOrder(order);
    setSelectedStaffId(order.staffId || "");
  };

  const handleAssignStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStaffTargetOrder) return;
    if (!selectedStaffId) {
      alert("Silakan pilih staf yang bertugas");
      return;
    }

    setIsAssigningStaff(true);
    try {
      await updateOrder(assignStaffTargetOrder.id, {
        staffId: Number(selectedStaffId),
      });
      setAssignStaffTargetOrder(null);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menugaskan staf");
    } finally {
      setIsAssigningStaff(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "WAITING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "IN_PROGRESS":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Dashboard Operasional<span className="text-purple-600">.</span>
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs text-slate-500">
            Selamat datang, <span className="font-bold text-slate-800">{admin.name || "Admin"}</span>. Pemantauan antrean dan transaksi kasir secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full shadow-md transition"
          >
            <HiOutlineTruck className="text-sm" />
            <span>Kelola Antrean</span>
          </button>

          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-full shadow-sm transition"
          >
            <HiOutlineRefresh className={`text-sm ${isLoading ? "animate-spin text-slate-900" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div
          onClick={() => navigate("/orders")}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Antrean Aktif</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <HiOutlineClock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mb-1">{activeOrdersCount}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span>{waitingOrders.length} Menunggu</span>
            <span>•</span>
            <span className="text-purple-700 font-bold">{inProgressOrders.length} Dicuci</span>
          </div>
        </div>

        <div
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pendapatan Lunas</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <HiOutlineCurrencyDollar className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Switcher Filter Periode (Hari Ini, Bulan, Tahun, Total) */}
            <div className="flex items-center gap-1 mb-3 bg-slate-100/90 p-1 rounded-2xl">
              {(
                [
                  { id: "TODAY", label: "Hari Ini" },
                  { id: "MONTH", label: "Bulan" },
                  { id: "YEAR", label: "Tahun" },
                  { id: "ALL", label: "Total" },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setRevenuePeriod(p.id)}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-xl transition cursor-pointer ${
                    revenuePeriod === p.id
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <p className="text-2xl font-black text-slate-900 mb-0.5">
              Rp {displayedRevenue.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {displayedLabel} • {displayedCount} Transaksi Lunas
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              Hari Ini: <strong className="text-slate-700 font-bold">Rp {todayRevenue.toLocaleString("id-ID")}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setModalTransactionFilter(revenuePeriod);
                setIsRevenueModalOpen(true);
              }}
              className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span>Rekap</span>
              <HiOutlineExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          onClick={() => navigate("/customers")}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pelanggan</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <HiOutlineUsers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mb-1">{customers.length}</p>
          <p className="text-[11px] text-slate-500 font-medium">Pelanggan Terdaftar</p>
        </div>

        <div
          onClick={() => navigate("/staff")}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Staf Cuci Aktif</span>
            <div className="w-9 h-9 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <HiOutlineUserGroup className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mb-1">
            {staffs.filter((s) => s.isActive).length}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Dari Total {staffs.length} Staf</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 p-4 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900">Alur Pengerjaan Cuci</h2>
              <span className="text-xs font-mono bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600 font-bold">
                {filteredOrders.length} Order
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {(["ALL", "ACTIVE", "COMPLETED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTabFilter(tab)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition ${
                    activeTabFilter === tab
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  {tab === "ALL" ? "Semua" : tab === "ACTIVE" ? "Sedang Proses" : "Selesai"}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl">
              <div className="inline-block w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-medium">Memuat antrean kasir...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
              <p className="font-bold text-slate-800 text-base mb-1">Belum Ada Antrean</p>
              <p className="text-xs max-w-sm mx-auto">Pesanan cuci yang masuk dari customer akan tampil di sini secara real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const servicesList = order.orderItems?.map((item) => item.service?.name).join(", ");
                const isPaid = order.paymentStatus === "PAID";

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #ORD-{String(order.id).padStart(3, "0")}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {isPaid ? "Lunas" : "Belum Bayar"}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900">
                        {order.customer?.name || "Pelanggan"}
                      </h3>

                      <p className="text-xs font-mono text-slate-700 font-bold">
                        {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.plateNumber})` : "Kendaraan -"}
                      </p>

                      <p className="text-xs text-slate-500 pt-1">
                        <span className="font-semibold text-slate-700">Layanan:</span> {servicesList || "Layanan Cuci"}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                        <span>Petugas: <strong className="text-slate-800">{order.staff?.name || "Belum Ditugaskan"}</strong></span>
                        <span>Total: <strong className="text-slate-900 font-bold">Rp {Number(order.totalPrice).toLocaleString("id-ID")}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-col items-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleOpenAssignStaff(order)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-full border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                          title="Tugaskan / Ganti Staf Cuci"
                        >
                          <HiOutlineUserGroup className="w-3.5 h-3.5 text-slate-600" />
                          <span>{order.staffId ? "Ganti Staf" : "Pilih Staf"}</span>
                        </button>
                      )}

                      {order.status === "WAITING" && (
                        <button
                          onClick={() => handleAdvanceStatus(order.id, "IN_PROGRESS")}
                          className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-full shadow-sm transition"
                        >
                          Mulai Cuci
                        </button>
                      )}

                      {order.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleAdvanceStatus(order.id, "COMPLETED")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-sm transition"
                        >
                          Selesaikan Cuci
                        </button>
                      )}

                      {!isPaid && (
                        <button
                          onClick={() => handleMarkPaid(order.id)}
                          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs rounded-full transition"
                        >
                          Tandai Lunas
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-sm text-slate-900">Petugas Cuci</h3>
              <button
                onClick={() => navigate("/staff")}
                className="text-[11px] font-bold text-slate-700 hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-2.5">
              {staffs.slice(0, 5).map((staff) => (
                <div key={staff.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{staff.name}</p>
                      <p className="text-[10px] text-slate-400">{staff.phone || "Petugas Cuci"}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    staff.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                  }`}>
                    {staff.isActive ? "Aktif" : "Off"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-md">
            <h3 className="font-black text-sm mb-1">Akses Portal Customer</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Ingin menguji pemesanan langsung sebagai pelanggan atau melihat live tracking mobil?
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-2.5 bg-white text-slate-900 font-bold text-xs rounded-full hover:bg-slate-100 transition shadow-sm"
            >
              Buka Layar Customer
            </button>
          </div>

        </div>

      </div>

      {/* Modal Popup Pilih Staff */}
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
                ✕
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
                      const isSelected = String(selectedStaffId) === String(staff.id);
                      return (
                        <div
                          key={staff.id}
                          onClick={() => {
                            if (staff.isActive) {
                              setSelectedStaffId(staff.id);
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
                              name="staffOption"
                              checked={isSelected}
                              disabled={!staff.isActive}
                              onChange={() => setSelectedStaffId(staff.id)}
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
                            {staff.isActive ? "🟢 Aktif" : "🔴 Tidak Aktif"}
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
                  disabled={isAssigningStaff || !selectedStaffId}
                  className="px-5 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer"
                >
                  {isAssigningStaff ? "Menyimpan..." : "Tugaskan Staf"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Popup Rekap Pendapatan Lengkap */}
      {isRevenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <HiOutlineChartBar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    Laporan &amp; Rekap Pendapatan Kasir
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Ringkasan pemasukan transaksi lunas carwash hari ini, per bulan, dan per tahun
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRevenueModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-6 pt-5 pr-1 flex-1">
              {/* 4 Kartu Metrik Ringkasan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Hari Ini */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Hari Ini
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800">
                      {todayPaidOrders.length} Trx
                    </span>
                  </div>
                  <p className="text-lg font-black text-emerald-950">
                    Rp {todayRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-emerald-600/80 font-medium mt-0.5">
                    {now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                {/* Bulan Ini */}
                <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                      Bulan Ini
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-200/60 text-sky-800">
                      {thisMonthPaidOrders.length} Trx
                    </span>
                  </div>
                  <p className="text-lg font-black text-sky-950">
                    Rp {thisMonthRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-sky-600/80 font-medium mt-0.5">
                    {now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </p>
                </div>

                {/* Tahun Ini */}
                <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                      Tahun {currentYear}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/60 text-purple-800">
                      {thisYearPaidOrders.length} Trx
                    </span>
                  </div>
                  <p className="text-lg font-black text-purple-950">
                    Rp {thisYearRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-purple-600/80 font-medium mt-0.5">
                    Januari - Desember {currentYear}
                  </p>
                </div>

                {/* Total Keseluruhan */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Total Akumulasi
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {paidOrders.length} Trx
                    </span>
                  </div>
                  <p className="text-lg font-black text-slate-900">
                    Rp {totalRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Seluruh Transaksi Lunas
                  </p>
                </div>
              </div>

              {/* Grafik Rekap Per Bulan dalam Tahun Berjalan */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Distribusi Pendapatan Per Bulan ({currentYear})
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Perbandingan performa omset kasir carwash sepanjang tahun
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-700 shadow-xs">
                    Rp {thisYearRevenue.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 pt-2">
                  {monthlyBreakdown.map((item, idx) => {
                    const isCurrent = idx === currentMonth;
                    const heightPercent = maxMonthRev > 0 ? Math.max((item.revenue / maxMonthRev) * 100, item.revenue > 0 ? 15 : 4) : 4;

                    return (
                      <div
                        key={item.monthName}
                        className={`flex flex-col items-center justify-end p-2 rounded-xl transition border ${
                          isCurrent
                            ? "bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-200"
                            : "bg-white/60 border-slate-200/60 hover:bg-white"
                        }`}
                      >
                        <span className="text-[9px] font-mono text-slate-400 mb-1">
                          {item.count > 0 ? `${item.count} trx` : "-"}
                        </span>
                        <div className="w-full bg-slate-100 rounded-lg h-16 flex items-end p-1">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-md transition-all duration-500 ${
                              item.revenue > 0
                                ? isCurrent
                                  ? "bg-emerald-500"
                                  : "bg-slate-800"
                                : "bg-slate-200"
                            }`}
                            title={`${item.monthName}: Rp ${item.revenue.toLocaleString("id-ID")} (${item.count} pesanan)`}
                          />
                        </div>
                        <span className={`text-[10px] font-bold mt-2 ${isCurrent ? "text-emerald-700 font-black" : "text-slate-700"}`}>
                          {item.monthName}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 font-medium truncate max-w-full">
                          {item.revenue > 0
                            ? item.revenue >= 1_000_000
                              ? `${(item.revenue / 1_000_000).toFixed(1)}jt`
                              : `${Math.round(item.revenue / 1_000)}rb`
                            : "0"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rincian Daftar Transaksi Sesuai Filter Tab */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Daftar Transaksi Lunas ({modalFilteredOrders.length} Pesanan)
                  </h4>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
                    {(
                      [
                        { id: "TODAY", label: "Hari Ini", count: todayPaidOrders.length },
                        { id: "MONTH", label: "Bulan Ini", count: thisMonthPaidOrders.length },
                        { id: "YEAR", label: "Tahun Ini", count: thisYearPaidOrders.length },
                        { id: "ALL", label: "Semua", count: paidOrders.length },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setModalTransactionFilter(tab.id)}
                        className={`text-[11px] px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                          modalTransactionFilter === tab.id
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                </div>

                {modalFilteredOrders.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <p className="text-xs font-medium">Tidak ada transaksi lunas pada periode ini.</p>
                  </div>
                ) : (
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/90 text-slate-500 font-bold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Order ID</th>
                          <th className="py-2.5 px-4">Pelanggan</th>
                          <th className="py-2.5 px-4">Kendaraan</th>
                          <th className="py-2.5 px-4">Waktu</th>
                          <th className="py-2.5 px-4">Metode</th>
                          <th className="py-2.5 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {modalFilteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-500">
                              #ORD-{String(ord.id).padStart(3, "0")}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-800">
                              {ord.customer?.name || "Pelanggan"}
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 font-mono">
                              {ord.vehicle ? `${ord.vehicle.brand} ${ord.vehicle.model} (${ord.vehicle.plateNumber})` : "-"}
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                              {formatOrderDate(ord.createdAt)}
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {ord.paymentMethod || "CASH"}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-black text-slate-900 font-mono">
                              Rp {Number(ord.totalPrice).toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Total Rekap Ditampilkan:{" "}
                <strong className="text-slate-900 font-bold">
                  Rp{" "}
                  {modalFilteredOrders
                    .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0)
                    .toLocaleString("id-ID")}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setIsRevenueModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
