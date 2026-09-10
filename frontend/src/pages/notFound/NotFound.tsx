import { Link, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineHome, HiOutlineExclamationCircle } from "react-icons/hi";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden text-center selection:bg-purple-500 selection:text-white">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="absolute select-none pointer-events-none text-[16rem] sm:text-[22rem] font-black text-neutral-900/60 font-mono tracking-tighter -z-0">
                404
            </div>

            <div className="relative z-10 max-w-lg w-full bg-neutral-950/80 border border-neutral-800/80 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6">
                <div className="inline-flex items-center gap-2">
                    <span className="text-xl font-extrabold tracking-[0.25em] text-white">
                        APEX<span className="text-purple-500">.</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-widest bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2.5 py-0.5 rounded-full font-bold">
                        Error 404
                    </span>
                </div>

                <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-purple-950/50 border border-purple-800/60 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-950/40">
                        <HiOutlineExclamationCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                        Halaman Tidak Ditemukan
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                        Alamat URL rute yang Anda tuju tidak terdaftar di sistem APEX Carwash Management atau telah dipindahkan.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white font-bold text-xs py-3.5 px-5 rounded-2xl transition-all cursor-pointer"
                    >
                        <HiOutlineArrowLeft className="w-4 h-4" />
                        <span>Kembali Sebelumnya</span>
                    </button>

                    <Link
                        to="/dashboard"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs py-3.5 px-6 rounded-2xl shadow-lg shadow-purple-900/40 hover:scale-105 transition-all"
                    >
                        <HiOutlineHome className="w-4 h-4" />
                        <span>Ke Dashboard</span>
                    </Link>
                </div>
            </div>

            <p className="relative z-10 text-[11px] font-mono text-neutral-600 mt-8 tracking-widest uppercase">
                APEX Management System • 404 Route Handler
            </p>
        </div>
    );
};

export default NotFound;
