import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useState } from "react";
import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Email dan Password wajib diisi!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ email, password });

      if (response.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("admin", JSON.stringify(response.data.admin));
        navigate("/dashboard", { replace: true });
      }

    } catch (error: any) {
      const message = error.response?.data?.message
        || error.message || "Terjadi kesalahan saat login";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-2xl">
        <h1 className="mb-1 text-3xl font-extrabold tracking-[0.25em] text-white">
          APEX
          <span className="text-purple-500">.</span>
        </h1>
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-purple-400">
          Carwash & Detailing
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Username / Email
            </label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@apexcarwash.com"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 
                  py-3.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 
                  transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"/>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Password
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 pl-11 pr-11 text-sm text-white outline-none focus:border-purple-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-3 font-bold text-white hover:border-purple-500/50 disabled:opacity-50">
            {isLoading ? "Memproses..." : "Masuk ke APEX System"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;