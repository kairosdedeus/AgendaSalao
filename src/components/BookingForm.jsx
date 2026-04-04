import React, { useState, useEffect } from 'react';
import { format, addMinutes, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  X, User, Phone, Clock, ChevronLeft, ChevronRight,
  Scissors, Sparkles, Star, Zap, ShoppingBag, Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// BookingForm — wizard de 3 passos para criar ou editar um agendamento
// ---------------------------------------------------------------------------
const BookingForm = ({ selectedDate, professionalId, onClose, onSave, initialData = null }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [formData, setFormData] = useState({
    cliente_nome: initialData?.cliente_nome || '',
    cliente_telefone: initialData?.cliente_telefone || '',
    servico: initialData?.servico || '',
    servico_id: initialData?.servico_id || '',
    data_hora: initialData?.data_hora || '',
    observacoes: initialData?.observacoes || '',
  });

  const isEditing = !!initialData;

  // Buscar serviços do banco
  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('categoria');

      if (error) {
        console.error('Erro ao buscar serviços:', error);
        setServicesLoading(false);
        return;
      }

      setServices(data || []);
      setServicesLoading(false);

      // Definir serviço padrão se não estiver editando
      if (!isEditing && data && data.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          servico: data[0].descricao,
          servico_id: data[0].id
        }));
      }
    };

    fetchServices();
  }, [isEditing]);

  // ---------------------------------------------------------------------------
  // Busca horários ocupados no banco e gera slots disponíveis
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !professionalId) return;
      setSlotsLoading(true);

      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);

      const { data, error } = await supabase
        .from('agendamentos')
        .select('data_hora')
        .eq('profissional_id', professionalId)
        .gte('data_hora', start.toISOString())
        .lte('data_hora', end.toISOString());

      // Se editando, exclui o slot atual da lista de ocupados
      const occupied = (data || [])
        .filter(d => !isEditing || d.data_hora !== initialData.data_hora)
        .map(d => parseISO(d.data_hora).getTime());

      const slots = [];
      let current = new Date(selectedDate);
      current.setHours(8, 0, 0, 0);
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(19, 0, 0, 0);

      while (current <= dayEnd) {
        if (!occupied.includes(current.getTime())) {
          slots.push(new Date(current));
        }
        current = addMinutes(current, 30);
      }

      if (error) console.warn('Slots: usando todos os horários por falha na consulta', error.message);
      setAvailableSlots(slots);
      setSlotsLoading(false);
    };

    fetchSlots();
  }, [selectedDate, professionalId]);

  // ---------------------------------------------------------------------------
  // Máscara de WhatsApp: (XX) XXXXX-XXXX
  // ---------------------------------------------------------------------------
  const formatWhatsApp = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // ---------------------------------------------------------------------------
  // Submissão: INSERT ou UPDATE
  // ---------------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!formData.cliente_nome || !formData.data_hora) return;
    setLoading(true);
    setSubmitError(null);

    const payload = {
      data_hora: formData.data_hora,
      cliente_nome: formData.cliente_nome,
      cliente_telefone: formData.cliente_telefone,
      servico: formData.servico,
      servico_id: formData.servico_id,
      profissional_id: professionalId,
      observacoes: formData.observacoes,
    };

    let err;
    if (isEditing) {
      const res = await supabase.from('agendamentos').update(payload).eq('id', initialData.id);
      err = res.error;
    } else {
      const res = await supabase.from('agendamentos').insert([payload]);
      err = res.error;
    }

    if (err) {
      setSubmitError('Erro ao salvar. Tente novamente.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => onSave(), 1800);
  };

  // Função para obter ícone baseado na categoria
  const getServiceIcon = (categoria) => {
    switch (categoria.toLowerCase()) {
      case 'corte': return <Scissors className="w-5 h-5" />;
      case 'finalização': return <Sparkles className="w-5 h-5" />;
      case 'tratamento': return <Zap className="w-5 h-5" />;
      case 'unhas': return <Star className="w-5 h-5" />;
      case 'cor': return <Sparkles className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  // ---------------------------------------------------------------------------
  // Steps
  // ---------------------------------------------------------------------------
  const renderStep1 = () => (
    <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-3">
      {servicesLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-lavender-200 border-t-lavender-600 rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">
          Nenhum serviço disponível.
        </div>
      ) : (
        services.map((s) => (
          <button
            key={s.id}
            onClick={() => { 
              setFormData(f => ({ 
                ...f, 
                servico: s.descricao,
                servico_id: s.id
              })); 
              setStep(2); 
            }}
            className={`
              w-full p-4 rounded-3xl border-2 transition-all flex items-center justify-between group
              ${formData.servico === s.descricao ? 'border-lavender-600 bg-lavender-50' : 'border-gray-100 hover:border-lavender-200 bg-white'}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-colors ${formData.servico === s.descricao ? 'bg-lavender-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-lavender-100'}`}>
                {getServiceIcon(s.categoria)}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-lavender-400 mb-0.5">{s.categoria}</p>
                <p className="font-bold text-gray-800">{s.descricao}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-lavender-600">R$ {s.preco.toFixed(2)}</p>
              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
            </div>
          </button>
        ))
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
      {slotsLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-lavender-200 border-t-lavender-600 rounded-full animate-spin" />
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">
          Não há horários disponíveis para este dia.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.map(slot => (
            <button
              key={slot.toISOString()}
              onClick={() => { setFormData(f => ({ ...f, data_hora: slot.toISOString() })); setStep(3); }}
              className={`
                py-4 rounded-2xl font-black text-sm transition-all
                ${formData.data_hora === slot.toISOString()
                  ? 'bg-lavender-600 text-white shadow-xl shadow-lavender-200'
                  : 'bg-gray-50 text-gray-500 hover:bg-lavender-50'}
              `}
            >
              {format(slot, 'HH:mm')}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
      <div className="space-y-4">
        {/* Nome */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input
            type="text"
            placeholder="Nome da Cliente"
            className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-lavender-500 outline-none font-bold"
            value={formData.cliente_nome}
            onChange={e => setFormData(f => ({ ...f, cliente_nome: e.target.value }))}
          />
        </div>

        {/* WhatsApp com máscara */}
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input
            type="tel"
            placeholder="WhatsApp (DD) 00000-0000"
            className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-lavender-500 outline-none font-bold"
            value={formData.cliente_telefone}
            onChange={e => setFormData(f => ({ ...f, cliente_telefone: formatWhatsApp(e.target.value) }))}
          />
        </div>

        {/* Observações */}
        <textarea
          placeholder="Observações (opcional)"
          rows={3}
          className="w-full p-5 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-lavender-500 outline-none font-bold resize-none"
          value={formData.observacoes}
          onChange={e => setFormData(f => ({ ...f, observacoes: e.target.value }))}
        />
      </div>

      {/* Resumo */}
      <div className="p-5 bg-lavender-50 rounded-[2rem] border border-lavender-100 space-y-2">
        <p className="text-[10px] font-black uppercase text-lavender-400 tracking-widest mb-2">Resumo</p>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lavender-600 rounded-lg text-white"><Clock className="w-4 h-4" /></div>
          <span className="font-bold text-gray-800 text-sm">
            {formData.data_hora ? format(parseISO(formData.data_hora), "HH:mm ' — ' d 'de' MMMM", { locale: ptBR }) : '—'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lavender-600 rounded-lg text-white"><ShoppingBag className="w-4 h-4" /></div>
          <span className="font-bold text-gray-800 text-sm">{formData.servico}</span>
        </div>
      </div>

      {/* Erro de submit */}
      {submitError && (
        <p className="text-red-500 text-xs font-bold text-center">{submitError}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !formData.cliente_nome || !formData.data_hora}
        className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          : isEditing ? 'Atualizar Agendamento' : 'Confirmar Agendamento'
        }
      </button>
    </motion.div>
  );

  const stepTitles = ['Qual serviço?', 'Escolha o horário', 'Dados da cliente'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-md">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-white w-full max-w-xl rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative"
      >
        {/* Tela de sucesso */}
        {success && (
          <div className="absolute inset-0 z-[110] bg-white/97 flex flex-col items-center justify-center p-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="w-12 h-12 text-green-600" />
            </motion.div>
            <h2 className="text-3xl font-black text-gray-900 mb-2 font-display">
              {isEditing ? 'Atualizado!' : 'Confirmado!'}
            </h2>
            <p className="text-gray-400 font-medium">Agendamento salvo com sucesso.</p>
          </div>
        )}

        <div className="p-6 sm:p-9 overflow-y-auto">
          {/* Header do modal */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-lavender-600 transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-black text-gray-900 font-display">
                  {isEditing ? 'Editar Agendamento' : stepTitles[step - 1]}
                </h2>
                <p className="text-lavender-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
                  Passo {step} de 3
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Conteúdo do step */}
          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingForm;
