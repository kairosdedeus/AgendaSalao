import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook personalizado para gerenciar subscriptions em tempo real do Supabase
 * @param {string} table - Nome da tabela para monitorar
 * @param {Object} filters - Filtros para a query (opcional)
 * @param {Function} onUpdate - Callback chamado quando há mudanças (opcional)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useRealtimeData = (table, filters = {}, onUpdate) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select('*');

      // Aplicar filtros se fornecidos
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data: result, error: err } = await query;

      if (err) {
        setError(err.message);
        setData([]);
      } else {
        setData(result || []);
      }
    } catch (err) {
      setError('Erro ao buscar dados');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Buscar dados iniciais
    fetchData();

    // Configurar subscription em tempo real (sem filtros)
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log('Real-time update:', payload);

          // Para updates filtrados, precisamos verificar se o item atende aos filtros
          const shouldInclude = () => {
            if (Object.keys(filters).length === 0) return true;

            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              return Object.entries(filters).every(([key, value]) => {
                return payload.new[key] === value;
              });
            }

            if (payload.eventType === 'DELETE') {
              return Object.entries(filters).every(([key, value]) => {
                return payload.old[key] === value;
              });
            }

            return true;
          };

          if (shouldInclude()) {
            if (payload.eventType === 'INSERT') {
              setData(prev => {
                // Evitar duplicatas
                const exists = prev.some(item => item.id === payload.new.id);
                return exists ? prev : [...prev, payload.new];
              });
            } else if (payload.eventType === 'UPDATE') {
              setData(prev => prev.map(item =>
                item.id === payload.new.id ? payload.new : item
              ));
            } else if (payload.eventType === 'DELETE') {
              setData(prev => prev.filter(item => item.id !== payload.old.id));
            }

            // Chamar callback personalizado se fornecido
            if (onUpdate) {
              onUpdate(payload);
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, JSON.stringify(filters)]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

/**
 * Hook específico para agendamentos com filtros avançados
 * @param {Object} options - Opções de filtro
 * @returns {Object} { appointments, loading, error, refetch }
 */
export const useRealtimeAppointments = (options = {}) => {
  const { upcomingOnly = false } = options;

  // Usar hook sem filtros para obter todos os agendamentos
  const { data, loading, error, refetch } = useRealtimeData('agendamentos');

  // Filtrar dados localmente
  const filteredData = data.filter(appointment => {
    if (upcomingOnly) {
      return new Date(appointment.data_hora) >= new Date();
    }
    return true;
  });

  return {
    appointments: filteredData,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para profissionais em tempo real
 * @returns {Object} { professionals, loading, error, refetch }
 */
export const useRealtimeProfessionals = () => {
  return useRealtimeData('profissionais');
};

/**
 * Hook para serviços em tempo real
 * @returns {Object} { services, loading, error, refetch }
 */
export const useRealtimeServices = () => {
  return useRealtimeData('servicos');
};