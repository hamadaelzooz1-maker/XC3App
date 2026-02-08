
import React, { useState, useMemo, useRef } from 'react';
import { Employee } from '../types';
import { 
  Plus, Search, Users, Briefcase, Phone, MessageSquare, 
  Printer, FileDown, Edit, Trash2, LogOut, Download, Camera, Mic, MicOff, Database, UserPlus
} from 'lucide-react';
import { deleteEmployee, addEmployee, updateEmployee } from '../utils/storage';
import { exportToCSV, exportToDoc } from '../utils/export';
import EmployeeForm from './EmployeeForm';
import HandwritingOCR from './HandwritingOCR';

interface DashboardProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, setEmployees, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showOCR, setShowOCR] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return employees;
    
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term) ||
      emp.phone.includes(term)
    );
  }, [employees, searchTerm]);

  const handleSave = (employee: Employee) => {
    if (editingEmployee) {
      updateEmployee(employee);
      setEmployees(prev => prev.map(e => e.id === employee.id ? employee : e));
    } else {
      addEmployee(employee);
      setEmployees(prev => [...prev, employee]);
    }
    setShowForm(false);
    setEditingEmployee(undefined);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      deleteEmployee(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("متصفحك لا يدعم البحث الصوتي.");

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setSearchTerm(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md text-white shadow-2xl sticky top-0 z-40 no-print border-b border-blue-500/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">XC3 <span className="text-blue-400 font-light">HR</span></h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Enterprise Core Alpha</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-4 border-r border-white/5 pr-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase">الحساب النشط</span>
                <span className="text-sm font-bold text-blue-400">المسؤول الرئيسي</span>
             </div>
             <button 
                onClick={onLogout}
                className="group flex items-center gap-2 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2.5 rounded-xl transition-all font-bold text-sm border border-red-500/10"
              >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>خروج آمن</span>
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        {/* Quick Action Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 no-print">
          <StatCard icon={<Users className="text-blue-400" />} label="إجمالي الكادر" value={employees.length} color="blue" />
          <StatCard icon={<Database className="text-indigo-400" />} label="حالة السيرفر" value={employees.length > 0 ? "نشط" : "خامل"} color="indigo" />
          <StatCard icon={<Phone className="text-emerald-400" />} label="سجلات الاتصال" value={employees.filter(e => e.phone).length} color="emerald" />
          
          <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-4 shadow-xl flex flex-col justify-center gap-3">
             <button 
               onClick={() => { setEditingEmployee(undefined); setShowForm(true); }}
               className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-500 hover:shadow-xl active:scale-[0.97] transition-all"
             >
               <UserPlus size={20} />
               إضافة موظف
             </button>
             <button 
               onClick={() => setShowOCR(true)}
               className="w-full bg-white/5 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-white/10 hover:shadow-xl active:scale-[0.97] transition-all border border-white/10"
             >
               <Camera size={20} className="text-blue-400" />
               تحويل خط اليد (AI)
             </button>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="glass rounded-[2.5rem] p-5 mb-8 flex flex-col lg:flex-row items-center justify-between gap-6 no-print shadow-2xl">
          <div className="relative w-full lg:w-[450px] flex items-center gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="text"
                placeholder="ابحث بالاسم، الرقم الوظيفي، أو الهاتف..."
                className="w-full pr-12 pl-4 py-4 bg-slate-950/50 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-white placeholder-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={toggleVoiceSearch}
              className={`p-4 rounded-2xl transition-all shadow-lg ${isListening ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
              title="بحث صوتي ذكي"
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
             <button onClick={() => exportToCSV(employees)} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 transition-all text-sm font-black border border-white/5 shadow-lg">
               <Download size={18} className="text-emerald-400" /> Excel
             </button>
             <button onClick={() => exportToDoc(employees)} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 transition-all text-sm font-black border border-white/5 shadow-lg">
               <FileDown size={18} className="text-blue-400" /> Word
             </button>
             <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all text-sm font-black shadow-lg shadow-blue-500/20">
               <Printer size={18} /> طباعة / PDF
             </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-slate-500 font-black uppercase tracking-widest text-xs">الموظف</th>
                  <th className="px-8 py-5 text-slate-500 font-black uppercase tracking-widest text-xs">المعرف</th>
                  <th className="px-8 py-5 text-slate-500 font-black uppercase tracking-widest text-xs">المهنة</th>
                  <th className="px-8 py-5 text-slate-500 font-black uppercase tracking-widest text-xs">الفئة</th>
                  <th className="px-8 py-5 text-slate-500 font-black uppercase tracking-widest text-xs">التواصل</th>
                  <th className="px-8 py-5 text-slate-500 font-black uppercase tracking-widest text-xs no-print text-center">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 overflow-hidden shadow-inner flex-shrink-0 border border-white/10 group-hover:border-blue-500/50 transition-colors">
                            {emp.imageUrl ? (
                              <img src={emp.imageUrl} alt={emp.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600 font-black text-xl">
                                {emp.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="font-bold text-slate-200 text-lg">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-slate-400 font-mono text-sm tracking-tighter">
                        <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-white/5">#{emp.employeeId}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-slate-300 font-bold">{emp.profession}</span>
                      </td>
                      <td className="px-8 py-5">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            emp.category.includes('الأولى') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            emp.category.includes('الثانية') ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                         }`}>
                           {emp.category}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <a href={`tel:${emp.phone}`} className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20">
                            <Phone size={16} />
                          </a>
                          <a 
                            href={`https://wa.me/${emp.phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/20"
                          >
                            <MessageSquare size={16} />
                          </a>
                        </div>
                      </td>
                      <td className="px-8 py-5 no-print">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                          <button 
                            onClick={() => { setEditingEmployee(emp); setShowForm(true); }}
                            className="p-3 bg-slate-800 border border-white/5 text-blue-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(emp.id)}
                            className="p-3 bg-slate-800 border border-white/5 text-red-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
                           <Database size={48} className="text-slate-700" />
                        </div>
                        <h3 className="text-xl font-black text-slate-300 mb-2">النظام فارغ</h3>
                        <p className="text-slate-500 text-sm">لم يتم العثور على سجلات تطابق استعلامك الحالي</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showForm && (
        <EmployeeForm 
          employee={editingEmployee}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingEmployee(undefined); }}
        />
      )}

      {showOCR && (
        <HandwritingOCR onClose={() => setShowOCR(false)} />
      )}
      
      {/* Footer Print Only */}
      <footer className="hidden print:block fixed bottom-0 left-0 right-0 p-10 border-t text-center text-slate-400 italic">
        تم استخراج هذا التقرير آلياً عبر نظام XC3 Enterprise - {new Date().toLocaleString('ar-EG')}
      </footer>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: any; color: string }> = ({ icon, label, value, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  
  return (
    <div className="tech-card bg-slate-900 p-6 shadow-2xl border border-white/5 flex items-center gap-5">
      <div className={`p-4 rounded-2xl border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-white leading-none tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
