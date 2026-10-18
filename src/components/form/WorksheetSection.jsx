import React from "react";

export default function WorksheetSection({ rows, setRows }) {
  const addRow = () =>
    setRows([...rows, { aktivitas: "", durasi: "", hasil: "" }]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));
  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
      <div className="flex justify-between items-center border-b pb-2 border-slate-100">
        <h3 className="font-bold text-slate-800 text-md flex items-center">
          <i className="fa-solid fa-business-time text-blue-600 mr-2"></i>{" "}
          Worksheet (Rincian Aktivitas)
        </h3>
        <button
          type="button"
          onClick={addRow}
          className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-lg transition flex items-center"
        >
          <i className="fa-solid fa-plus mr-1"></i> Tambah Aktivitas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="p-3 w-1/2">Uraian Rincian Aktivitas</th>
              <th className="p-3 w-1/4">Durasi</th>
              <th className="p-3 w-1/4">Keterangan / Hasil</th>
              <th className="p-3 w-12 text-center">Hapus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.aktivitas}
                    onChange={(e) =>
                      updateRow(index, "aktivitas", e.target.value)
                    }
                    placeholder="Uraian pekerjaan..."
                    required
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.durasi}
                    onChange={(e) => updateRow(index, "durasi", e.target.value)}
                    placeholder="cth: 1 Jam"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={row.hasil}
                    onChange={(e) => updateRow(index, "hasil", e.target.value)}
                    placeholder="cth: Selesai"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
