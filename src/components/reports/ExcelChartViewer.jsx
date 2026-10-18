import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const ExcelChartViewer = ({ onDataParsed }) => {
  const [chartData, setChartData] = useState([]);
  const [keys, setKeys] = useState([]);
  const [xAxisKey, setXAxisKey] = useState('');
  const [dataKey, setDataKey] = useState('');
  const [chartType, setChartType] = useState('bar');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        setKeys(headers);
        setXAxisKey(headers[0]); // Sumbu X default kolom pertama
        setDataKey(headers[1] || headers[0]); // Sumbu Y default kolom kedua
        setChartData(data);
        if (onDataParsed) onDataParsed(data, file);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-4">
      <h3 className="font-semibold text-slate-800 mb-3">📊 Import File Excel / CSV & Generate Grafik</h3>
      
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        onChange={handleFileUpload}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
      />

      {chartData.length > 0 && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sumbu X (Kategori/Tanggal):</label>
              <select value={xAxisKey} onChange={(e) => setXAxisKey(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                {keys.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sumbu Y (Nilai/Jumlah):</label>
              <select value={dataKey} onChange={(e) => setDataKey(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                {keys.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipe Grafik:</label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                <option value="bar">Grafik Batang (Bar)</option>
                <option value="line">Grafik Garis (Line)</option>
              </select>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <XAxis dataKey={xAxisKey} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={dataKey} fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <XAxis dataKey={xAxisKey} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={dataKey} stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelChartViewer;