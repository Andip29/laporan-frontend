import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelChartViewer() {
  const [chartData, setChartData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [numericColumns, setNumericColumns] = useState([]);
  const [chartType, setChartType] = useState("line");

  // Handler Unggah & Parse File Excel/Logbook
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });

      // Ambil sheet pertama
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];

      // Convert sheet ke JSON
      const dataJson = XLSX.utils.sheet_to_json(ws, { defval: "" });

      if (dataJson.length === 0) return alert("File Excel kosong!");

      // Filter nama kolom yang berisi angka untuk opsi grafik
      const keys = Object.keys(dataJson[0]);
      const validNumCols = keys.filter((key) => {
        return dataJson.some((row) => !isNaN(parseFloat(row[key])));
      });

      setNumericColumns(validNumCols);
      if (validNumCols.length > 0) {
        setSelectedColumn(validNumCols[validNumCols.length - 1]); // Default pilih kolom selisih/debit
      }

      setChartData(dataJson);
    };
    reader.readAsBinaryString(file);
  };

  // Mencari nilai maksimum untuk skala grafik
  const maxVal = Math.max(
    ...chartData.map((d) => parseFloat(d[selectedColumn]) || 0),
    10,
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-chart-line text-blue-600 mr-2"></i>{" "}
            Visualisasi Logbook Air Limbah
          </h3>
          <p className="text-xs text-slate-500">
            Unggah logbook Excel (misal: Logbook Air Limbah Harian) untuk
            melihat grafik parameter otomatis.
          </p>
        </div>

        {/* Input File Excel */}
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          className="text-xs border border-slate-300 rounded-xl p-2 bg-slate-50 cursor-pointer"
        />
      </div>

      {/* Kontrol Pilihan Parameter/Kolom & Jenis Grafik */}
      {chartData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3 rounded-xl">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">
              Pilih Parameter Grafik:
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
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                chartType === "line"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600"
              }`}
            >
              Garis (Line)
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
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

      {/* TAMPILAN GRAFIK HASIL PARSING EXCEL */}
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
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <i className="fa-solid fa-file-excel text-4xl text-emerald-500 mb-2"></i>
          <p className="text-sm font-semibold text-slate-600">
            Belum ada file logbook diunggah
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Unggah file format `.xlsx` Logbook Air Limbah untuk menghasilkan
            grafik otomatis.
          </p>
        </div>
      )}
    </div>
  );
}
