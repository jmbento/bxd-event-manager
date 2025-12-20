import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SupportChatbotProps {
  companyName?: string;
}

export const SupportChatbot: React.FC<SupportChatbotProps> = ({ 
  companyName = 'BXD Event Manager' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensagem de boas-vindas
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Olá! 👋 Sou o assistente virtual do ${companyName}. Como posso ajudar você hoje?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, companyName]);

  const quickReplies = [
    'Como criar um evento?',
    'Planos e preços',
    'Problemas de pagamento',
    'Integração com APIs',
    'Suporte técnico'
  ];

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Respostas baseadas em palavras-chave
    if (lowerMessage.includes('criar evento') || lowerMessage.includes('novo evento')) {
      return 'Para criar um evento:\n\n1. Acesse "Configurações"\n2. Clique em "Criar Novo Evento"\n3. Preencha as informações básicas\n4. Configure módulos (Financeiro, Equipe, NFC, etc.)\n5. Salve e comece a usar!\n\nPrecisa de ajuda com alguma etapa específica?';
    }

    if (lowerMessage.includes('preço') || lowerMessage.includes('plano') || lowerMessage.includes('custo')) {
      return 'Nossos planos:\n\n🎯 Starter: R$ 97/mês\n• 1 evento ativo\n• 3 membros\n• Todos os módulos\n\n🚀 Pro: R$ 297/mês\n• 5 eventos ativos\n• 15 membros\n• Suporte prioritário\n\n💼 Enterprise: Sob consulta\n• Eventos ilimitados\n• Time ilimitado\n• Customização completa\n\nTodos incluem 15 dias grátis! Quer conhecer algum plano específico?';
    }

    if (lowerMessage.includes('pagamento') || lowerMessage.includes('cobranç') || lowerMessage.includes('fatura')) {
      return 'Para questões de pagamento:\n\n• Acesse "Configurações" > "Assinatura"\n• Veja faturas em "Histórico de Pagamentos"\n• Atualize forma de pagamento em "Métodos"\n\nSe houver cobrança duplicada ou outro problema, envie um email para financeiro@bxdeventmanager.com ou clique em "Falar com Humano" e nossa equipe responderá em até 2 horas.';
    }

    if (lowerMessage.includes('api') || lowerMessage.includes('integra')) {
      return 'Para integrar APIs:\n\n1. Vá em "Analytics" > "Configurações"\n2. Conecte suas plataformas (Instagram, Facebook, etc.)\n3. Ou acesse "Painel SaaS" para gerenciar APIs de infraestrutura\n\nNossas integrações principais:\n• Redes sociais (Meta, Twitter, TikTok)\n• Pagamentos (MercadoPago, Stripe, PagSeguro)\n• Email (SendGrid, Mailchimp)\n• NFC (leitores USB, Bluetooth, QR Code)\n\nPrecisa de ajuda com alguma integração específica?';
    }

    if (lowerMessage.includes('suporte') || lowerMessage.includes('ajuda') || lowerMessage.includes('problema') || lowerMessage.includes('erro')) {
      return 'Estou aqui para ajudar! 🛟\n\nCanais de suporte:\n\n📧 Email: suporte@bxdeventmanager.com\n💬 Chat: Clique em "Falar com Humano"\n📞 WhatsApp: (11) 9 9999-9999\n\nHorário de atendimento:\nSeg-Sex: 9h às 18h\nSábado: 9h às 13h\n\nClientes Pro/Enterprise têm suporte 24/7!\n\nQual é o problema que você está enfrentando?';
    }

    if (lowerMessage.includes('nfc') || lowerMessage.includes('pulseira')) {
      return 'Sistema NFC de Pulseiras:\n\n✓ Suporta múltiplos dispositivos:\n  • Smartphones com NFC\n  • Leitores USB\n  • Leitores Bluetooth\n  • QR Code (alternativa)\n\n✓ Funcionalidades:\n  • Controle de acesso\n  • Registro de alimentação\n  • Geração de leads\n  • Cashless (pagamentos)\n\nAcesse "Sistema NFC" no menu para configurar. Precisa de ajuda com configuração?';
    }

    if (lowerMessage.includes('obrigad') || lowerMessage.includes('valeu')) {
      return 'Por nada! 😊 Fico feliz em ajudar! Se precisar de mais alguma coisa, é só chamar. Bons eventos! 🎉';
    }

    // Resposta genérica
    return 'Entendi sua pergunta! Aqui estão alguns tópicos que posso ajudar:\n\n• Criar e gerenciar eventos\n• Planos e preços\n• Problemas com pagamento\n• Integrações e APIs\n• Módulos (NFC, Financeiro, Marketing)\n• Suporte técnico\n\nPode me fazer uma pergunta mais específica ou clicar em "Falar com Humano" para conversar com nossa equipe. 😊';
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular digitação da IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50 group"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Precisa de ajuda? Fale conosco!
        </div>
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 z-50 flex flex-col transition-all ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Assistente Virtual</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/90">Online agora</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-white" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-br from-purple-600 to-pink-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-gray-100'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className={`text-xs mt-1 block ${
                      message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-400 mb-2">Sugestões rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sm text-gray-300 rounded-full transition border border-slate-700"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <button
              className="w-full mt-2 py-2 text-sm text-blue-400 hover:text-blue-300 transition"
              onClick={() => {
                alert('Redirecionando para suporte humano... (em desenvolvimento)');
              }}
            >
              💬 Falar com um humano
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SupportChatbot;
