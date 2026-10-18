import React from "react";

export default function FilterBar({
  search,
  setSearch,
  filterDate,
  setFilterDate,
  onNewReport,
  onReset,
}) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-64">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari petugas / pekerjaan..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-600"
        />
      </div>

      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
        >
          Reset Filter
        </button>
        <button
          onClick={onNewReport}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition flex items-center shadow-md shadow-blue-200"
        >
          <i className="fa-solid fa-plus mr-2"></i> Buat Laporan Baru
        </button>
      </div>
    </div>
  );
}
