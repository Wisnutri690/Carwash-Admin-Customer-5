import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  HiOutlineHome, 
  HiOutlineUsers, 
  HiOutlineTruck, 
  HiOutlineClipboardList, 
  HiOutlineSparkles, 
  HiOutlineUserGroup,
  HiOutlineLogout,
  HiOutlineUser
} from "react-icons/hi";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const adminDataString = localStorage.getItem("admin");
  const admin = adminDataString ? JSON.parse(adminDataString) : { name: "Admin APEX", email: "admin@apexcarwash.com" };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: HiOutlineHome },
    { label: "Pelanggan", path: "/customers", icon: HiOutlineUsers },
    { label: "Kendaraan", path: "/vehicles", icon: HiOutlineTruck },
    { label: "Layanan", path: "/services", icon: HiOutlineSparkles },
    { label: "Antrean Kasir", path: "/orders", icon: HiOutlineClipboardList },
    { label: "Staf Cuci", path: "/staff", icon: HiOutlineUserGroup },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 flex flex-col relative overflow-hidden font-sans pb-28 selection:bg-black selection:text-white">
      <header className="sticky top-0 z-40 bg-white/95 border-b border-neutral-200 backdrop-blur-2xl px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center font-black text-white text-lg shadow-sm">
              A
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-neutral-900 flex items-center gap-1.5">
                APEX<span className="text-purple-600">.</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 -mt-1 block">
                Command Center &amp; Cashier
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-white border border-neutral-200 rounded-full px-3.5 py-1.5 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center text-xs font-bold">
                <HiOutlineUser className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left pr-2">
                <p className="text-xs font-bold text-neutral-900 leading-tight">{admin.name || "Admin APEX"}</p>
                <p className="text-[10px] text-neutral-400 font-mono">{admin.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 px-3.5 py-2 rounded-full transition font-bold text-xs shadow-sm cursor-pointer"
              title="Keluar"
            >
              <HiOutlineLogout className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 z-10">
        <Outlet />
      </main>

      <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-2xl pointer-events-none">
        <nav className="pointer-events-auto bg-black text-white backdrop-blur-2xl rounded-full p-1.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex items-center justify-between gap-1 transition-all border border-neutral-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 relative flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 sm:px-3 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-black bg-white shadow-md font-black"
                    : "text-zinc-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                <span className="text-[9px] sm:text-[11px] font-bold tracking-tight truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default MainLayout;
