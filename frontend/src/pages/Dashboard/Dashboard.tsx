import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineUserGroup
} from "react-icons/hi";
import { getCustomer } from "../../services/customerService";
import { getOrders, updateOrderStatus, updateOrderPayment } from "../../services/orderService";
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

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + Number(o.totalPrice), 0);

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
          onClick={() => navigate("/orders")}
          className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pendapatan Lunas</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <HiOutlineCurrencyDollar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mb-1">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Total Transaksi Kasir</p>
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

    </div>
  );
};

export default Dashboard;
