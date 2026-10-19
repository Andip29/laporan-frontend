import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function ExcelChartViewer() {
  const [sheetInput, setSheetInput] = useState(
    "1Catq1SEdWG61MdY6TVPB2bO1Wk-JYdNxZV2eiW_cX8I",
  );
  const [sheetNames, setSheetNames] = useState([
    "Januari 2026",
    "Februari 2026",
    "Maret 2026",
    "April 2026",
    "Mei 2026",
    "Juni 2026",
    "Juli 2026",
    "Agustus 2026",
    "September 2026",
    "Oktober 2026",
  ]);
  const [activeSheet, setActiveSheet] = useState("Februari 2026");
  const [loading, setLoading] = useState(false);
  const [dataRows, setDataRows] = useState([]);
  const [paramCharts, setParamCharts] = useState([]);

  // 1. Mengubah Koma (,) ke Titik (.) dan Konversi ke Angka Desimal Presisi
  const parseNumberWithComma = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    if (typeof val === "number") return val;

    let str = String(val).trim();
    if (str.startsWith("Date(")) return 0;

    // Ganti koma dengan titik untuk desimal
    str = str.replace(",", ".");
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // 2. Format Tanggal dari Respon GViz Google Sheets
  const parseGVizDate = (val) => {
    if (!val) return "";
    const str = String(val);
    if (str.startsWith("Date(")) {
      const parts = str.replace("Date(", "").replace(")", "").split(",");
      if (parts.length >= 3) {
        const month = String(parseInt(parts[1]) + 1).padStart(2, "0");
        const day = String(parts[2]).padStart(2, "0");
        return `${month}-${day}`;
      }
    }
    return str.slice(0, 10);
  };

  // 3. Parsing Simbol Aliran (+ = 1, - = 0)
  const parseAliran = (val) => {
    if (!val) return 0;
    const str = String(val).trim();
    return str === "+" || str === "(+)" ? 1 : 0;
  };

  const extractSpreadsheetId = (url) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  useEffect(() => {
    if (sheetInput) {
      fetchGoogleSheetData(activeSheet);
    }
  }, [activeSheet]);

  // BACA DATA GOOGLE SHEETS LIVE
  const fetchGoogleSheetData = async (sheetName) => {
    if (!sheetInput) return alert("Silakan masukkan link / ID Google Sheets!");
    setLoading(true);
    try {
      const spreadsheetId = extractSpreadsheetId(sheetInput);
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
        sheetName,
      )}`;

      const res = await fetch(gvizUrl);
      const text = await res.text();

      const jsonString = text.substring(
        text.indexOf("{"),
        text.lastIndexOf("}") + 1,
      );
      const data = JSON.parse(jsonString);

      const rows = data.table.rows || [];

      const cleanRows = [];
      // Data Harian Dimulai dari Baris Ke-6 (Indeks Array 5)
      rows.slice(5).forEach((r) => {
        if (!r.c) return;

        // Ambil Tanggal (Kolom A / Index 0)
        const rawDate = r.c[0]?.f || r.c[0]?.v;
        if (!rawDate) return;

        const formattedDate = parseGVizDate(rawDate);
        if (
          !formattedDate ||
          formattedDate.toLowerCase().includes("keterangan")
        )
          return;

        cleanRows.push({
          tanggal: formattedDate,
          // OUTLET I (KIRI)
          suhuKiri: parseNumberWithComma(r.c[1]?.v ?? r.c[1]?.f), // Kolom B: Suhu
          phKiri: parseNumberWithComma(r.c[2]?.v ?? r.c[2]?.f), // Kolom C: pH
          aliranKiri: parseAliran(r.c[3]?.v ?? r.c[3]?.f), // Kolom D: Aliran (+/-)
          tdsKiri: parseNumberWithComma(r.c[6]?.v ?? r.c[6]?.f), // Kolom G: TDS
          usiaIkan: parseNumberWithComma(r.c[9]?.v ?? r.c[9]?.f), // Kolom J: Usia Ikan
          debitKiri: parseNumberWithComma(r.c[10]?.v ?? r.c[10]?.f), // Kolom K: Meter Debit
          selisihKiri: parseNumberWithComma(r.c[11]?.v ?? r.c[11]?.f), // Kolom L: Selisih M3

          // OUTLET II (KANAN)
          suhuKanan: parseNumberWithComma(r.c[14]?.v ?? r.c[14]?.f), // Kolom O: Suhu Kanan
          phKanan: parseNumberWithComma(r.c[15]?.v ?? r.c[15]?.f), // Kolom P: pH Kanan
          aliranKanan: parseAliran(r.c[16]?.v ?? r.c[16]?.f), // Kolom Q: Aliran Kanan
          tdsKanan: parseNumberWithComma(r.c[19]?.v ?? r.c[19]?.f), // Kolom T: TDS Kanan
          selisihKanan: parseNumberWithComma(r.c[22]?.v ?? r.c[22]?.f), // Kolom W: Selisih M3 Kanan
        });
      });

      setDataRows(cleanRows);
      setupCharts();
    } catch (err) {
      console.error("Gagal membaca Google Sheets:", err);
      alert(
        "Gagal membaca Google Sheets. Pastikan akses file diset 'Siapa saja yang memiliki link'",
      );
    } finally {
      setLoading(false);
    }
  };

  // BACA FILE EXCEL MANUALLY (.XLSX)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      setSheetNames(wb.SheetNames);
      if (wb.SheetNames.length > 0) {
        const firstSheet = wb.SheetNames[0];
        setActiveSheet(firstSheet);
        const ws = wb.Sheets[firstSheet];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        const cleanRows = [];
        rawData.slice(5).forEach((r) => {
          const tanggalVal = r[0];
          if (
            tanggalVal &&
            !String(tanggalVal).toLowerCase().includes("keterangan")
          ) {
            cleanRows.push({
              tanggal: String(tanggalVal).slice(0, 10),
              suhuKiri: parseNumberWithComma(r[1]),
              phKiri: parseNumberWithComma(r[2]),
              aliranKiri: parseAliran(r[3]),
              tdsKiri: parseNumberWithComma(r[6]),
              usiaIkan: parseNumberWithComma(r[9]),
              debitKiri: parseNumberWithComma(r[10]),
              selisihKiri: parseNumberWithComma(r[11]),
              suhuKanan: parseNumberWithComma(r[14]),
              phKanan: parseNumberWithComma(r[15]),
              aliranKanan: parseAliran(r[16]),
              tdsKanan: parseNumberWithComma(r[19]),
              selisihKanan: parseNumberWithComma(r[22]),
            });
          }
        });
        setDataRows(cleanRows);
        setupCharts();
      }
    };
    reader.readAsBinaryString(file);
  };

  const setupCharts = () => {
    setParamCharts([
      {
        title: "Grafik Suhu (°C) - Outlet I",
        key: "suhuKiri",
        type: "suhu",
        minSafe: 25,
        maxSafe: 38,
      },
      {
        title: "Grafik pH - Outlet I",
        key: "phKiri",
        type: "ph",
        minSafe: 6,
        maxSafe: 9,
      },
      {
        title: "Grafik TDS - Outlet I",
        key: "tdsKiri",
        type: "normal",
        color: "bg-indigo-500",
      },
      {
        title: "Grafik Selisih Debit (M3) - Outlet I",
        key: "selisihKiri",
        type: "normal",
        color: "bg-blue-500",
      },
      {
        title: "Grafik Usia Ikan (Hari)",
        key: "usiaIkan",
        type: "normal",
        color: "bg-cyan-600",
      },
      {
        title: "Grafik Suhu (°C) - Outlet II",
        key: "suhuKanan",
        type: "suhu",
        minSafe: 25,
        maxSafe: 38,
      },
      {
        title: "Grafik pH - Outlet II",
        key: "phKanan",
        type: "ph",
        minSafe: 6,
        maxSafe: 9,
      },
      {
        title: "Grafik TDS - Outlet II",
        key: "tdsKanan",
        type: "normal",
        color: "bg-purple-500",
      },
      {
        title: "Grafik Selisih Debit (M3) - Outlet II",
        key: "selisihKanan",
        type: "normal",
        color: "bg-teal-500",
      },
    ]);
  };

  const getBarColor = (val, chart) => {
    if (chart.type === "suhu") {
      return val >= 25 && val <= 38
        ? "bg-amber-500"
        : "bg-rose-600 animate-pulse";
    }
    if (chart.type === "ph") {
      return val >= 6 && val <= 9
        ? "bg-emerald-500"
        : "bg-rose-600 animate-pulse";
    }
    return chart.color || "bg-blue-500";
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 w-full">
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-file-excel text-emerald-600 mr-2.5"></i>{" "}
            Logbook Air Limbah RS Hermina Karawang
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualisasi data presisi membaca angka desimal koma (,) dan tanggal
            dari Google Sheets.
          </p>
        </div>

        <button
          onClick={() => fetchGoogleSheetData(activeSheet)}
          disabled={loading || !sheetInput}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm flex items-center"
        >
          <i
            className={`fa-solid fa-rotate mr-2 ${loading ? "animate-spin" : ""}`}
          ></i>
          {loading ? "Memuat..." : "Refresh Live Data"}
        </button>
      </div>

      {/* Input Link Google Sheets */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 flex items-center">
            <i className="fa-solid fa-link text-blue-600 mr-1.5"></i> Link / ID
            Google Sheets:
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400">
              Atau upload file:
            </span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="text-xs border border-slate-300 rounded-lg p-1 bg-white cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={sheetInput}
            onChange={(e) => setSheetInput(e.target.value)}
            placeholder="Tempelkan link / ID Google Sheets..."
            className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => fetchGoogleSheetData(activeSheet)}
            className="bg-blue-600 text-white text-xs px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Hubungkan Data
          </button>
        </div>
      </div>

      {/* Tab Sheet Bulan */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          <i className="fa-solid fa-calendar-days mr-1.5 text-blue-600"></i>{" "}
          Pilih Sheet Bulan:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {sheetNames.map((m) => (
            <button
              key={m}
              onClick={() => setActiveSheet(m)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                activeSheet === m
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* TAMPILAN GRAFIK DENGAN ANGKAS ASLI DAN TANGGAL AKURAT */}
      {dataRows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {paramCharts.map((chart, idx) => {
            const maxVal = Math.max(
              ...dataRows.map((d) => d[chart.key] || 0),
              10,
            );

            return (
              <div
                key={idx}
                className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-cyan-400 truncate">
                    {chart.title}
                  </h4>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {chart.minSafe !== undefined
                      ? `Aman: ${chart.minSafe}-${chart.maxSafe}`
                      : `Max: ${maxVal}`}
                  </span>
                </div>

                <div className="h-56 overflow-x-auto pb-4">
                  <div className="h-full flex items-end justify-start gap-3 min-w-[700px] pt-8 px-2">
                    {dataRows.map((row, rIdx) => {
                      const val = row[chart.key];
                      const heightPct = Math.round((val / maxVal) * 100);
                      const barBg = getBarColor(val, chart);

                      return (
                        <div
                          key={rIdx}
                          className="flex flex-col items-center flex-1 h-full justify-end min-w-[28px]"
                        >
                          {/* Angka Nilai Tampil Tepat (25.4, 7.23, 378, dll) */}
                          <span className="text-[10px] font-extrabold text-cyan-300 mb-1">
                            {val}
                          </span>

                          {/* Batang Grafik */}
                          <div
                            style={{ height: `${Math.max(heightPct, 6)}%` }}
                            className={`w-full ${barBg} rounded-t-md transition-all duration-300 relative flex justify-center`}
                          ></div>

                          {/* Tanggal Terbaca Jelas (02-01, 02-02, dst) */}
                          <span className="text-[9px] font-semibold text-slate-300 mt-2 -rotate-45 transform origin-top-left whitespace-nowrap">
                            {row.tanggal}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <i className="fa-solid fa-spinner animate-spin text-2xl text-blue-600 mb-2 block"></i>
          <p className="text-sm font-semibold text-slate-600">
            Sedang menyelaraskan data dengan Google Sheets...
          </p>
        </div>
      )}
    </div>
  );
}
