import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const extractReceiptData = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Extract the total amount and the date from this receipt image. If the date is missing, use today's date."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "Total value of the receipt" },
            date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
            merchant: { type: Type.STRING, description: "Name of the merchant/store" }
          },
          required: ["amount"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw error;
  }
};

export const askLegalAdvisor = async (question: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: `Você é um advogado especialista em Direito para Eventos Culturais, Esportivos e Corporativos no Brasil.
        Suas respostas devem cobrir:
        - Eventos incentivados (Lei Rouanet, Lei do Audiovisual, leis municipais e estaduais)
        - Legislação trabalhista para eventos (contratação de artistas, técnicos, produtores)
        - Seguros obrigatórios (responsabilidade civil, seguro de vida, acidentes pessoais)
        - Alvará de funcionamento e autorizações municipais
        - Direitos autorais (ECAD, UBC, ABRAMUS) e propriedade intelectual
        - Leis orgânicas municipais (horário de funcionamento, ruído, aglomeração)
        - Contratos (fornecedores, patrocínio, cessão de espaço)
        - Responsabilidade civil do organizador
        - Acessibilidade (Lei nº 13.146/2015 - LBI)
        - Proteção de dados (LGPD) para cadastro de participantes
        
        Seja direto, pragmático e cite a base legal quando possível.
        Se a pergunta envolver risco jurídico, alerte claramente sobre as consequências.
        Se a pergunta for ambígua, peça mais detalhes sobre o tipo de evento e localização.`,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Legal Error:", error);
    return "Desculpe, o sistema jurídico está temporariamente indisponível. Consulte um advogado humano para urgências.";
  }
};

interface AccountingContext {
  totalSpent?: number;
  balance?: number;
  spendingLimit?: number;
  spentToday?: number;
  transactionCount?: number;
}

export const askAccountingAdvisor = async (question: string, context?: AccountingContext) => {
  try {
    const contextLines = context
      ? [
          `Total já gasto: R$ ${context.totalSpent?.toLocaleString('pt-BR') ?? 'N/D'}`,
          `Saldo disponível: R$ ${context.balance?.toLocaleString('pt-BR') ?? 'N/D'}`,
          `Orçamento aprovado: R$ ${context.spendingLimit?.toLocaleString('pt-BR') ?? 'N/D'}`,
          `Gasto hoje: R$ ${context.spentToday?.toLocaleString('pt-BR') ?? 'N/D'}`,
          `Número de lançamentos registrados: ${context.transactionCount ?? 'N/D'}`,
        ].join('\n')
      : '';

    const fullPrompt = `${contextLines ? `Contexto financeiro atual:\n${contextLines}\n\n` : ''}Pergunta do usuário: ${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: `Você é um contador especializado em gestão financeira de eventos culturais, esportivos e corporativos no Brasil.
        Suas respostas devem cobrir:
        - Prestação de contas para eventos incentivados (Lei Rouanet, ProAC, Lei do Audiovisual)
        - Orçamentos e controle de despesas de eventos
        - Notas fiscais, recibos e documentação contábil
        - Contratos com fornecedores e artistas
        - Relatórios financeiros e demonstrativos
        - Impostos e obrigações tributárias (ISS, INSS, IR)
        - Compliance financeiro e auditoria
        Estruture a resposta indicando:
        - interpretação contábil e limites relevantes;
        - documentos exigidos para prestação de contas;
        - boas práticas de gestão financeira de eventos.
        Se a pergunta não for sobre contabilidade de eventos, alerte que está fora do escopo.`,
      },
    });
    return response.text;
  } catch (error) {
    console.error('Gemini Accounting Error:', error);
    return 'Sistema contábil indisponível no momento. Tente novamente em alguns instantes ou valide com sua contabilidade.';
  }
};
