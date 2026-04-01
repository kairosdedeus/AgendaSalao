import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfDay, 
  endOfDay, 
  parseISO 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, User, Scissors, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const TimeSlotList = ({ selectedDate, professionalId, onAddBooking }) => {
  const [dayAppointments, setDayAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDayAppointments = async () => {
      if (!selectedDate || !professionalId) return;
      
      setLoading(true);
      try {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);

        const { data, error } = await supabase
          .from('agendamentos')
          .select('*')
          .eq('profissional_id', professionalId)
          .gte('data_hora', start.toISOString())
          .lte('data_hora', end.toISOString())
          .order('data_hora', { ascending: true });

        if (error) {
          console.error('TimeSlotList: falha ao buscar agenda do dia:', error.message);
          setDayAppointments([]);
          setLoading(false);
          return;
        }
        setDayAppointments(data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchDayAppointments();
  }, [selectedDate, professionalId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-lavender-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 pt-4">
      <div className="flex flex-col gap-1 px-2">
        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest opacity-50">Programação do Dia</span>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900 font-display capitalize">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>
          <div className="flex items-center gap-2 text-lavender-500 font-bold bg-lavender-50 px-3 py-1 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            {dayAppointments.length} agendados
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {dayAppointments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/40 border-2 border-dashed border-gray-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-gray-300"
            >
              <CalendarIcon className="w-10 h-10 mb-4 opacity-20" />
              <span className="text-sm font-bold tracking-tight">Nenhuma atividade hoje</span>
            </motion.div>
          ) : (
            dayAppointments.map((appointment, index) => (
              <motion.div 
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass rounded-3xl p-5 flex items-center justify-between border-lavender-100 group"
              >
                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl w-16 h-16 group-hover:bg-lavender-600 group-hover:text-white transition-colors">
                    <span className="text-xs font-black uppercase opacity-40 group-hover:text-white/50">Início</span>
                    <span className="text-lg font-black font-display tracking-tight">
                      {format(parseISO(appointment.data_hora), 'HH:mm')}
                    </span>
                  </div>
                  <div className="border-l border-gray-100 pl-5 space-y-1">
                    <div className="flex items-center gap-2 text-gray-900 font-black font-display text-lg">
                      {appointment.cliente_nome}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                      <Scissors className="w-3.5 h-3.5 text-lavender-400" />
                      {appointment.servico}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onAddBooking()}
        className="fixed bottom-8 right-8 z-40 bg-gray-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center gap-3 active:bg-lavender-700 transition-all border border-white/10 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-400 to-lavender-700 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Plus className="w-6 h-6 relative z-10" />
        <span className="font-black font-display tracking-tight text-sm uppercase mr-2 relative z-10">Novo Agendamento</span>
      </motion.button>
    </div>
  );
};

export default TimeSlotList;
