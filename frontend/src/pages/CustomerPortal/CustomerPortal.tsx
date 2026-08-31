import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPublicServices,
  getMyActiveOrders,
  createCustomerOrder,
  getMyVehicles,
  addMyvehicles,
  updateMyVehicle,
  deleteMyVehicle,
  getMyOrderHistory,
  cancelMyOrder,
  getMyProfile,
  updateMyProfile,
} from "../../services/portalCustomer";
import type { Service } from "../../types/service";
import type { Vehicle } from "../../types/vehicle";
import type { Order } from "../../types/order";
import socket from "../../config/socket";
import {
  HiOutlineSparkles,
  HiOutlineTruck,
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineReceiptTax,
  HiOutlineRefresh,
  HiOutlineLogout,
  HiOutlineLogin,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineX,
  HiOutlineShoppingBag,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlinePencilAlt,
  HiOutlinePhone,
  HiOutlineMail
} from "react-icons/hi";
import { 
  FaCar, 
  FaSoap 
} from "react-icons/fa";

const getCarArtwork = (vehicle?: { brand?: string; model?: string } | null): string => {
  if (!vehicle) return "/assets/cars/porsche_911.jpg";
  const name = `${vehicle.brand || ""} ${vehicle.model || ""}`.toLowerCase();

  if (name.includes("porsche") && (name.includes("taycan") || name.includes("turbo"))) {
    return "/assets/cars/porsche_taycan.jpg";
  }
  if (name.includes("porsche") || name.includes("911") || name.includes("gt3")) {
    return "/assets/cars/porsche_911.jpg";
  }
  if (name.includes("ferrari") || name.includes("sf90") || name.includes("roma")) {
    return "/assets/cars/ferrari_sf90.jpg";
  }
  if (name.includes("lambo") || name.includes("huracan") || name.includes("urus")) {
    return "/assets/cars/lamborghini_huracan.jpg";
  }
  if (name.includes("mclaren") || name.includes("720s")) {
    return "/assets/cars/mclaren_720s.jpg";
  }
  if (name.includes("bmw") || name.includes("m4") || name.includes("m8")) {
    return "/assets/cars/bmw_m4.jpg";
  }
  if (name.includes("nissan") || name.includes("gt-r") || name.includes("gtr")) {
    return "/assets/cars/nissan_gtr.jpg";
  }
  return "/assets/cars/porsche_911.jpg";
};

