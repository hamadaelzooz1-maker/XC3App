
import React, { useState, useEffect, useRef } from 'react';
import { Lock, User, ShieldCheck, Users } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username] = useState('XC3');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'XC3' && password === 'A11a9') {
      onLogin();
    } else {
      setError('خطأ في كلمة المرور');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] p-4 relative overflow-hidden">
      {/* Background Tech Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex flex-col items-center mb-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center relative shadow-xl border border-white/20">
                  <Users size={42} className="text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-black text-white tracking-wider mb-2">XC3</h1>
              <div className="h-1 w-12 bg-blue-500 rounded-full mb-3"></div>
              <p className="text-slate-400 font-medium">نظام الموارد البشرية الذكي</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mr-1">المعرف</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    readOnly
                    className="block w-full pr-12 pl-4 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-slate-300 cursor-not-allowed outline-none font-bold text-lg"
                    tabIndex={-1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mr-1">كلمة المرور</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    ref={passwordInputRef}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pr-12 pl-4 py-4 bg-slate-800/50 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 focus:bg-slate-800 transition-all outline-none font-medium placeholder-slate-600"
                    placeholder="أدخل مفتاح الدخول"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake duration-300">
                  <p className="text-red-400 text-sm text-center font-bold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full relative group"
              >
                <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-black text-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  دخول النظام
                  <ShieldCheck size={22} />
                </div>
              </button>
            </form>
          </div>
          <div className="bg-white/5 p-5 text-center border-t border-white/5">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Secure Terminal Access // XC3-Alpha</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
