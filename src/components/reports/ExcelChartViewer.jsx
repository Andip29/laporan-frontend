import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function ExcelChartViewer() {
  const [sheetInput, setSheetInput] = useState(
    "1Catq1SEdWG61MdY6TVPB2bO1Wk-JYdNxZV2eiW_cX8I",
  );
  const [sheetNames] = useState([
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
  const [activeSheet, setActiveSheet] = useState("Januari 2026");
  const [loading, setLoading] = useState(false);
  const [dataRows, setDataRows] = useState([]);
  const [paramCharts, setParamCharts] = useState([]);

  // 1. Format Tanggal
  const parseExcelDate = (val) => {
    if (!val) return "";
    const str = String(val).trim();

    const num = parseFloat(str);
    if (!isNaN(num) && num > 40000 && num < 60000) {
      const dateObj = XLSX.SSF.parse_date_code(num);
      if (dateObj) {
        const day = String(dateObj.d).padStart(2, "0");
        const month = String(dateObj.m).padStart(2, "0");
        return `${day}-${month}`;
      }
    }

    if (str.length >= 5) return str.slice(0, 5);
    return str;
  };

  // 2. Koreksi pH (misal: 764 -> 7.64 atau 7,64 -> 7.64)
  const parsePH = (val) => {
    let num = parseFloat(String(val).replace(",", "."));
    if (isNaN(num)) return 0;
    if (num > 100) num = num / 100;
    else if (num > 20) num = num / 10;
    return parseFloat(num.toFixed(2));
  };

  // 3. Clean Angka Normal (Debit)
  const parseDebit = (val) => {
    const num = parseFloat(String(val).replace(",", "."));
    return isNaN(num) ? 0 : num;
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

  const fetchGoogleSheetData = async (sheetName) => {
    if (!sheetInput) return alert("Silakan masukkan link Google Sheets!");
    setLoading(true);

    try {
      const spreadsheetId = extractSpreadsheetId(sheetInput);
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
        sheetName,
      )}`;

      const res = await fetch(csvUrl);
      const csvText = await res.text();

      const workbook = XLSX.read(csvText, { type: "string" });
      const firstSheetName = workbook.SheetNames[0];
      const rawData = XLSX.utils.sheet_to_json(
        workbook.Sheets[firstSheetName],
        {
          header: 1,
          defval: "",
        },
      );

      const parsedData = [];

      rawData.forEach((row) => {
        const rawDate = row[0];
        if (!rawDate) return;

        const dateStr = parseExcelDate(rawDate);
        const lowerDate = String(rawDate).toLowerCase();

        // FILTER DENGAN KETAT: Abaikan header (Lokasi, Bulan, Area, Keterangan, Tanggal)
        if (
          !dateStr ||
          lowerDate.includes("lokasi") ||
          lowerDate.includes("bulan") ||
          lowerDate.includes("area") ||
          lowerDate.includes("keterangan") ||
          lowerDate.includes("tanggal")
        ) {
          return;
        }

        parsedData.push({
          tanggal: dateStr,
          // OUTLET 1
          phOutlet1: parsePH(row[2]), // Kolom C: pH Outlet I
          debitOutlet1: parseDebit(row[11]), // Kolom L: Selisih Debit Outlet I

          // OUTLET 2
          phOutlet2: parsePH(row[15]), // Kolom P: pH Outlet II
          debitOutlet2: parseDebit(row[22]), // Kolom W: Selisih Debit Outlet II
        });
      });

      setDataRows(parsedData);
      setupCharts();
    } catch (err) {
      console.error("Gagal membaca Google Sheets:", err);
      alert("Gagal memuat data Google Sheets.");
    } finally {
      setLoading(false);
    }
  };

  const setupCharts = () => {
    setParamCharts([
      {
        title: "Grafik pH - Outlet I",
        key: "phOutlet1",
        type: "ph",
        minSafe: 6,
        maxSafe: 9,
      },
      {
        title: "Grafik Selisih Debit (M3) - Outlet I",
        key: "debitOutlet1",
        type: "debit",
        color: "bg-blue-500",
      },
      {
        title: "Grafik pH - Outlet II",
        key: "phOutlet2",
        type: "ph",
        minSafe: 6,
        maxSafe: 9,
      },
      {
        title: "Grafik Selisih Debit (M3) - Outlet II",
        key: "debitOutlet2",
        type: "debit",
        color: "bg-teal-500",
      },
    ]);
  };

  const getBarColor = (val, chart) => {
    if (chart.type === "ph") {
      return val >= 6 && val <= 9
        ? "bg-emerald-500"
        : "bg-rose-600 animate-pulse";
    }
    return chart.color || "bg-blue-500";
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-file-excel text-emerald-600 mr-2.5"></i>{" "}
            Visualisasi pH & Debit (Outlet I & Outlet II)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Menampilkan data grafik pH dan Debit IPAL harian untuk Outlet 1 dan
            Outlet 2.
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
        <label className="text-xs font-bold text-slate-700 flex items-center">
          <i className="fa-solid fa-link text-blue-600 mr-1.5"></i> Link / ID
          Google Sheets:
        </label>
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

      {/* TAMPILAN GRAFIK 4 PARAMETER (pH & Debit Outlet I & II) */}
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
                          {/* Angka Nilai */}
                          <span className="text-[10px] font-extrabold text-cyan-300 mb-1">
                            {val}
                          </span>

                          {/* Batang Grafik */}
                          <div
                            style={{ height: `${Math.max(heightPct, 6)}%` }}
                            className={`w-full ${barBg} rounded-t-md transition-all duration-300 relative flex justify-center`}
                          ></div>

                          {/* Tanggal */}
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
            Sedang memuat data pH & Debit Outlet I dan II...
          </p>
        </div>
      )}
    </div>
  );
}
