# Agenda.Ouro - Sistema de Agendamento para Salão

> Sistema premium de gestão de agendamentos para salões de beleza, desenvolvido com React, Vite e Supabase.

## ✨ Funcionalidades

- 🔐 **Autenticação segura** - Login exclusivo para gestores
- 📅 **Calendário interativo** - Visualização mensal com marcadores de agendamentos
- 👥 **Múltiplos profissionais** - Selecione o especialista responsável
- ⏰ **Agendamento inteligente** - Sistema de slots disponíveis em tempo real
- 📱 **Interface mobile-first** - Otimizado para dispositivos móveis
- 🎨 **Design premium** - UI/UX sofisticada com animações suaves

## 🚀 Acesso ao Sistema

O sistema está disponível online em: **[https://kairosdedeus.github.io/AgendaSalao](https://kairosdedeus.github.io/AgendaSalao)**

### Credenciais de Teste
- **E-mail:** Configure no Supabase
- **Senha:** Configure no Supabase

## 🛠 Tecnologias Utilizadas

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Animações:** Framer Motion
- **Ícones:** Lucide React
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deploy:** GitHub Pages
- **Testes:** Vitest + Testing Library

## 📋 Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta no Supabase

## 🏗 Instalação e Desenvolvimento

```bash
# Clonar o repositório
git clone https://github.com/kairosdedeus/AgendaSalao.git
cd AgendaSalao

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves do Supabase

# Executar em desenvolvimento
npm run dev

# Executar testes
npm run test

# Build para produção
npm run build

# Deploy para GitHub Pages
npm run deploy
```

## 🗄️ Configuração do Banco de Dados

Execute o script SQL em `DATABASE_SETUP.md` no seu painel do Supabase para criar as tabelas e políticas de segurança.

## 📱 Estrutura do App

```
src/
├── components/
│   ├── Login.jsx              # Tela de autenticação
│   ├── CalendarView.jsx       # Calendário mensal
│   ├── TimeSlotList.jsx       # Lista de agendamentos do dia
│   ├── BookingForm.jsx        # Formulário de agendamento
│   └── AppointmentsManager.jsx # Gestão completa de agendamentos
├── lib/
│   └── supabase.js           # Configuração do Supabase
└── App.jsx                   # Componente principal
```

## 🎯 Fluxo de Uso

1. **Login** - Acesse com credenciais de gestor
2. **Selecionar Profissional** - Escolha o especialista
3. **Navegar no Calendário** - Visualize dias disponíveis
4. **Ver Agenda do Dia** - Consulte compromissos existentes
5. **Novo Agendamento** - Use o botão flutuante para criar
6. **Preencher Dados** - Cliente, serviço, horário
7. **Confirmar** - Salvar agendamento no sistema

## 📚 Documentação

- [Fluxo e Layout do Sistema](./SYSTEM_FLOW_LAYOUT.md)
- [Configuração do Banco](./DATABASE_SETUP.md)
- [Deploy no GitHub Pages](./GITHUB_PAGES_DEPLOYMENT.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ por Kairos De Deus**
