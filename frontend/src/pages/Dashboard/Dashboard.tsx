import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineSparkles,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineClock,
  HiOutlineXCircle
} from "react-icons/hi";
import { getCustomer } from "../../services/customerService";
import { getOrders } from "../../services/orderService";
import type { Customer } from "../../types/customer";
import type { Order, OrderStatus } from "../../types/order";

const Dashboard = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const adminDataString = localStorage.getItem("admin");
  const admin = adminDataString ? JSON.parse(adminDataString) : { name: "Admin APEX", email: "admin@apexcarwash.com" };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [customersData, ordersData] = await Promise.all([
        getCustomer(),
        getOrders()
      ]);
      setCustomers(customersData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Gagal mengambil data dashboard", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + Number(o.totalPrice), 0);

  const activeWashCount = orders.filter((o) => o.status === "IN_PROGRESS" || o.status === "WAITING").length;

  const getOrderStatusConfig = (status: OrderStatus, paymentStatus: string) => {
    switch (status) {
      case "WAITING":
        return {
          label: "Menunggu Antrean",
          textColor: "text-amber-400",
          border: "hover:border-amber-500/60 hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]",
          leftBorder: "bg-amber-500",
          icon: HiOutlineClock,
          iconBg: "bg-amber-900/40 border-amber-500/30 text-amber-300 group-hover:bg-amber-600 group-hover:text-white"
        };
      case "IN_PROGRESS":
        return {
          label: "Sedang Dicuci",
          textColor: "text-blue-400",
          border: "hover:border-blue-500/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.3)]",
          leftBorder: "bg-blue-500",
          icon: HiOutlineSparkles,
          iconBg: "bg-blue-900/40 border-blue-500/30 text-blue-300 group-hover:bg-blue-600 group-hover:text-white"
        };
      case "COMPLETED":
        return {
          label: paymentStatus === "PAID" ? "Selesai & Lunas" : "Selesai (Menunggu Pembayaran)",
          textColor: paymentStatus === "PAID" ? "text-emerald-400" : "text-amber-400",
          border: "hover:border-emerald-500/60 hover:shadow-[0_0_35px_rgba(16,185,129,0.3)]",
          leftBorder: "bg-emerald-500",
          icon: paymentStatus === "PAID" ? HiOutlineCheckCircle : HiOutlineCreditCard,
          iconBg: "bg-emerald-900/40 border-emerald-500/30 text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white"
        };
      case "CANCELLED":
        return {
          label: "Dibatalkan",
          textColor: "text-rose-400",
          border: "hover:border-rose-500/60 hover:shadow-[0_0_35px_rgba(244,63,94,0.3)]",
          leftBorder: "bg-rose-500",
          icon: HiOutlineXCircle,
          iconBg: "bg-rose-900/40 border-rose-500/30 text-rose-300 group-hover:bg-rose-600 group-hover:text-white"
        };
      default:
        return {
          label: status,
          textColor: "text-neutral-400",
          border: "hover:border-neutral-500",
          leftBorder: "bg-neutral-500",
          icon: HiOutlineClock,
          iconBg: "bg-neutral-900 border-neutral-800 text-neutral-400"
        };
    }
  };

  return (
    <div className="space-y-8 relative overflow-hidden animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[0.2em] text-white mb-1">
            Dashboard
            <span className="text-purple-500">.</span>
          </h1>
          <p className="text-sm text-neutral-400">Ringkasan operasional dan aktivitas utama APEX Carwash</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="self-start md:self-auto text-xs px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-xl transition-all font-semibold">
          Refresh Data
        </button>
      </div>

      <div className="relative bg-neutral-950 border border-neutral-800/80 rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-hidden group hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] hover:-translate-y-1 transition-all duration-300">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <HiOutlineSparkles className="w-3.5 h-3.5" /> Welcome Back
            </span>
            <span className="text-xs font-mono text-neutral-500">APEX Carwash Management App</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Selamat Datang, <span className="text-purple-400">{admin.name || "Admin"}</span>!
          </h2>

          <p className="text-neutral-400 text-xs md:text-sm max-w-2xl leading-relaxed">
            Sistem operasional pencucian dan detailing kendaraan APEX siap digunakan. Data transaksi di bawah ini terhubung secara real-time dengan backend API.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate("/customers")}
              className="flex items-center gap-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105">
              <HiOutlineUsers className="w-4 h-4" /> Kelola Pelanggan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => navigate("/customers")}
          className="relative bg-neutral-950 border border-neutral-800/80 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:border-purple-500/60 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group overflow-hidden cursor-pointer active:scale-95">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-3xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Pelanggan</span>
            <div className="p-3 bg-purple-900/30 border border-purple-500/30 rounded-2xl text-purple-300 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <HiOutlineUsers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mb-1">{customers.length}</p>
          <p className="text-xs text-neutral-500">Pelanggan Terdaftar</p>
        </div>

        <div
          onClick={() => navigate("/orders")}
          className="relative bg-neutral-950 border border-neutral-800/80 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:border-emerald-500/60 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-300 group overflow-hidden cursor-pointer active:scale-95">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-3xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Pendapatan Lunas</span>
            <div className="p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-2xl text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <HiOutlineCurrencyDollar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mb-1">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-neutral-500">Total Pembayaran Lunas</p>
        </div>

        <div
          onClick={() => navigate("/orders")}
          className="relative bg-neutral-950 border border-neutral-800/80 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:border-blue-500/60 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300 group overflow-hidden cursor-pointer active:scale-95">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Transaksi</span>
            <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-2xl text-blue-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <HiOutlineTruck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mb-1">{orders.length}</p>
          <p className="text-xs text-neutral-500">Order Terdaftar di API</p>
        </div>

        <div
          onClick={() => navigate("/orders")}
          className="relative bg-neutral-950 border border-neutral-800/80 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:border-amber-500/60 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-300 group overflow-hidden cursor-pointer active:scale-95">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-3xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Antrean Aktif</span>
            <div className="p-3 bg-amber-900/30 border border-amber-500/30 rounded-2xl text-amber-300 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <HiOutlineSparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mb-1">{activeWashCount}</p>
          <p className="text-xs text-neutral-500">Waiting & In Progress</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-purple-400 tracking-[0.2em] uppercase">
            Status Order & Transaksi Real-time
          </h3>
          <span className="text-xs font-mono text-neutral-500">Total: {orders.length} Order</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-neutral-400">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold uppercase tracking-wider">Memuat data order dari backend...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-3xl p-12 text-center text-neutral-400 shadow-[0_0_25px_rgba(0,0,0,0.8)]">
            <p className="text-lg font-bold text-white mb-2">Belum Ada Transaksi Order</p>
            <p className="text-xs max-w-sm mx-auto mb-4">Belum ada order transaksi yang terdaftar di database backend.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {orders.map((order) => {
              const statusConfig = getOrderStatusConfig(order.status, order.paymentStatus);
              const Icon = statusConfig.icon;
              const servicesList = order.orderItems.map((item) => item.service.name).join(", ");

              return (
                <div
                  key={order.id}
                  className={`group relative bg-neutral-950 border border-neutral-800/80 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,0,0,0.85)] ${statusConfig.border} hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden`}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${statusConfig.leftBorder} rounded-l-3xl`} />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${statusConfig.iconBg} border flex items-center justify-center font-bold transition-all duration-300`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                          #ORD-{String(order.id).padStart(3, "0")}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${order.paymentStatus === "PAID" ?
                          "bg-emerald-950/60 border-emerald-500/30 text-emerald-400" : "bg-amber-950/60 border-amber-500/30 text-amber-400"}`}>
                          {order.paymentStatus === "PAID" ? "Lunas" : "Belum Bayar"}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-lg font-extrabold text-white group-hover:text-purple-300 transition-colors mb-0.5">
                      {order.customer?.name || "Pelanggan Tanpa Nama"}
                    </h4>
                    <p className="text-xs text-neutral-400 font-semibold mb-1">
                      {order.customer?.phone || "-"}
                    </p>
                    <p className="text-xs text-neutral-500 mb-3 font-mono">
                      {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.plateNumber})` : "Kendaraan -"}
                    </p>

                    <div className="space-y-2 text-xs bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl">
                      <p className="text-neutral-300">
                        <span className="text-neutral-500 font-medium">Layanan:</span> {servicesList || "Tidak ada layanan"}
                      </p>
                      <p className="text-neutral-300">
                        <span className="text-neutral-500 font-medium">Petugas:</span> {order.staff?.name || "-"}
                      </p>
                      <p className={`${statusConfig.textColor} font-extrabold`}>
                        Status: {statusConfig.label}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Total Tagihan</span>
                    <span className="font-extrabold text-white text-sm">
                      Rp {Number(order.totalPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
