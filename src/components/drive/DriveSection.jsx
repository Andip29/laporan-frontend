import React, { useState, useEffect } from "react";
import axios from "axios";

// Pastikan Menggunakan URL Vercel Backend yang valid
const BACKEND_URL = "https://laporan-backend-seven.vercel.app";
const API_BASE = `${BACKEND_URL}/api`;

export default function DriveSection() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/drive`, getAuthHeader());
      setFiles(res.data);
    } catch (e) {
      console.error("Gagal mengambil file drive:", e);
      setFiles([]);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesi login tidak ditemukan. Silakan Logout lalu Login kembali!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    try {
      await axios.post(`${API_BASE}/drive`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("File berhasil disimpan ke Drive Pribadi Anda!");
      fetchFiles();
    } catch (err) {
      console.error("Upload error detail:", err.response?.data || err.message);
      const serverMessage =
        err.response?.data?.error || err.message || "Gagal mengunggah file.";
      alert("Gagal mengunggah file: " + serverMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus file ini dari Drive Anda?")) return;
    try {
      await axios.delete(`${API_BASE}/drive/${id}`, getAuthHeader());
      fetchFiles();
    } catch (err) {
      alert("Gagal menghapus file.");
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <i className="fa-solid fa-cloud-arrow-up text-blue-600 mr-2.5"></i>{" "}
            Drive Berkas Pribadi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Simpan dan kelola berkas pribadi Anda. File hanya dapat dilihat oleh
            akun Anda.
          </p>
        </div>
        <label className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-xl cursor-pointer transition shadow-md shadow-blue-200 flex items-center font-medium">
          <i className="fa-solid fa-plus mr-2"></i>{" "}
          {uploading ? "Mengunggah..." : "Upload File Laptop"}
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">
            Daftar Berkas Tersimpan
          </h3>
          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold">
            {files.length} Berkas
          </span>
        </div>

        {files.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fa-solid fa-folder-open text-4xl text-slate-300 mb-3 block"></i>
            <p className="text-slate-500 font-medium text-sm">
              Belum ada file tersimpan di Drive Anda.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Klik tombol 'Upload File Laptop' untuk menyimpan dokumen pribadi
              Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Nama Berkas</th>
                  <th className="px-6 py-3.5">Ukuran</th>
                  <th className="px-6 py-3.5">Tanggal Disimpan</th>
                  <th className="px-6 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-700 flex items-center">
                      <i className="fa-solid fa-file-lines text-blue-500 mr-3 text-lg"></i>
                      {f.original_name}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatBytes(f.file_size)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(f.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <a
                        href={
                          f.file_url?.startsWith("http")
                            ? f.file_url
                            : `${BACKEND_URL}${f.file_url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center"
                      >
                        <i className="fa-solid fa-download mr-1"></i> Download
                      </a>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center"
                      >
                        <i className="fa-solid fa-trash-can mr-1"></i> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
