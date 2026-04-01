import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isBefore, 
  startOfDay,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarView = ({ selectedDate, onDateSelect, professionalId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!professionalId) return;

      try {
        const firstDay = startOfMonth(currentMonth);
        const lastDay = endOfMonth(currentMonth);

        const { data, error } = await supabase
          .from('agendamentos')
          .select('data_hora')
          .eq('profissional_id', professionalId)
          .gte('data_hora', firstDay.toISOString())
          .lte('data_hora', lastDay.toISOString());

        if (error) {
          console.error('CalendarView: falha ao buscar marcadores:', error.message);
          setAppointments([]);
          return;
        }
        setAppointments(data || []);
      } catch (err) {
        console.error('CalendarView: erro inesperado:', err.message);
        setAppointments([]);
      }
    };

    fetchAppointments();
  }, [currentMonth, professionalId]);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1 ml-1 opacity-50">Calendário</span>
          <h2 className="text-2xl font-black text-gray-900 font-display capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-3 hover:bg-white hover:shadow-xl rounded-2xl transition-all active:scale-90 border border-transparent hover:border-gray-100 group"
          >
            <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-lavender-600 transition-colors" />
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-3 hover:bg-white hover:shadow-xl rounded-2xl transition-all active:scale-90 border border-transparent hover:border-gray-100 group"
          >
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-lavender-600 transition-colors" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    const today = startOfDay(new Date());

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const d = day;
        const isPast = isBefore(startOfDay(d), today);
        const isSelected = isSameDay(d, selectedDate);
        const isCurrentMonth = isSameMonth(d, monthStart);
        
        const hasAppointment = appointments.some(app => 
          isSameDay(parseISO(app.data_hora), d)
        );

        days.push(
          <motion.div
            key={d.toString()}
            whileTap={!isPast ? { scale: 0.9 } : {}}
            className={`
              relative h-14 flex items-center justify-center cursor-pointer transition-all duration-300
              ${!isCurrentMonth ? 'text-gray-200' : ''}
              ${isPast ? 'cursor-not-allowed opacity-30 text-gray-400' : 'hover:bg-lavender-50 rounded-2xl'}
              ${isSelected ? 'bg-lavender-600 text-white shadow-xl shadow-lavender-200 z-10' : ''}
            `}
            onClick={() => !isPast && onDateSelect(d)}
          >
            {isSelected && (
              <motion.div 
                layoutId="calendar-selection"
                className="absolute inset-0 bg-lavender-600 rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20 font-bold text-sm">
              {format(d, 'd')}
            </span>
            {!isPast && hasAppointment && (
              <div className={`
                absolute bottom-2 w-1 h-1 rounded-full z-20
                ${isSelected ? 'bg-white' : 'bg-lavender-400'}
              `} />
            )}
            {isSameDay(d, today) && !isSelected && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-400 rounded-full z-20 shadow-sm" />
            )}
          </motion.div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className="bg-white/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-white premium-shadow">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CalendarView;
