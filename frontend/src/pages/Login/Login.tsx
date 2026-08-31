import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  HiOutlineMail, 
  HiOutlineLockClosed, 
  HiOutlineEye, 
  HiOutlineEyeOff, 
  HiOutlineUser, 
  HiOutlinePhone,
  HiOutlineArrowLeft,
  HiOutlineBadgeCheck
} from "react-icons/hi";
import { login } from "../../services/authService";
import { customerLogin, customerRegister } from "../../services/portalCustomer";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const isAdminEmail = email.toLowerCase().includes("admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Silakan masukkan alamat email Anda");
      return;
    }

    setIsLoading(true);

    try {
      if (isAdminEmail) {
        if (!password) {
          setErrorMessage("Password wajib diisi untuk akun Admin");
          setIsLoading(false);
          return;
        }

        const adminRes = await login({ email: email.trim(), password });
        if (adminRes.success) {
          localStorage.setItem("token", adminRes.data.token);
          localStorage.setItem("admin", JSON.stringify(adminRes.data.admin));
          setSuccessMessage("Login Admin berhasil");
          setTimeout(() => navigate("/dashboard", { replace: true }), 500);
          return;
        }
      }

      if (isRegisterMode) {
        if (!name.trim() || !phone.trim()) {
          setErrorMessage("Nama lengkap dan No. WhatsApp wajib diisi");
          setIsLoading(false);
          return;
        }

        const regRes = await customerRegister({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        });

        if (regRes.data?.token) {
          localStorage.setItem("customerToken", regRes.data.token);
          localStorage.setItem("token", regRes.data.token);
          localStorage.setItem("customerEmail", email.trim());
          setSuccessMessage("Pendaftaran berhasil");
          setTimeout(() => navigate("/", { replace: true }), 500);
          return;
        }
      }

      try {
        const custRes = await customerLogin(email.trim());
        if (custRes.data?.token) {
          localStorage.setItem("customerToken", custRes.data.token);
          localStorage.setItem("token", custRes.data.token);
          localStorage.setItem("customerEmail", email.trim());
          setSuccessMessage("Berhasil masuk");
          setTimeout(() => navigate("/", { replace: true }), 500);
          return;
        }
      } catch (custErr: any) {
        if (custErr.response?.status === 404 || custErr.response?.data?.message?.toLowerCase().includes("tidak ditemukan")) {
          setIsRegisterMode(true);
          setErrorMessage("Email belum terdaftar. Silakan lengkapi data untuk membuat akun baru");
          return;
        }
        throw custErr;
      }

    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Terjadi kesalahan saat masuk";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex items-center justify-center p-4 md:p-8 lg:p-12 selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-5xl rounded-[2.5rem] border border-slate-200/90 bg-white shadow-[0_15px_60px_rgba(15,23,42,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-lg text-white shadow-sm">
                A
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-slate-900">APEX.</span>
                <span className="text-[10px] text-slate-400 font-bold block -mt-1 tracking-widest uppercase">Carwash &amp; Detailing</span>
              </div>
            </div>
          </div>

          <div className="my-auto py-3 text-center lg:text-left">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm mb-5 bg-slate-100">
              <img
                src="/assets/login_hero_car.jpg"
                alt="APEX Luxury Sportscar"
                className="w-full h-56 sm:h-64 object-cover"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug mb-2">
              Perawatan Mobil Premium <br />
              <span className="text-slate-500 font-bold">Dengan Pemantauan Real-time.</span>
            </h2>

            <p className="text-slate-500 text-xs sm:text-sm max-w-md leading-relaxed">
              Daftarkan antrean cuci mobil Anda secara mandiri, dapatkan estimasi waktu yang akurat, dan pantau proses pengerjaan langsung dari perangkat Anda.
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-4 border-t border-slate-100">
            <span className="w-6 h-2 rounded-full bg-slate-900" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
        </div>

        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            {isRegisterMode ? (
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setErrorMessage(""); }}
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 mb-4 transition"
              >
                <HiOutlineArrowLeft className="text-sm" />
              </button>
            ) : null}

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {isAdminEmail ? "Welcome Back, Admin" : isRegisterMode ? "Create Account" : "Welcome Back"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isAdminEmail
                ? "Masukkan kata sandi untuk masuk ke kasir"
                : isRegisterMode
                ? "Lengkapi data untuk membuat akun"
                : "Masuk untuk melanjutkan ke APEX Carwash"}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 font-bold flex items-center gap-2">
              <HiOutlineBadgeCheck className="text-base text-emerald-600" /> {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">
                Email
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            {isAdminEmail && (
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-11 text-xs text-slate-900 outline-none transition focus:border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <HiOutlineEyeOff className="text-base" /> : <HiOutlineEye className="text-base" />}
                  </button>
                </div>
              </div>
            )}

            {isRegisterMode && (
              <div className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    No. WhatsApp
                  </label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 rounded-full bg-[#0f172a] hover:bg-black text-white py-3.5 font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : isAdminEmail ? (
                <span>Log In as Admin</span>
              ) : isRegisterMode ? (
                <span>Create Account</span>
              ) : (
                <span>Log In to Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 text-center">
            {isRegisterMode ? (
              <p className="text-xs text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setErrorMessage(""); }}
                  className="text-slate-900 font-bold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            ) : !isAdminEmail && (
              <p className="text-xs text-slate-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(true); setErrorMessage(""); }}
                  className="text-slate-900 font-bold hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;