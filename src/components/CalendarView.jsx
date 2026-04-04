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
import { useRealtimeAppointments } from '../hooks/useRealtime';

const CalendarView = ({ selectedDate, onDateSelect, professionalId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Usar hook de real-time para agendamentos
  const { appointments: allAppointments } = useRealtimeAppointments();

  // Filtrar agendamentos do mês atual para marcadores
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!professionalId) {
      setAppointments([]);
      return;
    }

    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);

    const filtered = (allAppointments || []).filter(appointment => {
      // Filtrar por profissional se especificado
      if (professionalId && appointment.profissional_id !== professionalId) {
        return false;
      }

      const appointmentDate = new Date(appointment.data_hora);
      return appointmentDate >= firstDay && appointmentDate <= lastDay;
    });

    setAppointments(filtered);
  }, [currentMonth, professionalId, allAppointments]);

  const renderHeader = () => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex flex-col">
          <span className="text-gray-400 text-[8px] sm:text-xs font-black uppercase tracking-widest mb-1 ml-1 opacity-50">Calendário</span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 font-display capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 sm:p-3 hover:bg-white hover:shadow-xl rounded-lg sm:rounded-2xl transition-all active:scale-90 border border-transparent hover:border-gray-100 group"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-lavender-600 transition-colors" />
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 sm:p-3 hover:bg-white hover:shadow-xl rounded-lg sm:rounded-2xl transition-all active:scale-90 border border-transparent hover:border-gray-100 group"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-lavender-600 transition-colors" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 mb-2 sm:mb-4 gap-0.5">
        {days.map((day) => (
          <div key={day} className="text-center text-[7px] sm:text-xs font-black text-gray-300 uppercase tracking-widest py-2">
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
              relative h-10 sm:h-12 md:h-14 flex items-center justify-center cursor-pointer transition-all duration-300 rounded-lg sm:rounded-2xl
              ${!isCurrentMonth ? 'text-gray-200' : ''}
              ${isPast ? 'cursor-not-allowed opacity-30 text-gray-400' : 'hover:bg-lavender-50'}
              ${isSelected ? 'bg-lavender-600 text-white shadow-xl shadow-lavender-200 z-10' : ''}
              ${!isPast && hasAppointment && !isSelected ? 'ring-2 ring-lavender-400 ring-opacity-50' : ''}
            `}
            onClick={() => !isPast && onDateSelect(d)}
          >
            {isSelected && (
              <motion.div 
                layoutId="calendar-selection"
                className="absolute inset-0 bg-lavender-600 rounded-lg sm:rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20 font-bold text-xs sm:text-sm md:text-base">
              {format(d, 'd')}
            </span>
            {!isPast && hasAppointment && (
              <div className="absolute -bottom-0.5 sm:-bottom-1 flex gap-0.5 sm:gap-1 z-20">
                <div className={`
                  w-1 h-1 sm:w-2 sm:h-2 rounded-full
                  ${isSelected ? 'bg-white' : 'bg-lavender-500'}
                  shadow-sm
                `} />
                <div className={`
                  w-1 h-1 sm:w-2 sm:h-2 rounded-full
                  ${isSelected ? 'bg-white opacity-60' : 'bg-lavender-400 opacity-60'}
                `} />
              </div>
            )}
            {isSameDay(d, today) && !isSelected && (
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-400 rounded-full z-20 shadow-sm" />
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
    <div className="bg-white/50 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl md:rounded-[2.5rem] border border-white premium-shadow">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CalendarView;
