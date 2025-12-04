import React, { useEffect, useRef, useState } from 'react';
import { Send, Calculator, Bot, User, Plus, MessageSquare, Trash2, Menu, AlertTriangle, FileSpreadsheet, PieChart } from 'lucide-react';
import type { ChatMessage, ChatSession, FinancialKPI, Transaction } from '../types';
import { askAccountingAdvisor } from '../services/geminiService';
import { exportToXLSX } from '../services/exportService';

interface AccountingAdvisorProps {
  financials: FinancialKPI;
  transactions: Transaction[];
}

type ExportKind = 'prestacao' | 'categorias';

const buildPrestacaoSheet = (transactions: Transaction[]) => {
  return transactions.map((transaction) => ({
    'Data (Registro)': transaction.date,
    'Descrição': transaction.description,
    'Categoria': transaction.category,
    'Origem': transaction.source,
    'Valor (R$)': transaction.amount,
    'Vínculo Patrimonial': transaction.assetLinked ?? '—',
  }));
};

const buildCategorySheet = (transactions: Transaction[]) => {
  const totals = transactions.reduce<Record<string, number>>((acc, transaction) => {
    const key = transaction.category || 'Sem Categoria';
    acc[key] = (acc[key] ?? 0) + Number(transaction.amount ?? 0);
    return acc;
  }, {});

  return Object.keys(totals).map((category) => ({
    Categoria: category,
    'Total (R$)': totals[category],
  }));
};

