
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Wand2, Loader2, Download, Table as TableIcon, Sparkles, RefreshCcw, FileText, LayoutList, Printer } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface HandwritingOCRProps {
  onClose: () => void;
}

const HandwritingOCR: React.FC<HandwritingOCRProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any[] | null>(null);
  const [tableTitle, setTableTitle] = useState("تقرير البيانات المستخرجة");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError("خطأ في الوصول إلى الكاميرا. تحقق من الأذونات.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        setCapturedImage(canvasRef.current.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const processImage = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    setError(null);
    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = capturedImage.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: "تحويل هذه البيانات المكتوبة بخط اليد إلى جدول JSON منظم باللغة العربية. ابحث عن أعمدة مثل (الاسم، المهنة، الرقم الوظيفي، رقم الهاتف، الفئة، إلخ). قم بتنظيمها في مصفوفة من الكائنات. أرجع JSON فقط بدون أي نص إضافي." }
          ]
        }],
        config: { responseMimeType: "application/json" }
      });
      // Correctly access .text property from GenerateContentResponse (not a method)
      const text = response.text;
      if (!text) throw new Error("No response text received from AI");
      const parsed = JSON.parse(text.trim());
      setOcrResult(Array.isArray(parsed) ? parsed : [parsed]);
    } catch (err) {
      console.error(err);
      setError("فشل التحليل الذكي. تأكد من وضوح الصورة وتوزيع البيانات.");
    } finally {
      setIsProcessing(false);
    }
  };

  const exportExcel = () => {
    if (!ocrResult) return;
    const headers = Object.keys(ocrResult[0]);
    const rows = ocrResult.map(row => headers.map(h => row[h]));
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tableTitle}.csv`;
    link.click();
  };

  const exportWord = () => {
    if (!ocrResult) return;
    const headers = Object.keys(ocrResult[0]);
    const html = `
      <html dir="rtl"><head><meta charset="utf-8"></head><body style="font-family: Arial;">
        <h1 style="text-align: center;">${tableTitle}</h1>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <thead style="background: #f2f2f2;">
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${ocrResult.map(row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body></html>
    `;
    const blob = new Blob([html], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tableTitle}.doc`;
    link.click();
  };

  const reset = () => {
    setCapturedImage(null);
    setOcrResult(null);
    setError(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4 md:p-10 animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-[3rem] w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl relative border border-white/5">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">الماسح الذكي XC3</h2>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">AI Table Digitization Unit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {!capturedImage && !ocrResult && (
            <div className="relative h-[60vh] rounded-[2.5rem] overflow-hidden bg-black flex items-center justify-center border-4 border-white/5 shadow-2xl group">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none border-[15px] border-white/5"></div>
              
              <button 
                onClick={capturePhoto}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 transition-transform hover:scale-110 active:scale-90"
              >
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-blue-600 animate-pulse"></div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {capturedImage && !ocrResult && (
            <div className="flex flex-col items-center justify-center h-full gap-8 animate-in zoom-in duration-300">
              <div className="relative group">
                <img src={capturedImage} className="max-h-[50vh] rounded-[2rem] shadow-2xl border-4 border-white/5" alt="Captured" />
                {isProcessing && (
                   <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px] rounded-[1.5rem] flex items-center justify-center">
                      <div className="bg-slate-900/95 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 border border-blue-500/30">
                         <Loader2 size={48} className="text-blue-500 animate-spin" />
                         <span className="font-black text-white tracking-tighter text-lg">تحليل البيانات الرقمية...</span>
                      </div>
                   </div>
                )}
              </div>
              <div className="flex gap-4 w-full max-w-lg">
                <button 
                  onClick={processImage} 
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-xl shadow-blue-500/30"
                >
                  <Wand2 size={24} />
                  بدء المعالجة بالذكاء الاصطناعي
                </button>
                <button 
                  onClick={reset}
                  disabled={isProcessing}
                  className="px-8 py-5 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all border border-white/5"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {ocrResult && (
            <div className="animate-in slide-in-from-bottom-10 duration-500 max-w-5xl mx-auto space-y-8">
              {/* Title Input */}
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 flex items-center gap-4">
                <LayoutList className="text-blue-400" />
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-500 font-black uppercase mb-1 mr-1">عنوان الملف / الجدول</label>
                  <input 
                    type="text" 
                    value={tableTitle}
                    onChange={(e) => setTableTitle(e.target.value)}
                    className="bg-transparent text-xl font-black text-white w-full border-none focus:ring-0 outline-none p-0"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-slate-800/30 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        {Object.keys(ocrResult[0]).map(h => (
                          <th key={h} className="px-8 py-5 text-slate-500 font-black uppercase tracking-widest text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {ocrResult.map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-all">
                          {Object.values(row).map((v: any, j) => (
                            <td key={j} className="px-8 py-5 text-slate-300 font-bold">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Export Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={exportExcel} className="flex items-center justify-center gap-3 py-5 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-2xl font-black hover:bg-emerald-600 hover:text-white transition-all">
                  <Download size={24} /> حفظ كـ Excel
                </button>
                <button onClick={exportWord} className="flex items-center justify-center gap-3 py-5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all">
                  <FileText size={24} /> حفظ كـ Word
                </button>
                {/* Fixed: Printer is now imported from lucide-react */}
                <button onClick={() => window.print()} className="flex items-center justify-center gap-3 py-5 bg-white/10 text-white border border-white/10 rounded-2xl font-black hover:bg-white hover:text-black transition-all">
                  <Printer size={24} /> طباعة / PDF
                </button>
              </div>

              <div className="flex justify-center pt-6">
                <button onClick={reset} className="flex items-center gap-3 px-10 py-4 text-slate-500 hover:text-white font-bold transition-all">
                  <RefreshCcw size={20} /> مسح صفحة أخرى
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-8 bg-red-500/5 text-red-400 rounded-[2rem] border border-red-500/10 text-center font-black animate-in shake duration-300">
              {error}
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default HandwritingOCR;
