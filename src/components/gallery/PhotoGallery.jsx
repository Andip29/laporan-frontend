import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = "https://laporan-backend-seven.vercel.app";
const API_BASE = `${BACKEND_URL}/api`;

export default function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const auth = getAuthHeader();
      const allPhotos = [];

      // 1. Ambil foto dari Laporan
      try {
        const resReports = await axios.get(`${API_BASE}/reports`, auth);
        resReports.data.forEach((r) => {
          if (r.image_urls) {
            const urls =
              typeof r.image_urls === "string"
                ? JSON.parse(r.image_urls)
                : r.image_urls;
            if (Array.isArray(urls)) {
              urls.forEach((url) =>
                allPhotos.push({
                  id: `report-${r.id}-${url}`,
                  url,
                  source: `Laporan #${r.id} (${r.submitted_by || "User"})`,
                  date: r.created_at,
                }),
              );
            }
          }
        });
      } catch (err) {
        console.error("Gagal mengambil laporan foto:", err);
      }

      // 2. Ambil foto galeri tersimpan dari Database
      try {
        const resGaleri = await axios.get(`${API_BASE}/upload`, auth);
        if (Array.isArray(resGaleri.data)) {
          resGaleri.data.forEach((g) => {
            allPhotos.push({
              id: `galeri-${g.id}`,
              url: g.file_url,
              source: `Foto Upload (${g.original_name || "Dokumentasi"})`,
              date: g.created_at,
            });
          });
        }
      } catch (err) {
        console.error("Gagal mengambil galeri tersimpan:", err);
      }

      // Urutkan foto dari yang terbaru
      allPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));
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
      const config = {
        headers: {
          ...getAuthHeader().headers,
          "Content-Type": "multipart/form-data",
        },
      };

      await axios.post(`${API_BASE}/upload`, formData, config);
      alert("Foto dokumentasi berhasil diunggah dan disimpan!");

      // Refresh ulang data agar foto baru muncul & tersimpan permanen
      fetchPhotos();
    } catch (err) {
      console.error("Error upload:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Gagal mengunggah foto.");
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
                  src={
                    p.url?.startsWith("http") || p.url?.startsWith("data:")
                      ? p.url
                      : `${BACKEND_URL}${p.url}`
                  }
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
                    {p.date
                      ? new Date(p.date).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(p)}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                >
                  Lihat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Preview Foto untuk Membuka & Melihat Foto Lengkap */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">{selectedPhoto.source}</h3>
                <p className="text-xs text-slate-400">
                  {selectedPhoto.date
                    ? new Date(selectedPhoto.date).toLocaleString("id-ID")
                    : ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-white text-xl font-bold px-3 py-1"
              >
                ✕
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-slate-950 max-h-[80vh] overflow-auto">
              <img
                src={
                  selectedPhoto.url?.startsWith("http") ||
                  selectedPhoto.url?.startsWith("data:")
                    ? selectedPhoto.url
                    : `${BACKEND_URL}${selectedPhoto.url}`
                }
                alt="preview"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
