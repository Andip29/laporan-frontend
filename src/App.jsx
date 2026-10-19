import React, { useState, useEffect } from "react";
import { reportService } from "./services/api";

import Header from "./components/common/Header";
import StatsCards from "./components/dashboard/StatsCards";
import FilterBar from "./components/dashboard/FilterBar";
import ReportTable from "./components/dashboard/ReportTable";
import ChecklistSection from "./components/form/ChecklistSection";
import WorksheetSection from "./components/form/WorksheetSection";
import PdfReportTemplate from "./components/pdf/PdfReportTemplate";

// Modul Terpisah
import DriveSection from "./components/drive/DriveSection";
import WorksheetManager from "./components/worksheet/WorksheetManager";
import PhotoGallery from "./components/gallery/PhotoGallery";
import LoginModal from "./components/auth/LoginModal";

// Impor Komponen ExcelChartViewer untuk Halaman Grafik Terpisah
import ExcelChartViewer from "./components/reports/ExcelChartViewer";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // State Auth Login
  const [currentUser, setCurrentUser] = useState(null);

  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [petugas, setPetugas] = useState("");
  const [jenisPekerjaan, setJenisPekerjaan] = useState("");
  const [ceklisItems, setCeklisItems] = useState([
    { item: "Pemeriksaan Fisik & Kebersihan", status: "Ok", catatan: "Baik" },
    {
      item: "Pemeriksaan Fungsi Hardware/Sistem",
      status: "Ok",
      catatan: "Normal",
    },
  ]);
  const [worksheetRows, setWorksheetRows] = useState([
    {
      aktivitas: "Pelaksanaan Aktivitas Harian Utama",
      durasi: "2 Jam",
      hasil: "Selesai",
    },
  ]);
  const [photoFiles, setPhotoFiles] = useState([]);

  useEffect(() => {
    // Cek apakah ada data user tersimpan di LocalStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setPetugas(parsedUser.name);
    }
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await reportService.getAll();
      setReports(res.data);
    } catch (e) {
      console.error("Gagal mengambil laporan dari backend:", e);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setPetugas(user.name);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  const stats = {
    total: reports.length,
    ok: reports.length,
    perbaikan: 0,
    kendala: 0,
  };

  const filteredReports = reports.filter((r) => {
    const matchSearch =
      r.submitted_by?.toLowerCase().includes(search.toLowerCase()) ||
      (r.form_data?.jenisPekerjaan || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchDate =
      !filterDate || (r.form_data?.tanggal || "").includes(filterDate);
    return matchSearch && matchDate;
  });

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!petugas || !jenisPekerjaan)
      return alert("Isi data petugas dan jenis pekerjaan!");

    try {
      let imageUrls = [];
      if (photoFiles.length > 0) {
        const uploadData = new FormData();
        photoFiles.forEach((f) => uploadData.append("photos", f));
        const resUpload = await reportService.uploadPhotos(uploadData);
        imageUrls = resUpload.data.imageUrls;
      }

      const formDataPayload = {
        tanggal,
        jenisPekerjaan,
        ceklis: ceklisItems,
        worksheet: worksheetRows,
      };

      await reportService.create({
        submitted_by: petugas,
        form_data: formDataPayload,
        image_urls: imageUrls,
      });

      alert("Laporan Berhasil Disimpan Permanen!");
      setJenisPekerjaan("");
      setPhotoFiles([]);
      fetchReports();
      setActiveTab("dashboard");
    } catch (err) {
      alert("Gagal menyimpan laporan. Pastikan server backend aktif!");
    }
  };

  const handleExportPdf = (r) => {
    const element = document.getElementById(`pdf-report-${r.id}`);
    if (!element) return alert("Template PDF tidak ditemukan");

    element.style.display = "block";

    const opt = {
      margin: 0.3,
      filename: `Laporan_Pekerjaan_${r.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    if (window.html2pdf) {
      window
        .html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          element.style.display = "none";
        });
    } else {
      alert("Library html2pdf belum dimuat.");
      element.style.display = "none";
    }
  };

  // JIKA BELUM LOGIN: TAMPILKAN MODAL LOGIN & REGISTRASI
  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter'] w-full">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="w-full px-6 md:px-10 py-8 flex-1">
        {/* Modul 1: Dashboard Ringkas */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 w-full">
            <StatsCards stats={stats} />

            <FilterBar
              search={search}
              setSearch={setSearch}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
              onNewReport={() => setActiveTab("form")}
              onReset={() => {
                setSearch("");
                setFilterDate("");
              }}
            />
            <ReportTable
              reports={filteredReports}
              onExportPdf={handleExportPdf}
            />
          </div>
        )}

        {/* Modul 2: Excel / Worksheet Pekerjaan */}
        {activeTab === "worksheet" && <WorksheetManager />}

        {/* Modul 3: Dokumen Word */}
        {activeTab === "documents" && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <i className="fa-solid fa-file-word text-blue-600 mr-2.5"></i>{" "}
              Pengolah Dokumen Word
            </h2>
            <p className="text-xs text-slate-500">
              Buat, edit, dan simpan dokumen naskah/surat secara langsung di
              aplikasi.
            </p>
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <i className="fa-solid fa-file-lines text-4xl text-slate-300 mb-2"></i>
              <p className="text-sm text-slate-500 font-medium">
                Modul Dokumen Word siap dihubungkan dengan komponen Text Editor.
              </p>
            </div>
          </div>
        )}

        {/* Modul 4: Grafik & Analisis Data (Halaman Terpisah) */}
        {activeTab === "analytics" && (
          <div className="space-y-6 w-full">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <i className="fa-solid fa-chart-line text-blue-600 mr-2.5"></i>{" "}
                Visualisasi Grafik & Analisis Data
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Analisis tren dan visualisasi grafik lengkap dari data Excel dan
                Laporan.
              </p>
            </div>
            <ExcelChartViewer />
          </div>
        )}

        {/* Modul 5: Galeri Foto */}
        {activeTab === "gallery" && <PhotoGallery />}

        {/* Modul 6: Drive Berkas */}
        {activeTab === "drive" && <DriveSection />}

        {/* Modul 7: Form Input Laporan Harian */}
        {activeTab === "form" && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Form Input Laporan Harian
                </h2>
                <p className="text-xs text-slate-500">
                  Lengkapi formulir di bawah ini dengan data pekerjaan yang
                  akurat.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-sm text-slate-600 hover:text-slate-900 bg-slate-200/80 px-3 py-1.5 rounded-lg transition"
              >
                <i className="fa-solid fa-arrow-left mr-1"></i> Kembali
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6 w-full">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4 w-full">
                <h3 className="font-bold text-slate-800 text-md border-b pb-2 border-slate-100 flex items-center">
                  <i className="fa-solid fa-user-gear text-blue-600 mr-2"></i>{" "}
                  Informasi Utama
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Tanggal Pekerjaan *
                    </label>
                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nama Petugas / Teknisi *
                    </label>
                    <input
                      type="text"
                      value={petugas}
                      readOnly
                      className="w-full bg-slate-100 text-slate-700 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none font-semibold cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Jenis Pekerjaan / Project *
                    </label>
                    <input
                      type="text"
                      value={jenisPekerjaan}
                      onChange={(e) => setJenisPekerjaan(e.target.value)}
                      placeholder="Contoh: Maintenance Server"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <ChecklistSection items={ceklisItems} setItems={setCeklisItems} />
              <WorksheetSection
                rows={worksheetRows}
                setRows={setWorksheetRows}
              />

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4 w-full">
                <h3 className="font-bold text-slate-800 text-md border-b pb-2 border-slate-100 flex items-center">
                  <i className="fa-solid fa-file-arrow-up text-blue-600 mr-2"></i>{" "}
                  Upload Lampiran Berkas & Dokumentasi
                </h3>
                <input
                  type="file"
                  multiple
                  accept=".xlsx, .xls, .csv, .doc, .docx, .pdf, image/*"
                  onChange={(e) =>
                    setPhotoFiles(Array.from(e.target.files || []))
                  }
                  className="block w-full text-sm text-slate-500 border border-slate-300 rounded-xl p-2 cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-400">
                  Format yang didukung: Excel (.xlsx, .xls, .csv), Word (.doc,
                  .docx), PDF, dan Foto/Gambar.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 transition flex items-center"
                >
                  <i className="fa-solid fa-floppy-disk mr-2"></i> Simpan
                  Laporan
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <PdfReportTemplate reports={reports} />
    </div>
  );
}