const CustomerPortal: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"home" | "services" | "vehicles" | "history" | "profile">("home");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ [id: number]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);

  const [customerToken, setCustomerToken] = useState<string | null>(localStorage.getItem("customerToken"));
  const [customerEmail, setCustomerEmail] = useState<string>(localStorage.getItem("customerEmail") || "");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState<number>(0);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false);
  const [newVehicleForm, setNewVehicleForm] = useState({
    plateNumber: "",
    brand: "",
    model: "",
    color: "",
  });

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editVehicleForm, setEditVehicleForm] = useState({
    plateNumber: "",
    brand: "",
    model: "",
    color: "",
    year: "",
  });

  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState<{ name: string; phone: string }>({
    name: "",
    phone: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const serviceData = await getPublicServices();
      setServices(serviceData);

      if (customerToken) {
        const [vehicleData, activeData, historyData, profileData] = await Promise.all([
          getMyVehicles().catch(() => []),
          getMyActiveOrders().catch(() => []),
          getMyOrderHistory().catch(() => []),
          getMyProfile().catch(() => null),
        ]);
        setVehicles(vehicleData);
        setActiveOrders(activeData);
        setOrderHistory(historyData);
        if (profileData) {
          setProfile(profileData);
          setProfileForm({
            name: profileData.name || "",
            phone: profileData.phone || "",
          });
        }
      }
    } catch (err) {
      console.error("Gagal memuat data customer:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [customerToken]);

  useEffect(() => {
    const handleStatusUpdate = (payload: any) => {
      console.log("Realtime Update Received in CustomerPortal:", payload);
      const token = localStorage.getItem("customerToken");
      if (token) {
        getMyActiveOrders()
          .then((data) => setActiveOrders(data))
          .catch((err) => console.error("Error fetching active orders:", err));
        getMyOrderHistory()
          .then((data) => setOrderHistory(data))
          .catch((err) => console.error("Error fetching order history:", err));
        getMyProfile()
          .then((data) => setProfile(data))
          .catch((err) => console.error("Error fetching profile:", err));
      }
    };

    socket.on("ORDER_STATUS_UPDATED", handleStatusUpdate);

    return () => {
      socket.off("ORDER_STATUS_UPDATED", handleStatusUpdate);
    };
  }, []);

  const currentVehicle = vehicles[selectedVehicleIndex] || null;

  const currentOrder = activeOrders.find(
    (o) => currentVehicle && Number(o.vehicleId) === Number(currentVehicle.id)
  ) || activeOrders[0] || null;

  const toggleService = (serviceId: number) => {
    setSelectedServices((prev) => {
      const updated = { ...prev };
      if (updated[serviceId]) {
        delete updated[serviceId];
      } else {
        updated[serviceId] = 1;
      }
      return updated;
    });
  };

  const calculateTotal = () => {
    return Object.entries(selectedServices).reduce((total, [id, qty]) => {
      const s = services.find((srv) => Number(srv.id) === Number(id));
      return total + (s ? Number(s.price) * qty : 0);
    }, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("token");
    localStorage.removeItem("customerEmail");
    setCustomerToken(null);
    setCustomerEmail("");
    setActiveOrders([]);
    setVehicles([]);
    setProfile(null);
    navigate("/login");
  };

  const handleAddVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMyvehicles(newVehicleForm);
      setShowAddVehicleModal(false);
      setNewVehicleForm({ plateNumber: "", brand: "", model: "", color: "" });
      const vList = await getMyVehicles();
      setVehicles(vList);
      setSelectedVehicleIndex(vList.length - 1);
      alert("Kendaraan berhasil ditambahkan");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menambah kendaraan");
    }
  };

  const handleOpenEditVehicle = (v: Vehicle) => {
    setEditingVehicle(v);
    setEditVehicleForm({
      plateNumber: v.plateNumber,
      brand: v.brand,
      model: v.model,
      color: v.color || "",
      year: v.year ? String(v.year) : "",
    });
  };

  const handleUpdateVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    try {
      await updateMyVehicle(editingVehicle.id, {
        plateNumber: editVehicleForm.plateNumber.trim().toUpperCase(),
        brand: editVehicleForm.brand.trim(),
        model: editVehicleForm.model.trim(),
        color: editVehicleForm.color.trim() || undefined,
        year: editVehicleForm.year ? parseInt(editVehicleForm.year, 10) : undefined,
      });
      alert("Data kendaraan berhasil diperbarui");
      setEditingVehicle(null);
      const vList = await getMyVehicles();
      setVehicles(vList);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui kendaraan");
    }
  };

  const handleDeleteVehicle = async (id: number | string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kendaraan ini?")) return;
    try {
      await deleteMyVehicle(id);
      const vList = await getMyVehicles();
      setVehicles(vList);
      setSelectedVehicleIndex(0);
      alert("Kendaraan berhasil dihapus");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus kendaraan");
    }
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateMyProfile(profileForm);
      alert("Profil berhasil diperbarui");
      setIsEditingProfile(false);
      const updated = await getMyProfile();
      setProfile(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCheckout = async () => {
    if (!customerToken) {
      navigate("/login");
      return;
    }
    if (!currentVehicle) {
      alert("Silakan daftarkan kendaraan terlebih dahulu");
      setShowAddVehicleModal(true);
      return;
    }

    const servicePayload = Object.entries(selectedServices).map(([id, quantity]) => ({
      serviceId: Number(id),
      quantity,
    }));

    if (servicePayload.length === 0) {
      alert("Pilih minimal satu layanan cuci");
      return;
    }

    try {
      await createCustomerOrder({
        vehicleId: Number(currentVehicle.id),
        services: servicePayload,
      });
      alert("Pesanan cuci berhasil dibuat dan masuk antrean");
      setSelectedServices({});
      setActiveTab("home");
      const active = await getMyActiveOrders();
      setActiveOrders(active);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal membuat pesanan");
    }
  };

  const handleCancelOrder = async (orderId: number | string) => {
    if (!window.confirm("Batalkan antrean cuci ini?")) return;
    try {
      await cancelMyOrder(orderId);
      const active = await getMyActiveOrders();
      setActiveOrders(active);
      alert("Antrean berhasil dibatalkan");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal membatalkan antrean");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col relative pb-28 selection:bg-black selection:text-white">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black flex items-center justify-center font-black text-white text-sm sm:text-base shadow-sm shrink-0">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : customerEmail ? customerEmail.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className="font-black text-xs sm:text-base tracking-tight text-slate-900 truncate">
                  {currentVehicle ? `${currentVehicle.brand} ${currentVehicle.model}` : "APEX Customer Studio"}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                  {currentVehicle?.plateNumber || "PORTAL"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {currentOrder ? `Status: ${currentOrder.status}` : "Status: Siap Melayani"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={loadData}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm cursor-pointer"
              title="Refresh Data"
            >
              <HiOutlineRefresh className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin text-slate-900" : ""}`} />
            </button>

            {customerToken ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm hover:border-black transition cursor-pointer"
                >
                  <HiOutlineUser className="w-3.5 h-3.5" />
                  <span>{profile?.name || customerEmail}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition font-bold text-xs shadow-sm cursor-pointer"
                  title="Keluar Akun"
                >
                  <HiOutlineLogout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <HiOutlineLogin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 z-10">
        {activeTab === "home" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 xl:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-between relative overflow-hidden">
                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Kendaraan Terpilih
                    </span>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">
                      {currentVehicle ? `${currentVehicle.brand} ${currentVehicle.model}` : "Belum Ada Mobil"}
                    </h2>
                  </div>
                  {currentVehicle && (
                    <span className="text-xs font-mono font-black bg-slate-900 text-white px-3 py-1 rounded-full shadow-sm">
                      {currentVehicle.plateNumber}
                    </span>
                  )}
                </div>

                <div className="w-full relative flex items-center justify-between py-6 min-h-[220px]">
                  {vehicles.length > 1 && (
                    <button
                      onClick={() => setSelectedVehicleIndex((prev) => (prev > 0 ? prev - 1 : vehicles.length - 1))}
                      className="z-20 w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-black hover:bg-slate-50 transition cursor-pointer"
                      title="Mobil Sebelumnya"
                    >
                      <HiOutlineChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <img
                      src={getCarArtwork(currentVehicle)}
                      alt={currentVehicle ? `${currentVehicle.brand} ${currentVehicle.model}` : "Sport Car"}
                      className="max-h-48 sm:max-h-56 w-auto object-contain transition-all duration-300 drop-shadow-[0_20px_25px_rgba(0,0,0,0.12)]"
                    />
                    {currentVehicle && (
                      <p className="text-xs font-semibold text-slate-500 mt-3">
                        {currentVehicle.color || "Metallic Finish"} {currentVehicle.year ? `• Model Tahun ${currentVehicle.year}` : ""}
                      </p>
                    )}
                  </div>

                  {vehicles.length > 1 && (
                    <button
                      onClick={() => setSelectedVehicleIndex((prev) => (prev < vehicles.length - 1 ? prev + 1 : 0))}
                      className="z-20 w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-black hover:bg-slate-50 transition cursor-pointer"
                      title="Mobil Berikutnya"
                    >
                      <HiOutlineChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between">
                  {vehicles.length > 1 ? (
                    <div className="flex items-center gap-2 mx-auto">
                      {vehicles.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedVehicleIndex(idx)}
                          className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                            selectedVehicleIndex === idx ? "w-8 bg-black shadow-sm" : "w-2.5 bg-slate-200 hover:bg-slate-300"
                          }`}
                          title={`Pilih Mobil ${idx + 1}`}
                        />
                      ))}
                    </div>
                  ) : vehicles.length === 0 ? (
                    <button
                      onClick={() => setShowAddVehicleModal(true)}
                      className="w-full flex items-center justify-center gap-2 text-xs text-white font-bold bg-black py-2.5 rounded-full shadow-md cursor-pointer"
                    >
                      <HiOutlinePlus className="w-4 h-4" /> Daftarkan Mobil Anda
                    </button>
                  ) : (
                    <p className="text-xs text-slate-400 mx-auto font-medium">
                      Kendaraan utama untuk pemesanan cuci
                    </p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 xl:col-span-7 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Status Cucian
                      </span>
                      <span className="text-sm font-black text-slate-900 uppercase">
                        {currentOrder ? currentOrder.status : "STANDBY"}
                      </span>
                    </div>

                    <div className="flex gap-1 mt-3">
                      {[1, 2, 3, 4, 5, 6, 7].map((step) => {
                        const isFilled =
                          currentOrder?.status === "COMPLETED"
                            ? true
                            : currentOrder?.status === "IN_PROGRESS"
                            ? step <= 4
                            : currentOrder?.status === "WAITING"
                            ? step <= 2
                            : false;
                        return (
                          <div
                            key={step}
                            className={`h-2.5 flex-1 rounded-sm transition-all duration-500 ${
                              isFilled
                                ? currentOrder?.status === "COMPLETED"
                                  ? "bg-emerald-500"
                                  : "bg-black"
                                : "bg-slate-100"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Est. Selesai
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          {currentOrder?.status === "COMPLETED"
                            ? "0"
                            : currentOrder
                            ? `${currentOrder.queueInfo?.estimatedMinutes || 25}`
                            : "0"}
                        </span>
                        <span className="text-xs font-bold text-slate-500">Min</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-700 font-bold mt-2">
                      <HiOutlineClock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentOrder ? "Estimasi Waktu" : "Siap Dicuci"}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Urutan Antrean
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          {currentOrder ? `#${currentOrder.queueInfo?.queuePosition || 1}` : "0"}
                        </span>
                        <span className="text-xs font-bold text-slate-500">Antre</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-600 font-semibold mt-2">
                      {currentOrder ? `${currentOrder.queueInfo?.ahead || 0} Mobil di Depan` : "Tanpa Antrean"}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Petugas Cuci
                      </span>
                      <span className="text-sm font-black text-slate-900 line-clamp-1">
                        {currentOrder?.staff?.name || "Kasir APEX"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-2">
                      <HiOutlineShieldCheck className="text-purple-600" />
                      <span>Terverifikasi</span>
                    </div>
                  </div>
                </div>

                {currentOrder && (
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <HiOutlineSparkles className="text-purple-600" /> Aktivitas Pengerjaan Berlangsung
                      </span>
                      {currentOrder.status === "WAITING" && (
                        <button
                          onClick={() => handleCancelOrder(currentOrder.id)}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Batalkan Pesanan
                        </button>
                      )}
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      Order #{currentOrder.id}: {currentOrder.orderItems?.map((i: any) => i.service?.name).join(", ") || "Paket Cuci"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Total Tagihan: <span className="font-black text-slate-900">Rp {Number(currentOrder.totalPrice).toLocaleString("id-ID")}</span> • Status Pembayaran: <span className="font-bold text-slate-900">{currentOrder.paymentStatus === "PAID" ? "Lunas" : "Belum Lunas"}</span>
                    </p>
                  </div>
                )}

                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <FaSoap className="text-slate-800 text-xs" /> Katalog Paket Cuci Unggulan
                      </h3>
                      <p className="text-xs text-slate-400">Pilih layanan perawatan bodi dan interior kendaraan Anda</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("services")}
                      className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Lihat Semua <HiOutlineChevronRight className="text-xs" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.slice(0, 4).map((srv) => {
                      const srvId = Number(srv.id);
                      const isSelected = !!selectedServices[srvId];
                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srvId)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-slate-50 border-slate-200/80 text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs">{srv.name}</p>
                            <p className={`text-[11px] mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                              Rp {Number(srv.price).toLocaleString("id-ID")} • {srv.duration || 30} Min
                            </p>
                          </div>
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                              isSelected ? "bg-white text-slate-900 border-white" : "border-slate-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Katalog Layanan Cuci &amp; Detailing</h2>
                <p className="text-xs text-slate-500">Pilih satu atau beberapa layanan untuk antrean pencucian mobil Anda</p>
              </div>
              <div className="text-xs text-slate-500 font-bold">
                Total Layanan: <span className="text-slate-900">{services.length} Paket</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((srv) => {
                const srvId = Number(srv.id);
                const isSelected = !!selectedServices[srvId];
                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srvId)}
                    className={`p-5 rounded-3xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-white border-slate-200/80 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-black text-base leading-snug">{srv.name}</h3>
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition ${
                            isSelected ? "bg-white text-slate-900 border-white" : "border-slate-300 text-transparent"
                          }`}
                        >
                          ✓
                        </div>
                      </div>
                      <p className={`text-xs leading-relaxed mb-4 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        {srv.description || "Perawatan komprehensif bodi dan interior mobil sport Anda."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/30 flex items-center justify-between text-xs">
                      <span className={`flex items-center gap-1 font-semibold ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        <HiOutlineClock className="text-sm" /> {srv.duration || 30} Menit
                      </span>
                      <span className="font-black text-sm">
                        Rp {Number(srv.price).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "vehicles" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kendaraan Saya</h2>
                <p className="text-xs text-slate-500">Kelola armada mobil sport yang terhubung dengan akun Anda</p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="flex items-center justify-center gap-2 text-xs bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2.5 rounded-full shadow-md transition cursor-pointer"
              >
                <HiOutlinePlus className="w-4 h-4" />
                <span>Tambah Kendaraan Baru</span>
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
                <FaCar className="text-4xl text-slate-300 mx-auto mb-3" />
                <p className="font-black text-slate-900 text-lg">Belum Ada Kendaraan</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                  Daftarkan mobil sport pertama Anda untuk mulai melakukan booking dan pemantauan cuci realtime.
                </p>
                <button
                  onClick={() => setShowAddVehicleModal(true)}
                  className="px-5 py-2.5 bg-black text-white font-bold text-xs rounded-full shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <HiOutlinePlus className="w-4 h-4" /> Daftarkan Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((v, idx) => (
                  <div
                    key={v.id}
                    className={`bg-white rounded-3xl p-5 border transition shadow-sm flex flex-col justify-between ${
                      selectedVehicleIndex === idx ? "border-black shadow-md ring-1 ring-black" : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="w-full h-36 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 mb-4">
                        <img
                          src={getCarArtwork(v)}
                          alt={`${v.brand} ${v.model}`}
                          className="max-h-28 w-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)]"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-mono uppercase font-bold text-slate-400">{v.brand}</p>
                          <h3 className="font-black text-base text-slate-900 leading-snug">{v.model}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{v.color || "Metallic"} {v.year ? `• ${v.year}` : ""}</p>
                        </div>
                        <span className="text-xs font-mono font-black bg-slate-100 text-slate-900 px-3 py-1 rounded-full border border-slate-200">
                          {v.plateNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 gap-2">
                      <button
                        onClick={() => { setSelectedVehicleIndex(idx); setActiveTab("home"); }}
                        className={`text-xs px-3.5 py-2 rounded-full font-black transition cursor-pointer flex-1 text-center ${
                          selectedVehicleIndex === idx
                            ? "bg-black text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {selectedVehicleIndex === idx ? "Sedang Aktif" : "Pilih"}
                      </button>

                      <button
                        onClick={() => handleOpenEditVehicle(v)}
                        className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                        title="Edit Kendaraan"
                      >
                        <HiOutlinePencilAlt className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        title="Hapus Kendaraan"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Riwayat Pemesanan Cuci</h2>
                <p className="text-xs text-slate-500">Semua pesanan yang telah selesai atau dibatalkan tercatat di sini</p>
              </div>
              <div className="text-xs text-slate-500 font-bold">
                Total Riwayat: <span className="text-slate-900">{orderHistory.length} Transaksi</span>
              </div>
            </div>

            {orderHistory.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
                <HiOutlineReceiptTax className="text-4xl text-slate-300 mx-auto mb-3" />
                <p className="font-black text-slate-900 text-lg">Belum Ada Riwayat Transaksi</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Pesanan yang selesai dikerjakan atau lunas akan otomatis muncul pada halaman ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderHistory.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block font-bold">
                            #ORD-{String(order.id).padStart(3, "0")} • {new Date(order.createdAt).toLocaleDateString("id-ID")}
                          </span>
                          <h4 className="font-black text-base text-slate-900 mt-0.5">
                            {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model}` : "Kendaraan"}
                          </h4>
                          <span className="text-[11px] font-mono text-purple-700 font-bold">
                            {order.vehicle?.plateNumber}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}>
                          {order.paymentStatus === "PAID" ? "Lunas" : "Belum Lunas"}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-3 text-xs text-slate-700">
                        <span className="text-slate-400 font-medium">Layanan: </span>
                        {order.orderItems?.map((i) => i.service?.name).join(", ") || "Layanan Cuci"}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">Total Pembayaran</span>
                      <span className="font-black text-slate-900 text-base">
                        Rp {Number(order.totalPrice).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center relative">
                  <div className="relative mb-4">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-4xl sm:text-5xl shadow-lg border-4 border-white ring-1 ring-slate-200">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : customerEmail ? customerEmail.charAt(0).toUpperCase() : "A"}
                    </div>
                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm" title="Online / Aktif">
                      <span className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>

                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {profile?.name || "Customer APEX"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {profile?.email || customerEmail}
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                      {profile?.phone || "No. Telepon Belum Disetel"}
                    </span>
                  </div>

                  <div className="w-full pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>ID Pengguna:</span>
                    <span className="font-mono font-bold text-slate-900">#CUST-{String(profile?.id || 1).padStart(4, "0")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cuci Selesai</span>
                    <div className="my-2">
                      <span className="text-2xl font-black text-slate-900">{profile?.stats?.completedOrders || 0}</span>
                      <span className="text-xs font-bold text-slate-500 ml-1">Kunjungan</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold">Transaksi Terverifikasi</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
                    <div className="my-2">
                      <span className="text-lg font-black text-slate-900 truncate block">
                        Rp {Number(profile?.stats?.totalSpent || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold">Status: Lunas</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Informasi Personal Akun</h3>
                      <p className="text-xs text-slate-400">Data identitas member terdaftar pada sistem APEX</p>
                    </div>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border border-slate-200 hover:border-black hover:bg-slate-50 transition cursor-pointer"
                    >
                      <HiOutlinePencilAlt className="w-4 h-4" />
                      <span>{isEditingProfile ? "Batal Edit" : "Edit Profil"}</span>
                    </button>
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Nama Lengkap <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-bold rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Nomor WhatsApp / Telepon <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-mono font-bold rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1">
                          Alamat Email (Akun Utama)
                        </label>
                        <input
                          type="email"
                          value={profile?.email || customerEmail}
                          disabled
                          className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold rounded-2xl p-3 cursor-not-allowed outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full transition shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm shrink-0">
                          <HiOutlineUser className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Nama Lengkap
                          </span>
                          <span className="text-sm font-black text-slate-900">{profile?.name || "-"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm shrink-0">
                          <HiOutlineMail className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Email Terdaftar
                          </span>
                          <span className="text-sm font-black text-slate-900 truncate block">{profile?.email || customerEmail}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm shrink-0">
                          <HiOutlinePhone className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Nomor WhatsApp
                          </span>
                          <span className="text-sm font-mono font-black text-slate-900">{profile?.phone || "-"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Garasi Kendaraan Saya</h3>
                      <p className="text-xs text-slate-400">Total {vehicles.length} mobil sport terdaftar</p>
                    </div>
                    <button
                      onClick={() => setShowAddVehicleModal(true)}
                      className="flex items-center gap-1.5 text-xs bg-black hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-full shadow-md transition cursor-pointer"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                      <span>Tambah Mobil</span>
                    </button>
                  </div>

                  {vehicles.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Belum ada mobil di garasi Anda</p>
                  ) : (
                    <div className="space-y-3">
                      {vehicles.map((v) => (
                        <div
                          key={v.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={getCarArtwork(v)}
                              alt={`${v.brand} ${v.model}`}
                              className="w-16 h-12 object-contain rounded-xl bg-white border border-slate-200 p-1 shadow-sm shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-black text-sm text-slate-900 leading-tight truncate">
                                {v.brand} {v.model}
                              </h4>
                              <p className="text-xs font-mono font-bold text-slate-700 uppercase mt-0.5">
                                {v.plateNumber}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {v.color || "Metallic"} {v.year ? `• ${v.year}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleOpenEditVehicle(v)}
                              className="p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 transition shadow-sm cursor-pointer"
                              title="Edit Mobil"
                            >
                              <HiOutlinePencilAlt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(v.id)}
                              className="p-2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition shadow-sm cursor-pointer"
                              title="Hapus Mobil"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {Object.keys(selectedServices).length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md md:max-w-xl z-40 animate-fade-in-up">
          <div className="bg-black/95 text-white backdrop-blur-2xl rounded-full py-2.5 pl-4 sm:pl-6 pr-2 sm:pr-2.5 shadow-[0_20px_45px_rgba(0,0,0,0.35)] border border-neutral-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold text-neutral-400 block truncate">
                {Object.keys(selectedServices).length} Layanan Dipilih
              </span>
              <span className="text-sm sm:text-base font-black text-white truncate block">
                Rp {calculateTotal().toLocaleString("id-ID")}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="bg-white hover:bg-neutral-100 text-black font-black text-[11px] sm:text-xs px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <HiOutlineShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Pesan Sekarang</span>
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md md:max-w-xl z-40 pointer-events-none">
        <nav className="pointer-events-auto bg-black text-white backdrop-blur-2xl rounded-full p-1.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex items-center justify-between gap-1 border border-neutral-800">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-full transition-all cursor-pointer ${
              activeTab === "home"
                ? "bg-white text-black shadow-md font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FaCar className="text-xs sm:text-sm" />
            <span className="text-[9px] sm:text-xs font-bold tracking-tight">Home</span>
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-full transition-all cursor-pointer ${
              activeTab === "services"
                ? "bg-white text-black shadow-md font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FaSoap className="text-xs sm:text-sm" />
            <span className="text-[9px] sm:text-xs font-bold tracking-tight">Layanan</span>
          </button>

          <button
            onClick={() => setActiveTab("vehicles")}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-full transition-all cursor-pointer ${
              activeTab === "vehicles"
                ? "bg-white text-black shadow-md font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <HiOutlineTruck className="text-xs sm:text-sm" />
            <span className="text-[9px] sm:text-xs font-bold tracking-tight">Mobil</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-full transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-black shadow-md font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <HiOutlineReceiptTax className="text-xs sm:text-sm" />
            <span className="text-[9px] sm:text-xs font-bold tracking-tight">Riwayat</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-full transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-white text-black shadow-md font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <HiOutlineUser className="text-xs sm:text-sm" />
            <span className="text-[9px] sm:text-xs font-bold tracking-tight">Profil</span>
          </button>
        </nav>
      </div>

      {showAddVehicleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Tambah Mobil Baru</h3>
                <p className="text-xs text-slate-400">Daftarkan mobil sport Anda untuk pemesanan cuci</p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor Plat Kendaraan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: B 911 RS"
                  value={newVehicleForm.plateNumber}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, plateNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-mono font-bold rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Merek <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Porsche / Ferrari"
                    value={newVehicleForm.brand}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, brand: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Model Tipe <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="911 GT3 RS / SF90"
                    value={newVehicleForm.model}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, model: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Warna Kendaraan</label>
                <input
                  type="text"
                  placeholder="Contoh: GT Silver Metallic / Rosso Corsa"
                  value={newVehicleForm.color}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, color: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full transition shadow-md cursor-pointer"
                >
                  Simpan Kendaraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingVehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Data Mobil</h3>
                <p className="text-xs text-slate-400">Perbarui informasi spesifikasi mobil Anda</p>
              </div>
              <button
                onClick={() => setEditingVehicle(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVehicleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor Plat Kendaraan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editVehicleForm.plateNumber}
                  onChange={(e) => setEditVehicleForm({ ...editVehicleForm, plateNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-mono font-bold rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Merek <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editVehicleForm.brand}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, brand: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Model Tipe <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editVehicleForm.model}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, model: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Warna</label>
                  <input
                    type="text"
                    value={editVehicleForm.color}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={editVehicleForm.year}
                    onChange={(e) => setEditVehicleForm({ ...editVehicleForm, year: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-2xl p-3 focus:bg-white focus:border-black outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full transition shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
