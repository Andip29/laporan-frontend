import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      // API ini sudah dilindungi authMiddleware sehingga hanya mengembalikan laporan milik user yang sedang login
      const resReports = await axios.get(`${API_BASE}/reports`);
      const allPhotos = [];

      resReports.data.forEach((r) => {
        if (r.image_urls) {
          r.image_urls.forEach((url) =>
            allPhotos.push({
              id: `report-${r.id}-${url}`,
              url,
              source: `Laporan #${r.id} (${r.submitted_by})`,
              date: r.created_at,
            }),
          );
        }
      });

      setPhotos(allPhotos);
    } catch (e) {
      console.error("Gagal mengambil galeri foto:", e);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("photos", f));

    setUploading(true);
    try {
      const resUpload = await axios.post(`${API_BASE}/upload`, formData);

      const newPhotoObjects = resUpload.data.imageUrls.map((url) => ({
        id: `upload-${Date.now()}-${url}`,
        url,
        source: "Upload Langsung Galeri",
        date: new Date().toISOString(),
      }));

      setPhotos((prev) => [...newPhotoObjects, ...prev]);
      alert("Foto dokumentasi berhasil diunggah!");
    } catch (err) {
      alert("Gagal mengunggah foto. Pastikan server backend aktif!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-images text-blue-600 mr-2.5"></i> Galeri
            Foto Dokumentasi Pekerjaan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Unggah, simpan, dan kelola foto-foto dokumentasi bukti pengerjaan
            Anda.
          </p>
        </div>

        <label className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-xl cursor-pointer transition shadow-md shadow-blue-200 flex items-center font-semibold">
          <i className="fa-solid fa-cloud-arrow-up mr-2"></i>{" "}
          {uploading ? "Mengunggah..." : "Upload Foto Baru"}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center">
          <i className="fa-regular fa-image text-4xl text-slate-300 mb-3 block"></i>
          <p className="text-slate-500 font-medium text-sm">
            Belum ada foto tersimpan untuk akun Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition group flex flex-col justify-between"
            >
              <div
                onClick={() => setSelectedPhoto(p)}
                className="h-48 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer relative"
              >
                <img
                  src={`http://localhost:5000${p.url}`}
                  alt="dokumentasi"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-3 text-xs border-t border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <p className="font-semibold text-slate-700 truncate max-w-[180px]">
                    {p.source}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(p.date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
