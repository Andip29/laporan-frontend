import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function ExcelChartViewer() {
  const [chartData, setChartData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [numericColumns, setNumericColumns] = useState([]);
  const [chartType, setChartType] = useState("line");
  const [loading, setLoading] = useState(false);

  // 1. MASUKKAN LINK CSV GOOGLE SHEETS ANDA DI SINI
  const [sheetUrl, setSheetUrl] = useState(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv",
  );

  // Ambil data otomatis saat halaman pertama kali dibuka
  useEffect(() => {
    if (sheetUrl && !sheetUrl.includes("2PACX-1v...")) {
      fetchGoogleSheetData(sheetUrl);
    }
  }, []);

  // Fungsi Fetch Data Real-time dari Google Sheets
  const fetchGoogleSheetData = async (url) => {
    if (!url) return alert("Masukkan URL Publikasi CSV Google Sheets!");
    setLoading(true);
    try {
      const response = await fetch(url);
      const csvText = await response.text();

      // Parse CSV menggunakan XLSX/SheetJS
      const workbook = XLSX.read(csvText, { type: "string" });
      const sheetName = workbook.SheetNames[0];
      const dataJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: "",
      });

      if (dataJson.length === 0) {
        alert("Data dari Google Sheets kosong!");
        return;
      }

      // Deteksi kolom yang berisi angka
      const keys = Object.keys(dataJson[0]);
      const validNumCols = keys.filter((key) =>
        dataJson.some((row) => !isNaN(parseFloat(row[key]))),
      );

      setNumericColumns(validNumCols);
      if (validNumCols.length > 0) {
        setSelectedColumn(validNumCols[validNumCols.length - 1]);
      }

      setChartData(dataJson);
    } catch (err) {
      console.error("Gagal mengambil data Google Sheets:", err);
      alert(
        "Gagal memuat data dari Google Sheets. Pastikan link dipublikasikan sebagai CSV!",
      );
    } finally {
      setLoading(false);
    }
  };

  const maxVal = Math.max(
    ...chartData.map((d) => parseFloat(d[selectedColumn]) || 0),
    10,
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 w-full">
      {/* Header & Pengaturan URL Google Sheets */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-file-excel text-emerald-600 mr-2"></i>{" "}
            Integrasi Live Google Sheets
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik akan diperbarui secara otomatis mengikuti data terbaru dari
            Google Sheets.
          </p>
        </div>

        <button
          onClick={() => fetchGoogleSheetData(sheetUrl)}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm flex items-center"
        >
          <i
            className={`fa-solid fa-rotate mr-2 ${loading ? "animate-spin" : ""}`}
          ></i>
          {loading ? "Memuat Data..." : "Refresh Data Live"}
        </button>
      </div>

      {/* Form Input Link CSV Google Sheets */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
        <label className="block text-xs font-semibold text-slate-700">
          URL Publikasi CSV Google Sheets:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="Tempel link CSV dari Google Sheets di sini..."
            className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => fetchGoogleSheetData(sheetUrl)}
            className="bg-blue-600 text-white text-xs px-4 py-2 rounded-xl font-semibold hover:bg-blue-700"
          >
            Hubungkan
          </button>
        </div>
      </div>

      {/* Kontrol Pilihan Parameter & Grafik */}
      {chartData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3 rounded-xl">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">
              Parameter Grafik:
            </label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              {numericColumns.map((col, idx) => (
                <option key={idx} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                chartType === "line"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600"
              }`}
            >
              Garis (Line)
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                chartType === "bar"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600"
              }`}
            >
              Batang (Bar)
            </button>
          </div>
        </div>
      )}

      {/* TAMPILAN VISUALISASI DIAGRAM */}
      {chartData.length > 0 ? (
        <div className="bg-slate-900 text-white p-6 rounded-2xl min-h-[260px] flex items-end justify-between gap-1 overflow-x-auto">
          {chartData.map((row, idx) => {
            const val = parseFloat(row[selectedColumn]) || 0;
            const heightPct = Math.round((val / maxVal) * 100);
            const tanggalLabel =
              row["Tanggal"] || row["TANGGAL"] || `H-${idx + 1}`;

            return (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 h-48 justify-end group min-w-[20px]"
              >
                <div
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                  className={`w-full transition-all duration-300 rounded-t-sm relative group-hover:bg-cyan-400 ${
                    chartType === "line" ? "bg-blue-500" : "bg-indigo-500"
                  }`}
                >
                  <span className="absolute -top-6 text-[9px] font-bold text-white bg-slate-800 px-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {val}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 mt-2 rotate-45 transform origin-left truncate max-w-[30px]">
                  {String(tanggalLabel).slice(0, 5)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <i className="fa-solid fa-link text-3xl text-slate-300 mb-2"></i>
          <p className="text-sm font-semibold text-slate-600">
            Belum terhubung ke Google Sheets
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Masukkan URL CSV Google Sheets di atas lalu klik{" "}
            <strong>Hubungkan</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
