import React from "react";

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Laporan
          </p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            {stats.total}
          </h3>
        </div>
        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
          <i className="fa-solid fa-file-invoice text-xl"></i>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Kondisi OK
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {stats.ok}
          </h3>
        </div>
        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
          <i className="fa-solid fa-circle-check text-xl"></i>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Butuh Perbaikan
          </p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">
            {stats.perbaikan}
          </h3>
        </div>
        <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
          <i className="fa-solid fa-wrench text-xl"></i>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Ada Kendala
          </p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">
            {stats.kendala}
          </h3>
        </div>
        <div className="bg-rose-50 text-rose-600 p-3 rounded-xl">
          <i className="fa-solid fa-triangle-exclamation text-xl"></i>
        </div>
      </div>
    </div>
  );
}
