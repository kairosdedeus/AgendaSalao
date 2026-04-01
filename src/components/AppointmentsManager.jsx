import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, parseISO, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search, Edit2, Trash2, User,
  Scissors, AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentsManager = ({ onEdit }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'all'
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('agendamentos')
      .select(`
        id,
        data_hora,
        cliente_nome,
        cliente_telefone,
        servico,
        observacoes,
        status,
        profissionais ( nome )
      `)
      .order('data_hora', { ascending: true });

    if (filter === 'upcoming') {
      query = query.gte('data_hora', startOfToday().toISOString());
    }

    const { data, error: err } = await query;

    if (err) {
      setError('Não foi possível carregar os agendamentos.');
      setLoading(false);
      return;
    }

    setAppointments(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);

    const { error: err } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id);

    if (err) {
      // Exibe o erro brevemente e fecha o overlay
      console.error('Erro ao excluir:', err.message);
    } else {
      setAppointments(prev => prev.filter(a => a.id !== id));
    }

    setDeletingId(null);
    setDeleteLoading(false);
  };

  const filtered = appointments.filter(a =>
    a.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
    a.servico.toLowerCase().includes(search.toLowerCase())
  );

  // ---- Status badge color ----
  const statusColor = {
    Confirmado: 'bg-green-50 text-green-600',
    Pendente: 'bg-yellow-50 text-yellow-600',
    Cancelado: 'bg-red-50 text-red-400',
    Finalizado: 'bg-gray-100 text-gray-400',
  };

  return (
    <div className="space-y-6">
      {/* Busca e filtros */}
      <div className="space-y-4 px-2">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-lavender-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            className="w-full pl-14 pr-6 py-5 glass rounded-[2rem] border-lavender-100 focus:ring-2 focus:ring-lavender-500 outline-none font-bold text-gray-900 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {['upcoming', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
                ${filter === f ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}
              `}
            >
              {f === 'upcoming' ? 'Próximos' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4 px-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin text-lavender-600 mb-4" />
            <p className="font-black text-[10px] uppercase tracking-widest text-gray-400">Carregando...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 glass rounded-[3rem] border-lavender-100">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <p className="font-bold text-gray-400">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-4 text-xs text-lavender-500 font-bold underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass rounded-[3rem] border-lavender-100">
            <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-bold text-gray-400">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a, index) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="glass p-6 rounded-[2.5rem] border-lavender-100 relative overflow-hidden"
              >
                {/* Info principal */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 font-display mb-1">{a.cliente_nome}</h3>
                    <div className="flex items-center gap-3 text-gray-400 text-xs font-bold flex-wrap">
                      <div className="flex items-center gap-1">
                        <Scissors className="w-3.5 h-3.5 text-lavender-400" />
                        {a.servico}
                      </div>
                      <div className="w-1 h-1 bg-gray-200 rounded-full" />
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-lavender-400" />
                        {a.profissionais?.nome || '—'}
                      </div>
                      {a.cliente_telefone && (
                        <>
                          <div className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span>{a.cliente_telefone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                    <div className="px-3 py-1 bg-lavender-50 text-lavender-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {format(parseISO(a.data_hora), 'HH:mm')}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400">
                      {format(parseISO(a.data_hora), 'dd MMM', { locale: ptBR })}
                    </div>
                    {a.status && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColor[a.status] || 'bg-gray-100 text-gray-400'}`}>
                        {a.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Observação */}
                {a.observacoes && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-medium text-gray-500 italic">
                    "{a.observacoes}"
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(a)}
                    className="flex-1 py-3 bg-white border border-gray-100 rounded-2xl text-gray-600 font-black text-[10px] uppercase tracking-widest hover:bg-lavender-50 hover:text-lavender-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => setDeletingId(a.id)}
                    className="flex-1 py-3 bg-white border border-gray-100 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>

                {/* Confirmação de exclusão */}
                <AnimatePresence>
                  {deletingId === a.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/96 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center"
                    >
                      <p className="font-black text-gray-900 mb-1">Excluir agendamento?</p>
                      <p className="text-xs text-gray-400 mb-5">Esta ação não pode ser desfeita.</p>
                      <div className="flex items-center gap-3 w-full">
                        <button
                          onClick={() => setDeletingId(null)}
                          disabled={deleteLoading}
                          className="flex-1 py-3 glass rounded-2xl text-gray-400 font-bold text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={deleteLoading}
                          className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                        >
                          {deleteLoading ? (
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : 'Confirmar'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsManager;
