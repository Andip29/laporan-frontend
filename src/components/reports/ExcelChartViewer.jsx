import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelChartViewer() {
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState("");
  const [workbook, setWorkbook] = useState(null);
  const [dataRows, setDataRows] = useState([]);
  const [paramColumns, setParamColumns] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // 1. Unggah File Logbook Excel / Read File
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });

      setWorkbook(wb);
      setSheetNames(wb.SheetNames);

      // Load sheet pertama secara otomatis
      if (wb.SheetNames.length > 0) {
        loadSheetData(wb, wb.SheetNames[0]);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 2. Fungsi Memuat Data berdasarkan Sheet yang Dipilih
  const loadSheetData = (wb, sheetName) => {
    setActiveSheet(sheetName);
    const ws = wb.Sheets[sheetName];

    // Convert sheet ke JSON array raw (mulai membaca dari header baris yang tepat)
    const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    // Mencari baris header yang berisi "Tanggal" atau header angka
    let headerRowIndex = rawData.findIndex((row) =>
      row.some(
        (cell) =>
          String(cell).toLowerCase().includes("tanggal") ||
          String(cell).includes("09-") ||
          String(cell).includes("2026"),
      ),
    );

    if (headerRowIndex === -1) headerRowIndex = 6; // Default baris ke-7 (index 6) sesuai format Hermina

    const headers = rawData[headerRowIndex] || [];
    const rows = rawData.slice(headerRowIndex + 1);

    // Filter baris yang valid (memiliki tanggal)
    const formattedRows = [];
    rows.forEach((row) => {
      const tanggal = row[0] || row[1] || row[13]; // Membaca kolom tanggal utama
      if (
        tanggal &&
        String(tanggal).trim() !== "" &&
        !String(tanggal).toLowerCase().includes("keterangan")
      ) {
        const rowObj = { Tanggal: String(tanggal) };
        headers.forEach((h, colIdx) => {
          if (h && colIdx !== 0) {
            const cleanHeader = `${h} (Kolom ${colIdx + 1})`;
            const val = parseFloat(row[colIdx]);
            rowObj[cleanHeader] = isNaN(val) ? row[colIdx] : val;
          }
        });
        formattedRows.push(rowObj);
      }
    });

    setDataRows(formattedRows);

    // Ambil daftar parameter kolom numerik (Suhu, pH, TDS, Debit, dll)
    if (formattedRows.length > 0) {
      const keys = Object.keys(formattedRows[0]).filter((k) => k !== "Tanggal");
      setParamColumns(keys);
    }
  };

  // Filter Data berdasarkan Tanggal jika diisi oleh user
  const filteredData = dataRows.filter((r) => {
    if (!filterStartDate && !filterEndDate) return true;
    const dateStr = r.Tanggal;
    const matchStart = !filterStartDate || dateStr >= filterStartDate;
    const matchEnd = !filterEndDate || dateStr <= filterEndDate;
    return matchStart && matchEnd;
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 w-full">
      {/* Header & File Upload */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-chart-area text-blue-600 mr-2.5"></i>{" "}
            Dashboard Visualisasi Logbook Air Limbah
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pilih sheet bulan dan lihat diagram grafik harian untuk setiap
            parameter (Suhu, pH, TDS, Debit).
          </p>
        </div>

        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          className="text-xs border border-slate-300 rounded-xl p-2 bg-slate-50 cursor-pointer"
        />
      </div>

      {/* 1. PILIHAN SHEET (PILIH BULAN) */}
      {sheetNames.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            <i className="fa-solid fa-layer-group mr-1.5 text-blue-600"></i>{" "}
            Pilih Sheet / Bulan:
          </label>
          <div className="flex flex-wrap gap-2">
            {sheetNames.map((sName, idx) => (
              <button
                key={idx}
                onClick={() => loadSheetData(workbook, sName)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                  activeSheet === sName
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. FILTER TANGGAL */}
      {dataRows.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-wrap items-center gap-4">
          <span className="text-xs font-bold text-slate-700 flex items-center">
            <i className="fa-solid fa-filter text-slate-500 mr-1.5"></i> Filter
            Tanggal:
          </span>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-500">Dari:</label>
            <input
              type="text"
              placeholder="09-02-2026"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-500">Sampai:</label>
            <input
              type="text"
              placeholder="09-30-2026"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
            />
          </div>
          {(filterStartDate || filterEndDate) && (
            <button
              onClick={() => {
                setFilterStartDate("");
                setFilterEndDate("");
              }}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}

      {/* 3. TAMPILAN DIAGRAM GRAFIK TERPISAH PER PARAMETER */}
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {paramColumns.map((paramKey, pIdx) => {
            // Cari nilai maksimum untuk skala tinggi grafik
            const maxVal = Math.max(
              ...filteredData.map((d) =>
                typeof d[paramKey] === "number" ? d[paramKey] : 0,
              ),
              10,
            );

            return (
              <div
                key={pIdx}
                className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-cyan-400 truncate max-w-[250px]">
                    <i className="fa-solid fa-chart-line mr-1.5"></i> Grafik
                    Harian: {paramKey}
                  </h4>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                    Max: {maxVal}
                  </span>
                </div>

                {/* Container Diagram Batang / Line per Tanggal */}
                <div className="h-44 flex items-end justify-between gap-1 pt-4 overflow-x-auto">
                  {filteredData.map((row, rIdx) => {
                    const rawVal = row[paramKey];
                    const numVal = typeof rawVal === "number" ? rawVal : 0;
                    const heightPct = Math.round((numVal / maxVal) * 100);

                    return (
                      <div
                        key={rIdx}
                        className="flex flex-col items-center flex-1 h-full justify-end group min-w-[16px]"
                      >
                        {/* Batang Visualisasi */}
                        <div
                          style={{ height: `${Math.max(heightPct, 3)}%` }}
                          className="w-full bg-blue-500 rounded-t-sm group-hover:bg-cyan-400 transition-all duration-200 relative flex justify-center"
                        >
                          {/* Tooltip Nilai saat Hover */}
                          <span className="absolute -top-6 text-[9px] font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                            {rawVal}
                          </span>
                        </div>

                        {/* Label Tanggal */}
                        <span className="text-[8px] text-slate-400 mt-1.5 rotate-45 transform origin-left truncate max-w-[24px]">
                          {row.Tanggal
                            ? String(row.Tanggal).slice(3, 10)
                            : `H-${rIdx + 1}`}
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
          <i className="fa-solid fa-file-excel text-4xl text-emerald-500 mb-2"></i>
          <p className="text-sm font-semibold text-slate-600">
            Belum ada file logbook diproses
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Unggah file Excel Logbook Air Limbah untuk melihat daftar sheet dan
            grafik terpisah per parameter.
          </p>
        </div>
      )}
    </div>
  );
}
