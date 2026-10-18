import React from "react";

export default function ReportTable({ reports, onExportPdf }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Riwayat Laporan Pekerjaan</h3>
        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
          {reports.length} Laporan
        </span>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <i className="fa-regular fa-folder-open text-2xl"></i>
          </div>
          <p className="text-slate-500 font-medium">Belum ada data laporan.</p>
          <p className="text-xs text-slate-400 mt-1">
            Klik 'Buat Laporan Baru' untuk menambahkan.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Tanggal</th>
                <th className="px-6 py-3.5">Nama Petugas</th>
                <th className="px-6 py-3.5">Jenis Pekerjaan</th>
                <th className="px-6 py-3.5">Status Storage</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {r.form_data?.tanggal || r.created_at?.split("T")[0]}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {r.submitted_by}
                  </td>
                  <td className="px-6 py-4">
                    {r.form_data?.jenisPekerjaan || "Laporan Umum"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      Tersimpan MySQL
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onExportPdf(r)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center"
                    >
                      <i className="fa-solid fa-file-pdf mr-1.5 text-rose-500"></i>{" "}
                      Cetak PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
