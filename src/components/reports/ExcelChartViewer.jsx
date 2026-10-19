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
  const [activeSheet, setActiveSheet] = useState("Februari 2026");
  const [loading, setLoading] = useState(false);
  const [dataRows, setDataRows] = useState([]);
  const [paramCharts, setParamCharts] = useState([]);

  // Fungsi mengubah string bernilai koma (seperti '25,4') menjadi angka float (25.4)
  const cleanNumber = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    if (typeof val === "number") return val;
    let str = String(val).trim().replace(",", ".");
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // Fungsi mendeteksi aliran '+' (1) atau '-' (0)
  const cleanAliran = (val) => {
    if (!val) return 0;
    const str = String(val).trim();
    return str.includes("+") ? 1 : 0;
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

      // Ambil format CSV langsung dari Google Sheets agar struktur kolom presisi
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
        sheetName,
      )}`;

      const res = await fetch(csvUrl);
      const csvText = await res.text();

      // Parse CSV menggunakan XLSX
      const workbook = XLSX.read(csvText, { type: "string" });
      const firstSheetName = workbook.SheetNames[0];
      const rawData = XLSX.utils.sheet_to_json(
        workbook.Sheets[firstSheetName],
        {
          header: 1,
          defval: "",
        },
      );

      // Cari baris tempat tanggal dimulai (Baris yang memuat teks "02-" atau tanggal)
      let startRowIndex = -1;
      for (let i = 0; i < rawData.length; i++) {
        const firstCell = String(rawData[i][0] || "").trim();
        if (
          firstCell.match(/^\d{2}-\d{2}-\d{4}/) ||
          firstCell.match(/^\d{1,2}\/\d{1,2}/)
        ) {
          startRowIndex = i;
          break;
        }
      }

      if (startRowIndex === -1) startRowIndex = 5; // Default baris ke-6

      const parsedData = [];
      for (let i = startRowIndex; i < rawData.length; i++) {
        const row = rawData[i];
        const tanggalCell = String(row[0] || "").trim();

        // Stop jika menemukan baris Keterangan / Tanda Tangan
        if (!tanggalCell || tanggalCell.toLowerCase().includes("keterangan")) {
          break;
        }

        parsedData.push({
          tanggal: tanggalCell.slice(0, 10),
          // Outlet I (Kiri)
          suhuKiri: cleanNumber(row[1]), // Kolom B
          phKiri: cleanNumber(row[2]), // Kolom C
          aliranKiri: cleanAliran(row[3]), // Kolom D
          tdsKiri: cleanNumber(row[6]), // Kolom G
          usiaIkan: cleanNumber(row[9]), // Kolom J
          debitKiri: cleanNumber(row[10]), // Kolom K
          selisihKiri: cleanNumber(row[11]), // Kolom L

          // Outlet II (Kanan)
          suhuKanan: cleanNumber(row[14]), // Kolom O
          phKanan: cleanNumber(row[15]), // Kolom P
          aliranKanan: cleanAliran(row[16]), // Kolom Q
          tdsKanan: cleanNumber(row[19]), // Kolom T
          selisihKanan: cleanNumber(row[22]), // Kolom W
        });
      }

      setDataRows(parsedData);
      setupCharts();
    } catch (err) {
      console.error("Gagal membaca Google Sheets:", err);
      alert(
        "Gagal memuat data. Pastikan Google Sheet diatur ke 'Siapa saja yang memiliki link'",
      );
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-file-excel text-emerald-600 mr-2.5"></i>{" "}
            Logbook Air Limbah RS Hermina Karawang
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Membaca data CSV secara presisi dari Google Sheets.
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

      {/* Input Google Sheets */}
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

      {/* TAMPILAN GRAFIK */}
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
                          <span className="text-[10px] font-extrabold text-cyan-300 mb-1">
                            {val}
                          </span>

                          <div
                            style={{ height: `${Math.max(heightPct, 6)}%` }}
                            className={`w-full ${barBg} rounded-t-md transition-all duration-300 relative flex justify-center`}
                          ></div>

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
            Menyambungkan dan membaca CSV Google Sheets...
          </p>
        </div>
      )}
    </div>
  );
}
