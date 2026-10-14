'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, User, Key, ArrowRight, ShieldCheck } from 'lucide-react';

export default function OperatorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('sarah.chen@resq.gov');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('COMMANDER');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Set operator session in localStorage for seamless client-side RBAC demo
      localStorage.setItem(
        'resqai_operator_session',
        JSON.stringify({
          id: 'op-001',
          name: role === 'COMMANDER' ? 'Cmdr. Sarah Chen' : 'Lead Dispatcher Marcus Vance',
          role,
          email,
        })
      );
      router.push('/operator/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center p-4 selection:bg-blue-500">
      <div className="w-full max-w-md bg-[#181c23] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-status-critical flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            ResQ<span className="text-blue-500">AI</span> Command Center
          </h2>
          <p className="text-xs text-slate-400">
            Secure Authentication & Tactical Role-Based Access Control
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Operator Identification
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#12151a] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#12151a] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Authorized Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['COMMANDER', 'DISPATCHER', 'OPERATOR'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-xl text-[11px] font-mono font-bold transition-all ${
                    role === r
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Access Tactical Command'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="pt-2 border-t border-white/5 text-center text-xs text-slate-500">
          <p>Demo Operator Access: Auto-filled for Sector 4 Lead</p>
        </div>
      </div>
    </div>
  );
}
