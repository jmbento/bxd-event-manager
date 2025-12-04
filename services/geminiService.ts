
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
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
        systemInstruction: `Você é um advogado especialista em Direito Eleitoral Brasileiro, focado nas regras do TSE (Tribunal Superior Eleitoral) para campanhas municipais. 
        Suas respostas devem ser baseadas na Lei nº 9.504/1997 (Lei das Eleições) e na Resolução TSE nº 23.610/2019.
        Seja direto, pragmático e cite a base legal quando possível.
        Se a pergunta for sobre algo proibido (ex: compra de voto, brindes), alerte severamente sobre o risco de cassação de chapa.
        Se a pergunta for ambígua, peça mais detalhes.`,
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
          `Limite TSE: R$ ${context.spendingLimit?.toLocaleString('pt-BR') ?? 'N/D'}`,
          `Gasto hoje: R$ ${context.spentToday?.toLocaleString('pt-BR') ?? 'N/D'}`,
          `Número de lançamentos registrados: ${context.transactionCount ?? 'N/D'}`,
        ].join('\n')
      : '';

    const fullPrompt = `${contextLines ? `Contexto financeiro atual:\n${contextLines}\n\n` : ''}Pergunta do usuário: ${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: `Você é um contador especializado em prestação de contas eleitorais brasileiras.
        Responda com base na Lei nº 9.504/1997, na Resolução TSE nº 23.607/2019 e manuais do SPCE.
        Estruture a resposta indicando:
        - interpretação contábil e limites relevantes;
        - documentos oficiais exigidos (quando aplicável);
        - passos recomendados para lançamento no SPCE ou geração de relatório.
        Se a pergunta não for contábil/eleitoral, alerte que está fora do escopo.`,
      },
    });
    return response.text;
  } catch (error) {
    console.error('Gemini Accounting Error:', error);
    return 'Sistema contábil indisponível no momento. Tente novamente em alguns instantes ou valide com sua contabilidade.';
  }
};
