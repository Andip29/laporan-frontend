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
  const [activeSheet, setActiveSheet] = useState("September 2026");
  const [loading, setLoading] = useState(false);
  const [dataRows, setDataRows] = useState([]);
  const [paramCharts, setParamCharts] = useState([]);

  // Ekstrak ID dari URL Google Sheets
  const extractSpreadsheetId = (url) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  useEffect(() => {
    if (sheetInput) {
      fetchGoogleSheetData(activeSheet);
    }
  }, [activeSheet]);

  // 1. MEMBACA DATA DARI GOOGLE SHEETS LIVE
  const fetchGoogleSheetData = async (sheetName) => {
    if (!sheetInput) return alert("Masukkan link / ID Google Sheets!");
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
      rows.slice(6).forEach((r) => {
        if (!r.c) return;
        const tanggalVal = r.c[0]?.v || r.c[1]?.v || r.c[13]?.v;
        if (
          tanggalVal &&
          String(tanggalVal).includes("202") &&
          !String(tanggalVal).toLowerCase().includes("keterangan")
        ) {
          cleanRows.push({
            tanggal: String(tanggalVal),
            suhuKiri: parseFloat(r.c[2]?.v) || 0,
            phKiri: parseFloat(r.c[3]?.v) || 0,
            tdsKiri: parseFloat(r.c[6]?.v) || 0,
            debitKiri: parseFloat(r.c[10]?.v) || 0,
            suhuKanan: parseFloat(r.c[14]?.v) || 0,
            phKanan: parseFloat(r.c[15]?.v) || 0,
            tdsKanan: parseFloat(r.c[19]?.v) || 0,
          });
        }
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

  // 2. MEMBACA FILE EXCEL MANUALLY (.XLSX)
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
        rawData.slice(6).forEach((r) => {
          const tanggalVal = r[0] || r[1] || r[13];
          if (
            tanggalVal &&
            String(tanggalVal).includes("202") &&
            !String(tanggalVal).toLowerCase().includes("keterangan")
          ) {
            cleanRows.push({
              tanggal: String(tanggalVal),
              suhuKiri: parseFloat(r[2]) || 0,
              phKiri: parseFloat(r[3]) || 0,
              tdsKiri: parseFloat(r[6]) || 0,
              debitKiri: parseFloat(r[10]) || 0,
              suhuKanan: parseFloat(r[14]) || 0,
              phKanan: parseFloat(r[15]) || 0,
              tdsKanan: parseFloat(r[19]) || 0,
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
        title: "Grafik Suhu (°C) - Outlet Kiri",
        key: "suhuKiri",
        color: "bg-amber-500",
      },
      {
        title: "Grafik pH - Outlet Kiri",
        key: "phKiri",
        color: "bg-emerald-500",
      },
      {
        title: "Grafik TDS - Outlet Kiri",
        key: "tdsKiri",
        color: "bg-indigo-500",
      },
      {
        title: "Grafik Debit IPAL (M3)",
        key: "debitKiri",
        color: "bg-blue-500",
      },
      {
        title: "Grafik Suhu (°C) - Bak Akhir Kanan",
        key: "suhuKanan",
        color: "bg-orange-500",
      },
      {
        title: "Grafik pH - Bak Akhir Kanan",
        key: "phKanan",
        color: "bg-teal-500",
      },
      {
        title: "Grafik TDS - Bak Akhir Kanan",
        key: "tdsKanan",
        color: "bg-purple-500",
      },
    ]);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 w-full">
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-file-excel text-emerald-600 mr-2.5"></i>{" "}
            Dashboard Visualisasi Logbook Air Limbah
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrasi langsung ke Google Sheets & file Excel dengan diagram
            terpisah per parameter.
          </p>
        </div>

        <button
          onClick={() => fetchGoogleSheetData(activeSheet)}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm flex items-center"
        >
          <i
            className={`fa-solid fa-rotate mr-2 ${loading ? "animate-spin" : ""}`}
          ></i>
          {loading ? "Memuat..." : "Refresh Live Data"}
        </button>
      </div>

      {/* BOX INPUT LINK GOOGLE SHEETS */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 flex items-center">
            <i className="fa-solid fa-link text-blue-600 mr-1.5"></i> Masukkan
            Link / ID Google Sheets:
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400">
              Atau upload manual:
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
            placeholder="Tempelkan link / ID Google Sheets di sini..."
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

      {/* PILIHAN TAB SHEET BULAN */}
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

      {/* TAMPILAN DIAGRAM GRAFIK TERPISAH PER PARAMETER */}
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
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                    Max: {maxVal}
                  </span>
                </div>

                <div className="h-44 flex items-end justify-between gap-1 pt-4 overflow-x-auto">
                  {dataRows.map((row, rIdx) => {
                    const val = row[chart.key];
                    const heightPct = Math.round((val / maxVal) * 100);

                    return (
                      <div
                        key={rIdx}
                        className="flex flex-col items-center flex-1 h-full justify-end group min-w-[16px]"
                      >
                        <div
                          style={{ height: `${Math.max(heightPct, 4)}%` }}
                          className={`w-full ${chart.color} rounded-t-sm group-hover:bg-cyan-400 transition-all duration-200 relative flex justify-center`}
                        >
                          <span className="absolute -top-6 text-[9px] font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                            {val}
                          </span>
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1.5 rotate-45 transform origin-left truncate max-w-[24px]">
                          {row.tanggal.slice(0, 5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <i className="fa-solid fa-spinner animate-spin text-2xl text-blue-600 mb-2 block"></i>
          <p className="text-sm font-semibold text-slate-600">
            Sedang mengambil data dari Google Sheets...
          </p>
        </div>
      )}
    </div>
  );
}
