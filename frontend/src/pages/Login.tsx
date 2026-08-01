import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import { UserRole } from '../types';
import { MindlapLogo } from '../components/MindlapLogo';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Clear any stale tokens before authentication attempt
    localStorage.removeItem('mindlap_access_token');
    localStorage.removeItem('mindlap_refresh_token');
    localStorage.removeItem('mindlap_user');

    try {
      const response = await api.post('auth/token/', { username, password });
      const { access, refresh, user } = response.data;
      login(access, refresh, user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else {
        setError('Invalid username or password. Please check your credentials.');
      }
    }
  };

  const handleQuickRoleSelect = (r: UserRole) => {
    switch (r) {
      case 'owner':
      case 'admin':
        setUsername('admin');
        setPassword('Admin@123');
        break;
      case 'ccd':
        setUsername('delna');
        setPassword('Ccd@123');
        break;
      default:
        setUsername('admin');
        setPassword('Admin@123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-purple-100">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <MindlapLogo variant="light" size="lg" showSubtitle={true} />
          <p className="text-xs font-semibold text-slate-500 mt-2">Enterprise Clinical & Therapy Management Platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Username / Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-purple-50/30 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-purple-50/30 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold text-xs rounded-lg shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Sign In to Mindlap EMR
          </button>
        </form>

        {/* Quick Role Login Presets */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Quick Login Presets</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickRoleSelect('owner')}
              className="py-2 px-2 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
            >
              👑 Owner / Admin
            </button>
            <button
              onClick={() => handleQuickRoleSelect('ccd')}
              className="py-2 px-2 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
            >
              📞 CCD Staff (@delna)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
