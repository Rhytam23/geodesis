import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, UserRole } from '../context/RoleContext';
import { ArrowRight, Check } from 'lucide-react';

const roles: { value: UserRole; label: string; desc: string; icon: string }[] = [
  { value: 'farmer', label: 'Farmer', desc: 'Smallholder or commercial farm', icon: '🌾' },
  { value: 'cooperative', label: 'Cooperative', desc: 'Rice, shrimp, or vegetable cooperative', icon: '🏭' },
  { value: 'government', label: 'Government', desc: 'Provincial or national agricultural officer', icon: '🏛️' },
  { value: 'research', label: 'Researcher', desc: 'University or research institute', icon: '🔬' },
];

export default function SignUp() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{name?: string; email?: string}>({});
  const navigate = useNavigate();
  const { login } = useRole();

  const validateForm = (): boolean => {
    const newErrors: {name?: string; email?: string} = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      login(selectedRole);
      navigate('/mission-control');
    }, 650);
  };

  const handleRoleSelect = (roleValue: UserRole) => {
    setSelectedRole(roleValue);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[520px]">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-emerald-700 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
            <span className="text-white font-bold text-3xl tracking-tighter">MS</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tighter">Create your account</h1>
          <p className="text-slate-500 mt-2">Join the Mekong Smart Land platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
          {/* Role Selection */}
          <div className="mb-7">
            <label className="block text-sm font-semibold mb-3 tracking-wide text-slate-700">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(r => (
                <button 
                  type="button" 
                  key={r.value} 
                  onClick={() => handleRoleSelect(r.value)}
                  className={`group p-4 text-left border-2 rounded-3xl transition-all flex flex-col justify-between h-[110px] ${selectedRole === r.value 
                    ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-200' 
                    : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div>
                    <div className="text-2xl mb-1.5">{r.icon}</div>
                    <div className="font-semibold tracking-tight">{r.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-snug">{r.desc}</div>
                  </div>
                  {selectedRole === r.value && (
                    <div className="mt-2 self-end"><Check className="w-4 h-4 text-emerald-700" /></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-slate-700">Full Name</label>
              <input 
                value={name} 
                onChange={e => { setName(e.target.value); if (errors.name) setErrors({...errors, name: undefined}); }} 
                required 
                placeholder="Nguyen Van Minh" 
                className={`w-full border rounded-3xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition ${errors.name ? 'border-red-300' : 'border-slate-300'}`} 
              />
              {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1.5 text-slate-700">Organization / Farm</label>
              <input 
                value={org} 
                onChange={e => setOrg(e.target.value)} 
                placeholder="Chau Doc Cooperative" 
                className="w-full border border-slate-300 rounded-3xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition" 
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1.5 text-slate-700">Work Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({...errors, email: undefined}); }} 
                required 
                placeholder="you@farm.vn" 
                className={`w-full border rounded-3xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition ${errors.email ? 'border-red-300' : 'border-slate-300'}`} 
              />
              {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
            </div>
          </div>

          <div className="mt-7">
            <button 
              type="submit" 
              disabled={loading || !name || !email} 
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-[0.985]"
            >
              {loading ? "Creating account..." : "Create Account & Continue"} 
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-center mt-5 text-xs text-slate-500">
            Already have an account? <a href="/mission-control" className="text-emerald-700 font-medium">Sign in</a>
          </div>
        </form>
        
        <div className="text-center mt-5 text-xs text-slate-400">
          Your data is used only for demonstration purposes.
        </div>
      </div>
    </div>
  );
}
