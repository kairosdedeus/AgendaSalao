import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          setError('E-mail ou senha incorretos.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('E-mail não confirmado. Verifique sua caixa de entrada ou desative a confirmação no Supabase.');
        } else {
          setError(authError.message);
        }
      }
    } catch (err) {
      console.error('[Login] Erro de rede:', err);
      setError('Falha de conexão com o servidor. Verifique sua internet e tente novamente.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFF] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-lavender-100 via-white to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-lavender-100 premium-shadow">
          {/* Brand */}
          <div className="flex flex-col items-center mb-10">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="p-5 bg-lavender-600 rounded-3xl shadow-xl shadow-lavender-200 mb-6"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-gray-900 font-display tracking-tight mb-2">
              Agenda<span className="text-lavender-600">.</span>Ouro
            </h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Premium Management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">
                Acesso Restrito
              </label>

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-lavender-500 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Seu e-mail profissional"
                  className="w-full pl-14 pr-5 py-5 bg-gray-50 border-transparent rounded-[2rem] focus:ring-2 focus:ring-lavender-500 outline-none transition-all font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Senha */}
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-lavender-500 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Sua senha secreta"
                  className="w-full pl-14 pr-5 py-5 bg-gray-50 border-transparent rounded-[2rem] focus:ring-2 focus:ring-lavender-500 outline-none transition-all font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-gray-200
                flex items-center justify-center gap-2 hover:bg-lavender-600 transition-all active:scale-95
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <div className="w-8 h-[1px] bg-gray-100" />
            Exclusivo Gold Team
            <div className="w-8 h-[1px] bg-gray-100" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
