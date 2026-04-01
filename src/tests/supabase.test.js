/**
 * Testes de Conexão com Supabase
 * 
 * Valida que o cliente Supabase está configurado corretamente
 * e consegue se comunicar com o banco de dados real.
 */
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsxmimctxzfkzyxuagjs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeG1pbWN0eHpma3p5eHVhZ2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjM3MjEsImV4cCI6MjA5MDUzOTcyMX0.ITseGxJScgMsi-YI35uw1-1zC_kZlQjMs2w-XGoPtCM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ──────────────────────────────────────────────────────────────
// 1. TESTES DE CONEXÃO
// ──────────────────────────────────────────────────────────────
describe('🔌 Conexão com Supabase', () => {

  it('deve criar o cliente Supabase sem erros', () => {
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeTypeOf('function');
    expect(supabase.auth).toBeDefined();
  });

  it('deve conseguir fazer SELECT na tabela profissionais', async () => {
    const { data, error } = await supabase
      .from('profissionais')
      .select('id, nome')
      .limit(10);

    expect(error).toBeNull();
    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBeGreaterThan(0);
  });

  it('deve retornar profissionais com campos esperados (id, nome)', async () => {
    const { data } = await supabase
      .from('profissionais')
      .select('id, nome')
      .limit(1);

    const prof = data[0];
    expect(prof).toHaveProperty('id');
    expect(prof).toHaveProperty('nome');
    expect(prof.nome).toBeTypeOf('string');
    expect(prof.nome.length).toBeGreaterThan(0);
  });

  it('deve conseguir fazer SELECT na tabela agendamentos', async () => {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('id')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeInstanceOf(Array);
  });

  it('deve retornar erro ao consultar tabela inexistente', async () => {
    const { error } = await supabase
      .from('tabela_que_nao_existe')
      .select('*')
      .limit(1);

    expect(error).not.toBeNull();
  });

});

// ──────────────────────────────────────────────────────────────
// 2. TESTES DE AUTENTICAÇÃO (LOGIN)
// ──────────────────────────────────────────────────────────────
describe('🔐 Autenticação Supabase', () => {

  it('deve rejeitar login com credenciais inválidas', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'usuario_falso_que_nao_existe@email.com',
      password: 'senhaErrada123',
    });

    expect(error).not.toBeNull();
    expect(error.message).toBeTruthy();
    expect(data.session).toBeNull();
  });

  it('deve rejeitar login com senha vazia', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'admin@agendaouro.com',
      password: '',
    });

    expect(error).not.toBeNull();
  });

  it('deve rejeitar login com email vazio', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: '',
      password: 'qualquerSenha',
    });

    expect(error).not.toBeNull();
  });

  it('deve retornar sessão nula quando não autenticado', async () => {
    // Garante logout antes
    await supabase.auth.signOut();

    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeNull();
  });

});

// ──────────────────────────────────────────────────────────────
// 3. TESTES DE RLS (PERMISSÕES)
// ──────────────────────────────────────────────────────────────
describe('🛡️ Políticas RLS (Segurança)', () => {

  it('deve permitir leitura pública de profissionais (sem login)', async () => {
    // Garante que estamos sem sessão
    await supabase.auth.signOut();

    const { data, error } = await supabase
      .from('profissionais')
      .select('id, nome');

    expect(error).toBeNull();
    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBeGreaterThan(0);
  });

  it('deve permitir leitura pública de agendamentos (sem login)', async () => {
    await supabase.auth.signOut();

    const { data, error } = await supabase
      .from('agendamentos')
      .select('id');

    expect(error).toBeNull();
    expect(data).toBeInstanceOf(Array);
  });

});
