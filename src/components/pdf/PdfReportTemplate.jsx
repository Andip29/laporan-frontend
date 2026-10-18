import React from "react";

export default function PdfReportTemplate({ reports }) {
  return (
    <>
      {reports.map((r) => (
        <div
          key={r.id}
          id={`pdf-report-${r.id}`}
          style={{ display: "none" }}
          className="p-8 bg-white text-slate-800 text-xs"
        >
          <div className="border-b-2 border-blue-600 pb-3 mb-5 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-blue-900 uppercase">
                LAPORAN PEKERJAAN HARIAN
              </h1>
              <p className="text-[11px] text-slate-500">
                Dokumen Laporan Resmi Pengecekan & Aktivitas Harian
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-600">
                REF: LAP-{r.id}
              </p>
              <p className="text-[10px] text-slate-400">
                Printed: {new Date().toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>

          <table className="w-full mb-5 text-[11px] bg-slate-50 rounded-lg p-3 border border-slate-200">
            <tbody>
              <tr>
                <td className="w-[15%] font-bold p-1">Tanggal</td>
                <td className="w-[35%] p-1">: {r.form_data?.tanggal || "-"}</td>
                <td className="w-[18%] font-bold p-1">Nama Petugas</td>
                <td className="w-[32%] p-1">: {r.submitted_by || "-"}</td>
              </tr>
              <tr>
                <td className="font-bold p-1">Pekerjaan</td>
                <td className="p-1">: {r.form_data?.jenisPekerjaan || "-"}</td>
                <td className="font-bold p-1">Status Storage</td>
                <td className="p-1">: Tersimpan MySQL</td>
              </tr>
            </tbody>
          </table>

          <h3 className="font-bold text-xs mb-2 text-slate-800 border-b pb-1">
            I. HASIL PENGECEKAN (CEKLIS)
          </h3>
          <table className="w-full mb-4 border-collapse border border-slate-300 text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-300 p-2 w-[5%]">No</th>
                <th className="border border-slate-300 p-2 w-[40%]">
                  Item Pengecekan
                </th>
                <th className="border border-slate-300 p-2 w-[20%]">Status</th>
                <th className="border border-slate-300 p-2 w-[35%]">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {(r.form_data?.ceklis || []).map((c, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-300 p-2 text-center">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 p-2">{c.item}</td>
                  <td className="border border-slate-300 p-2 font-semibold">
                    {c.status}
                  </td>
                  <td className="border border-slate-300 p-2">
                    {c.catatan || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-bold text-xs mb-2 text-slate-800 border-b pb-1 mt-4">
            II. RINCIAN AKTIVITAS WORKSHEET
          </h3>
          <table className="w-full mb-4 border-collapse border border-slate-300 text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-300 p-2 w-[5%]">No</th>
                <th className="border border-slate-300 p-2 w-[55%]">
                  Uraian Aktivitas
                </th>
                <th className="border border-slate-300 p-2 w-[15%]">Durasi</th>
                <th className="border border-slate-300 p-2 w-[25%]">Hasil</th>
              </tr>
            </thead>
            <tbody>
              {(r.form_data?.worksheet || []).map((w, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-300 p-2 text-center">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 p-2">{w.aktivitas}</td>
                  <td className="border border-slate-300 p-2">{w.durasi}</td>
                  <td className="border border-slate-300 p-2">
                    {w.hasil || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {r.image_urls?.length > 0 && (
            <>
              <h3 className="font-bold text-xs mb-2 text-slate-800 border-b pb-1 mt-4">
                III. DOKUMENTASI FOTO PEKERJAAN
              </h3>
              <div className="flex gap-4 mt-2">
                {r.image_urls.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex-1 text-center border border-slate-300 rounded p-2"
                  >
                    <img
                      src={`http://localhost:5000${url}`}
                      alt="foto"
                      className="max-h-40 mx-auto object-contain rounded"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-8 flex justify-between">
            <div className="text-center w-48">
              <p className="text-[10px] text-slate-500">Dibuat Oleh,</p>
              <div className="h-12"></div>
              <p className="font-bold text-xs border-b border-slate-700 pb-1">
                ({r.submitted_by})
              </p>
              <p className="text-[9px] text-slate-500 mt-1">
                Teknisi / Petugas Lapangan
              </p>
            </div>
            <div className="text-center w-48">
              <p className="text-[10px] text-slate-500">Disetujui Oleh,</p>
              <div className="h-12"></div>
              <p className="font-bold text-xs border-b border-slate-700 pb-1">
                ( Supervisor / Lead )
              </p>
              <p className="text-[9px] text-slate-500 mt-1">Penanggung Jawab</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
