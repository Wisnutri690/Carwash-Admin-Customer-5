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

const MainLayout = () => {
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
    { label: "Order", path: "/orders", icon: HiOutlineClipboardList },
    { label: "Staf", path: "/staff", icon: HiOutlineUserGroup },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans pb-28">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-purple-900/20 blur-[180px] pointer-events-none rounded-full animate-pulse-slow" />

      <header className="sticky top-0 z-40 bg-neutral-950/80 border-b border-neutral-800/80 backdrop-blur-2xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-[0.25em] text-white">
              APEX<span className="text-purple-500">.</span>
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold tracking-widest bg-purple-500/10 border border-purple-500/30 text-purple-400">
              Carwash System
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-neutral-900/90 border border-neutral-800 rounded-2xl px-3.5 py-1.5 shadow-lg">
              <div className="w-8 h-8 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300 font-extrabold text-xs">
                <HiOutlineUser className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-white leading-tight">{admin.name || "Admin APEX"}</p>
                <p className="text-[10px] text-neutral-400 font-mono">{admin.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-neutral-900 hover:bg-rose-950/50 border border-neutral-800 hover:border-rose-500/50 text-neutral-400 hover:text-rose-400 px-3.5 py-2 rounded-2xl transition-all font-bold text-xs shadow-lg"
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

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-neutral-950/90 border border-neutral-800/90 backdrop-blur-2xl rounded-3xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-around gap-1 transition-all duration-300 hover:border-purple-500/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center py-2 px-3 sm:px-5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "text-white bg-purple-600 shadow-lg shadow-purple-900/60 scale-105"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/80"
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 w-2 h-0.5 rounded-full bg-purple-300 shadow-[0_0_8px_#c084fc]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default MainLayout;