export const AccountingAdvisor: React.FC<AccountingAdvisorProps> = ({ financials, transactions }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'demo-accounting-session',
      title: 'Limite de gastos digital',
      lastModified: new Date(Date.now() - 3600_000),
      messages: [
        {
          id: 'init-user',
          role: 'user',
          text: 'Quanto ainda posso investir em mídia online?',
          timestamp: new Date(Date.now() - 3600_000),
        },
        {
          id: 'init-assistant',
          role: 'assistant',
          text: 'Você consumiu 72% do limite de gastos geral. Restam R$ 145.000,00 até atingir o teto definido pelo TSE. Recomendo escalonar as próximas ações para não exceder o limite nos últimos 15 dias de campanha.',
          timestamp: new Date(Date.now() - 3600_000),
        },
      ],
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = activeSessionId
    ? sessions.find((session) => session.id === activeSessionId)?.messages ?? []
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isLoading]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInput('');
  };

  const handleDeleteSession = (event: React.MouseEvent, sessionId: string) => {
    event.stopPropagation();
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    let sessionId = activeSessionId;

    if (!sessionId) {
      sessionId = Date.now().toString();
      const title = userMessage.text.length > 40 ? `${userMessage.text.slice(0, 40)}…` : userMessage.text;
      const newSession: ChatSession = {
        id: sessionId,
        title,
        lastModified: new Date(),
        messages: [userMessage],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(sessionId);
    } else {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                lastModified: new Date(),
                messages: [...session.messages, userMessage],
              }
            : session
        )
      );
    }

    setInput('');
    setIsLoading(true);

    try {
      const response = await askAccountingAdvisor(userMessage.text, {
        totalSpent: financials.totalSpent,
        balance: financials.balance,
        spendingLimit: financials.spendingLimit,
        spentToday: financials.spentToday,
        transactionCount: transactions.length,
      });

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text:
          response ||
          'Não consegui validar essa informação agora. Refaça a pergunta com mais detalhes ou tente novamente em instantes.',
        timestamp: new Date(),
      };

      const finalSessionId = sessionId;
      setSessions((prev) =>
        prev.map((session) =>
          session.id === finalSessionId
            ? {
                ...session,
                lastModified: new Date(),
                messages: [...session.messages, assistantMessage],
              }
            : session
        )
      );
    } catch (error) {
      console.error('Accounting advisor error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleExport = (kind: ExportKind) => {
    if (transactions.length === 0) {
      exportToXLSX('prestacao-contas', []);
      return;
    }

    if (kind === 'prestacao') {
      exportToXLSX('prestacao-contas', [
        {
          name: 'Movimentacoes',
          data: buildPrestacaoSheet(transactions),
        },
      ]);
      return;
    }

    exportToXLSX('consolidado-categorias', [
      {
        name: 'Totais por Categoria',
        data: buildCategorySheet(transactions),
      },
    ]);
  };

  const quickPrompts = [
    'Quais documentos preciso anexar na próxima prestação de contas?',
    'Existe risco de ultrapassar o limite municipal este mês?',
    'Como devo lançar doações estimáveis em dinheiro?',
    'Quais são os prazos de envio para o SPCE?'
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
      <aside
        className={`${showSidebar ? 'w-64' : 'w-0'} flex-shrink-0 transform border-r border-slate-200 bg-slate-50 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            Nova consulta
          </button>
        </div>
        <div className="space-y-1 px-2 pb-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Histórico</p>
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-sm transition ${
                activeSessionId === session.id
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <MessageSquare className="h-4 w-4 opacity-70" />
                <span className="truncate">{session.title}</span>
              </span>
              <button
                type="button"
                onClick={(event) => handleDeleteSession(event, session.id)}
                className="rounded p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                title="Apagar consulta"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Resumo financeiro</p>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Teto TSE</p>
              <p className="text-sm font-semibold text-slate-900">R$ {financials.spendingLimit.toLocaleString('pt-BR')}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Saldo Atual</p>
              <p className="text-sm font-semibold text-emerald-600">R$ {financials.balance.toLocaleString('pt-BR')}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Gasto acumulado</p>
              <p className="text-sm font-semibold text-slate-900">R$ {financials.totalSpent.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSidebar(!showSidebar)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Alternar histórico"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-600 p-2 shadow-sm">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Consultor Contábil IA</h2>
                <p className="text-xs text-slate-500">Resolução 23.607/2019 + Manual de Prestação de Contas TSE</p>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 md:flex">
            <AlertTriangle className="h-3 w-3" />
            Uso informativo
          </div>
        </header>

        <main className="flex-1 space-y-6 overflow-y-auto bg-slate-50/50 p-4 md:p-6">
          {!activeSessionId && activeMessages.length === 0 && (
            <div className="mt-[-40px] flex h-full flex-col items-center justify-center text-center opacity-80">
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                <Calculator className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-800">Preparado para revisar sua prestação?</h3>
              <p className="mb-6 max-w-lg text-sm text-slate-500">
                Pergunte sobre limites, documentos e riscos de reprovação. Gere planilhas com um clique e mantenha a campanha em conformidade.
              </p>
              <div className="grid w-full max-w-xl grid-cols-1 gap-3 md:grid-cols-2">
                {quickPrompts.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="rounded-xl border border-slate-200 bg-white p-3 text-left text-xs text-slate-600 transition hover:border-emerald-300 hover:shadow-md"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeMessages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[90%] items-start ${isUser ? 'flex-row-reverse md:max-w-[70%]' : 'md:max-w-[75%]'}`}>
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg shadow-sm ${
                      isUser ? 'ml-3 bg-emerald-600' : 'mr-3 border border-slate-200 bg-white'
                    }`}
                  >
                    {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-5 w-5 text-emerald-500" />}
                  </div>
                  <div
                    className={`whitespace-pre-wrap rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                      isUser ? 'rounded-tr-none bg-emerald-600 text-white' : 'rounded-tl-none border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="ml-11 flex items-center rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 delay-75" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 delay-150" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="space-y-3 border-t border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleExport('prestacao')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Gerar planilha prestação
            </button>
            <button
              type="button"
              onClick={() => handleExport('categorias')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <PieChart className="h-4 w-4" />
              Consolidar por categoria
            </button>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Descreva sua dúvida contábil..."
              className="min-h-[50px] max-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400"
              rows={1}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute bottom-2 right-2 rounded-lg bg-emerald-600 p-2 text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400">
            A IA auxilia na conferência, mas confirme com o contador responsável antes de enviar ao TSE.
          </p>
        </footer>
      </section>
    </div>
  );
};
