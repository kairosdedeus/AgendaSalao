# 🛠 Supabase Database Setup Guide

Este documento contém o script SQL completo para configurar o backend do **Agenda.Ouro**. Como DevOPS Senior, estruturei este script para garantir integridade referencial, segurança via RLS (Row Level Security) e performance.

## 📋 Como aplicar
1. Acesse o seu [Dashboard do Supabase](https://app.supabase.com/).
2. Vá em **SQL Editor** no menu lateral.
3. Clique em **New Query**.
4. Cole o script abaixo e clique em **Run**.

---

## 💾 SQL Script

```sql
-- ==========================================
-- 1. TABELAS
-- ==========================================

-- Tabela de Profissionais (Especialistas)
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  servico TEXT NOT NULL,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE NOT NULL,
  observacoes TEXT,
  status TEXT DEFAULT 'Confirmado' CHECK (status IN ('Pendente', 'Confirmado', 'Cancelado', 'Finalizado'))
);

-- ==========================================
-- 2. SEGURANÇA (RLS - ROW LEVEL SECURITY)
-- ==========================================

-- Habilitar RLS
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PROFISSIONAIS
CREATE POLICY "Profissionais são visíveis publicamente" 
ON profissionais FOR SELECT TO public USING (true);

CREATE POLICY "Gestores podem gerenciar profissionais" 
ON profissionais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- POLÍTICAS PARA AGENDAMENTOS
CREATE POLICY "Agendamentos são visíveis publicamente" 
ON agendamentos FOR SELECT TO public USING (true);

CREATE POLICY "Clientes podem criar agendamentos" 
ON agendamentos FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Gestores podem editar agendamentos" 
ON agendamentos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Gestores podem deletar agendamentos" 
ON agendamentos FOR DELETE TO authenticated USING (true);

-- ==========================================
-- 3. DADOS INICIAIS (SEED)
-- ==========================================

INSERT INTO profissionais (nome) VALUES ('Helena Costa'), ('Juliana Paiva'), ('Beatriz Lima');

-- ==========================================
-- 4. ÍNDICES DE PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional ON agendamentos(profissional_id);
```

---

## 🔒 Notas de Segurança Sênior

> [!IMPORTANT]
> As políticas acima permitem que o calendário seja público para que o sistema de slots funcione sem autenticação. Em produção, considere restringir o `SELECT` de `agendamentos` para retornar apenas `data_hora` via RPC, protegendo a privacidade dos nomes dos clientes.

> [!TIP]
> Garanta que seu arquivo `.env` contenha as chaves corretas:
> `VITE_SUPABASE_URL=sua_url`
> `VITE_SUPABASE_ANON_KEY=sua_chave`
