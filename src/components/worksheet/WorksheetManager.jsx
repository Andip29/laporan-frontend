import React, { useState } from "react";

export default function WorksheetManager() {
  // 1. Ambil data user yang sedang login dari LocalStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const storageKey = `worksheet_tasks_user_${currentUser.id || "default"}`;

  // 2. Ambil data khusus user tersebut dari LocalStorage (jika kosong, mulai dari array [])
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // 3. Simpan otomatis ke LocalStorage khusus user ini setiap kali ada perubahan tugas
  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, storageKey]);

  // Form State
  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [durasi, setDurasi] = useState("");
  const [prioritas, setPrioritas] = useState("Sedang");
  const [detail, setDetail] = useState("");

  // Selected Task for Detail Modal
  const [selectedTask, setSelectedTask] = useState(null);

  // Calendar State (Bulan & Tahun saat ini)
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!judul) return;

    const newTask = {
      id: Date.now(),
      judul,
      tanggal,
      durasi: durasi || "1 Jam",
      prioritas,
      status: "Belum Dimulai",
      detail: detail || "Tidak ada detail tambahan.",
    };

    setTasks([...tasks, newTask]);
    setJudul("");
    setDurasi("");
    setDetail("");
  };

  const toggleStatus = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "Selesai" ? "Sedang Dikerjakan" : "Selesai",
            }
          : t,
      ),
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  // Helper fungsi untuk membuat grid tanggal kalender
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center mb-1">
          <i className="fa-solid fa-calendar-check text-blue-600 mr-2.5"></i>{" "}
          Worksheet & Kalender Kegiatan
        </h2>
        <p className="text-xs text-slate-500">
          Kelola rincian tugas harian, atur jadwal pada kalender interaktif, dan
          pantau detail pelaksanaan pekerjaan.
        </p>
      </div>

      {/* Form Tambah Tugas Baru */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center">
          <i className="fa-solid fa-plus-circle text-blue-600 mr-2"></i> Tambah
          Tugas Worksheet Baru
        </h3>

        <form onSubmit={handleAddTask} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Judul / Nama Pekerjaan *"
              className="md:col-span-2 bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              value={durasi}
              onChange={(e) => setDurasi(e.target.value)}
              placeholder="Estimasi Durasi (cth: 2 Jam)"
              className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={prioritas}
              onChange={(e) => setPrioritas(e.target.value)}
              className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="Rendah">Prioritas Rendah</option>
              <option value="Sedang">Prioritas Sedang</option>
              <option value="Tinggi">Prioritas Tinggi</option>
            </select>

            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Catatan rincian / instruksi pengerjaan..."
              className="md:col-span-2 bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-xl font-semibold shadow-md shadow-blue-200 transition flex items-center justify-center"
            >
              <i className="fa-solid fa-plus mr-1.5"></i> Simpan ke Worksheet
            </button>
          </div>
        </form>
      </div>

      {/* Grid 2 Kolom: Kalender & Daftar Tugas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Kolom Kiri: Kalender Kegiatan (7 Kolom) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-calendar-days text-blue-600"></i>
              <h3 className="font-bold text-slate-800 text-sm">
                Kalender {monthNames[month]} {year}
              </h3>
            </div>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-xs"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-xs"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Grid Nama Hari */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <div>Min</div>
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div>Sab</div>
          </div>

          {/* Grid Tanggal Kalender */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Slot Kosong Sebelum Tanggal 1 */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-20 bg-slate-50/50 rounded-xl"
              ></div>
            ))}

            {/* Tanggal Bulan Ini */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const dayTasks = tasks.filter((t) => t.tanggal === dateStr);

              return (
                <div
                  key={dayNum}
                  className="h-20 border border-slate-100 rounded-xl p-1.5 flex flex-col justify-between hover:border-blue-300 transition bg-white"
                >
                  <span className="font-bold text-[11px] text-slate-600">
                    {dayNum}
                  </span>
                  <div className="space-y-1 overflow-y-auto max-h-12">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className={`text-[9px] p-1 rounded font-medium cursor-pointer truncate ${
                          t.status === "Selesai"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }`}
                        title={t.judul}
                      >
                        • {t.judul}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Daftar Tabel Tugas (5 Kolom) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">
              Daftar Kegiatan
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
              {tasks.length} Kegiatan
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[420px] flex-1">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada tugas di worksheet.
              </div>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 hover:bg-slate-50 transition flex items-start justify-between gap-2"
                >
                  <div className="flex items-start space-x-3">
                    <button
                      type="button"
                      onClick={() => toggleStatus(t.id)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center border mt-0.5 ${
                        t.status === "Selesai"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 text-transparent"
                      }`}
                    >
                      <i className="fa-solid fa-check text-[10px]"></i>
                    </button>
                    <div>
                      <h4
                        onClick={() => setSelectedTask(t)}
                        className={`text-xs font-bold cursor-pointer hover:text-blue-600 ${
                          t.status === "Selesai"
                            ? "line-through text-slate-400"
                            : "text-slate-800"
                        }`}
                      >
                        {t.judul}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        <i className="fa-regular fa-calendar mr-1"></i>{" "}
                        {t.tanggal} | Durasi: {t.durasi}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTask(t)}
                      className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-lg font-medium"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(t.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL DETAIL KEGIATAN */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center">
                <i className="fa-solid fa-circle-info mr-2"></i> Detail Rincian
                Kegiatan
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-blue-200 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Judul Pekerjaan
                </p>
                <h4 className="text-base font-bold text-slate-800 mt-0.5">
                  {selectedTask.judul}
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Tanggal
                  </p>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {selectedTask.tanggal}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Durasi
                  </p>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {selectedTask.durasi}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Prioritas
                  </p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800">
                    {selectedTask.prioritas}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Status Pelaksanaan
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                    selectedTask.status === "Selesai"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedTask.status}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Rincian & Catatan Pekerjaan
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 leading-relaxed min-h-[80px]">
                  {selectedTask.detail}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => toggleStatus(selectedTask.id)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition"
              >
                Ubah Status ke{" "}
                {selectedTask.status === "Selesai"
                  ? "Sedang Dikerjakan"
                  : "Selesai"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
