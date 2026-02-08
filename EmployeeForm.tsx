
import React, { useState, useEffect, useRef } from 'react';
import { Employee } from '../types';
import { Camera, X, Save, UserCheck, Phone, Briefcase, Award, Upload, RefreshCw, Check, Image as ImageIcon } from 'lucide-react';

interface EmployeeFormProps {
  employee?: Employee;
  onSave: (employee: Employee) => void;
  onClose: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    employeeId: '',
    profession: '',
    category: '',
    phone: '',
    imageUrl: '',
  });

  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (employee) setFormData(employee);
  }, [employee]);

  // Handle Camera Stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode } 
      }).then(s => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      }).catch(err => {
        console.error("Camera error:", err);
        setIsCameraActive(false);
        alert("لا يمكن الوصول للكاميرا");
      });
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isCameraActive, facingMode]);

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        setIsCameraActive(false);
        setShowImageOptions(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        setShowImageOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmployee: Employee = {
      id: employee?.id || Date.now().toString(),
      name: formData.name || '',
      employeeId: formData.employeeId || `XC3-${Math.floor(1000 + Math.random() * 9000)}`,
      profession: formData.profession || '',
      category: formData.category || '',
      phone: formData.phone || '',
      imageUrl: formData.imageUrl,
      createdAt: employee?.createdAt || Date.now(),
    };
    onSave(newEmployee);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500 border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header - Fixed */}
        <div className="bg-slate-50 px-8 py-6 border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{employee ? 'تحديث الموظف' : 'تسجيل موظف جديد'}</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">XC3 Personnel Unit v3.1</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-2xl text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form id="employee-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Image Selection Area */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div 
                  onClick={() => setShowImageOptions(!showImageOptions)}
                  className="w-36 h-36 bg-slate-100 rounded-[2.5rem] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl transition-all hover:scale-105 cursor-pointer relative"
                >
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon size={32} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">اضغط للإضافة</span>
                    </div>
                  )}
                  
                  {/* Overlay for options */}
                  {showImageOptions && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20 p-2 animate-in fade-in scale-in">
                       <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsCameraActive(true); setShowImageOptions(false); }}
                        className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
                       >
                         <Camera size={14} /> الكاميرا
                       </button>
                       <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="w-full py-2 bg-white text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100"
                       >
                         <Upload size={14} /> ملف
                       </button>
                       <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowImageOptions(false); }}
                        className="text-white/50 hover:text-white transition-colors"
                       >
                         <X size={16} />
                       </button>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white border-4 border-white shadow-lg">
                   <Camera size={18} />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Live Camera Interface */}
              {isCameraActive && (
                <div className="mt-6 w-full max-w-sm bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-2xl border-4 border-white animate-in zoom-in">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                  <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-between items-center">
                    <button 
                      type="button"
                      onClick={() => setIsCameraActive(false)}
                      className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30"
                    >
                      <X size={20} />
                    </button>
                    <button 
                      type="button"
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                    </button>
                    <button 
                      type="button"
                      onClick={toggleCameraFacing}
                      className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30"
                      title="تبديل الكاميرا"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">الاسم الرباعي الكامل</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <UserCheck size={20} />
                  </div>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                    placeholder="أدخل الاسم بوضوح"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">المعرف الوظيفي</label>
                <input
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-mono font-bold text-slate-600"
                  placeholder="توليد تلقائي..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">المسمى الوظيفي</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <Briefcase size={20} />
                  </div>
                  <input
                    name="profession"
                    required
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                    placeholder="مثال: مدير تقني"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">التصنيف / الفئة</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <Award size={20} />
                  </div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all appearance-none font-bold text-slate-700"
                    required
                  >
                    <option value="">اختر الفئة</option>
                    <option value="الفئة الأولى">الفئة الأولى</option>
                    <option value="الفئة الثانية">الفئة الثانية</option>
                    <option value="الفئة الثالثة">الفئة الثالثة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">رقم الهاتف الجوال</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <Phone size={20} />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                    placeholder="05xxxxxxxx"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="p-8 bg-slate-50 border-t flex gap-4 shrink-0">
          <button
            form="employee-form"
            type="submit"
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
          >
            <Check size={20} />
            {employee ? 'تحديث البيانات' : 'إتمام التسجيل'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default EmployeeForm;
