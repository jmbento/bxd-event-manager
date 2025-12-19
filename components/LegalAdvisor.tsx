import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { askLegalAdvisor } from '../services/geminiService';
import { Send, Scale, Shield, User, Bot, AlertTriangle, Plus, MessageSquare, History, Menu, Trash2 } from 'lucide-react';
import { PageBanner } from './PageBanner';

export const LegalAdvisor: React.FC = () => {
  // State for Sessions (History)
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-1',
      title: 'Alvará para evento com pirotecnia',
      lastModified: new Date(Date.now() - 86400000), // Yesterday
      messages: [
         { id: '1', role: 'user', text: 'Preciso de alvará especial para usar fogos de artifício no encerramento do evento?', timestamp: new Date(Date.now() - 86400000) },
         { id: '2', role: 'assistant', text: 'Sim, para uso de pirotecnia em eventos é necessária autorização do Corpo de Bombeiros e, em alguns municípios, também da Polícia Civil. O responsável técnico deve ter certificação em manuseio de fogos. Recomendo também verificar a lei orgânica municipal sobre horário permitido e distância mínima de hospitais e áreas residenciais.', timestamp: new Date(Date.now() - 86400000) }
      ]
    }
  ]);
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true); // For responsive toggle
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to get current messages
  const activeMessages = activeSessionId 
    ? sessions.find(s => s.id === activeSessionId)?.messages || []
    : []; // If null, we are in "New Chat" mode (empty) or Welcome mode

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isLoading]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInput('');
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
        setActiveSessionId(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };

    let currentSessionId = activeSessionId;

    // Logic: Create session if it doesn't exist (First message of new chat)
    if (!currentSessionId) {
        const newSessionId = Date.now().toString();
        const newTitle = userText.length > 30 ? userText.substring(0, 30) + '...' : userText;
        
        const newSession: ChatSession = {
            id: newSessionId,
            title: newTitle,
            lastModified: new Date(),
            messages: [userMsg]
        };
        
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSessionId);
        currentSessionId = newSessionId;
    } else {
        // Append to existing session
        setSessions(prev => prev.map(s => 
            s.id === currentSessionId 
                ? { ...s, messages: [...s.messages, userMsg], lastModified: new Date() }
                : s
        ));
    }

    // Call Gemini
    const responseText = await askLegalAdvisor(userText);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: responseText || 'Desculpe, não consegui processar sua dúvida agora.',
      timestamp: new Date()
    };

    // Update Session with AI Response
    setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
            ? { ...s, messages: [...s.messages, aiMsg], lastModified: new Date() }
            : s
    ));
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <PageBanner 
        title="Legal" 
        subtitle="Consultoria jurídica"
        storageKey="legal_banner_images"
        defaultImages={[
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&h=300&fit=crop'
        ]}
      />
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
      
      {/* SIDEBAR - HISTORY */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0`}>
         {/* New Chat Button */}
         <div className="p-4">
            <button 
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-lg shadow-sm transition-colors text-sm font-medium"
            >
                <Plus className="w-4 h-4" />
                Nova Consulta
            </button>
         </div>

         {/* History List */}
         <div className="flex-1 overflow-y-auto px-2 pb-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 mt-2">Histórico</div>
            {sessions.length === 0 && (
                <div className="px-3 text-xs text-slate-400 italic">Nenhuma pesquisa salva.</div>
            )}
            <div className="space-y-1">
                {sessions.map(session => (
                    <div 
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`
                            group flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer text-sm transition-colors
                            ${activeSessionId === session.id ? 'bg-blue-100 text-blue-900' : 'text-slate-600 hover:bg-slate-200/50'}
                        `}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-70" />
                            <span className="truncate">{session.title}</span>
                        </div>
                        {/* Delete Button (visible on hover) */}
                        <button 
                            onClick={(e) => handleDeleteSession(e, session.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded text-slate-400 transition-all"
                            title="Apagar conversa"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
         </div>
         
         <div className="p-4 border-t border-slate-200">
             <div className="flex items-center gap-3 text-xs text-slate-500">
                 <div className="p-2 bg-slate-200 rounded-full"><User className="w-4 h-4" /></div>
                 <div>
                     <p className="font-bold text-slate-700">Produtor</p>
                     <p>Organizador do Evento</p>
                 </div>
             </div>
         </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
                <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-lg shadow-sm">
                        <Scale className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-sm md:text-base">Consultor Jurídico IA</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-xs text-slate-500">Legislação de Eventos Online</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hidden md:flex bg-red-50 px-3 py-1 rounded-full border border-red-100 items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] text-red-700 font-medium">Uso Informativo</span>
            </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
            
            {!activeSessionId && activeMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-80 mt-[-50px]">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <Scale className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Como posso ajudar seu evento hoje?</h3>
                    <p className="text-slate-500 text-sm max-w-md mb-8">
                        Tire dúvidas sobre contratos, alvarás, direitos autorais, ECAD e o que é exigido pela legislação de eventos.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                        <button onClick={() => setInput("Preciso pagar ECAD para tocar música no evento?")} className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-left hover:border-blue-400 hover:shadow-md transition-all text-slate-600">
                            🎵 "Preciso pagar ECAD para tocar música no evento?"
                        </button>
                        <button onClick={() => setInput("Qual seguro é obrigatório para eventos?")} className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-left hover:border-blue-400 hover:shadow-md transition-all text-slate-600">
                            🛡️ "Qual seguro é obrigatório para eventos?"
                        </button>
                        <button onClick={() => setInput("Como funciona a Lei Rouanet para eventos?")} className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-left hover:border-blue-400 hover:shadow-md transition-all text-slate-600">
                            📋 "Como funciona a Lei Rouanet para eventos?"
                        </button>
                        <button onClick={() => setInput("Regras de acessibilidade para eventos")} className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-left hover:border-blue-400 hover:shadow-md transition-all text-slate-600">
                            ♿ "Regras de acessibilidade para eventos"
                        </button>
                    </div>
                </div>
            )}

            {activeMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start max-w-[90%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${isUser ? 'bg-blue-600 ml-3' : 'bg-white border border-slate-200 mr-3'}`}>
                            {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-5 h-5 text-amber-500" />}
                        </div>
                        
                        {/* Bubble */}
                        <div className={`
                            p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm
                            ${isUser 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}
                        `}>
                            {msg.text}
                        </div>
                    </div>
                </div>
            );
            })}
            
            {isLoading && (
                <div className="flex justify-start">
                    <div className="flex items-center bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm ml-11">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
            <div className="relative max-w-4xl mx-auto">
                <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua dúvida jurídica..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm min-h-[50px] max-h-[120px] shadow-sm"
                rows={1}
                />
                <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                <Send className="w-4 h-4" />
                </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
                A IA pode cometer erros. Consulte sempre seu jurídico oficial para decisões críticas.
            </p>
        </div>
      </div>
    </div>
    </>
  );
};
