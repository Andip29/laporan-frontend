import React from "react";

export default function Header({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
    { id: "worksheet", label: "Excel (Worksheet)", icon: "fa-file-excel" },
    { id: "documents", label: "Dokumen Word", icon: "fa-file-word" },
    { id: "analytics", label: "Grafik & Analisis", icon: "fa-chart-line" },
    { id: "gallery", label: "Galeri Foto", icon: "fa-images" },
    { id: "drive", label: "Drive Berkas", icon: "fa-folder-open" },
    { id: "form", label: "Buat Laporan", icon: "fa-plus-circle" },
  ];

  return (
    <header className="bg-blue-700 text-white shadow-lg w-full">
      <div className="w-full px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 md:h-16 gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <i className="fa-solid fa-clipboard-check text-2xl text-blue-200"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">
                Sistem Laporan & Data
              </h1>
              <p className="text-xs text-blue-200">
                {user
                  ? `Pengguna: ${user.name} (${user.email})`
                  : "Aplikasi Management Data Harian"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center ${
                  activeTab === item.id
                    ? "bg-blue-800 text-white shadow-inner"
                    : "hover:bg-blue-600 text-blue-100"
                }`}
              >
                <i className={`fa-solid ${item.icon} mr-1.5`}></i> {item.label}
              </button>
            ))}

            {/* Tombol Logout */}
            {user && (
              <button
                onClick={onLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition ml-2 flex items-center"
                title="Keluar / Logout"
              >
                <i className="fa-solid fa-right-from-bracket mr-1"></i> Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
