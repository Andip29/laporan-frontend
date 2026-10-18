import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function LoginModal({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (isRegister) {
        await axios.post(`${API_BASE}/auth/register`, {
          name,
          email,
          password,
        });
        alert("Registrasi akun berhasil! Silakan login.");
        setIsRegister(false);
        setPassword("");
      } else {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email,
          password,
        });
        const { token, user } = res.data;

        // Simpan token ke LocalStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isRegister ? "Daftar Akun Baru" : "Login Sistem Laporan"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegister
              ? "Buat akun teknisi baru untuk menyimpan data laporan pribadi."
              : "Masuk dengan email & password untuk mengelola data Anda."}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-semibold border border-rose-200 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Fahmi"
                required
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200 text-sm"
          >
            {isRegister ? "Daftar Akun" : "Masuk / Login"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg("");
            }}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            {isRegister
              ? "Sudah punya akun? Login di sini"
              : "Belum punya akun? Registrasi di sini"}
          </button>
        </div>
      </div>
    </div>
  );
}
