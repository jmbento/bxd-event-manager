/**
 * Serviço para processamento de reuniões com IA
 * Handles transcrição de áudio e geração de atas estratégicas
 */

// Interface para resposta da IA
interface AIResponse {
  transcription: string;
  meetingMinutes: string;
  success: boolean;
  error?: string;
}

// Template da ata conforme especificado
const STRATEGIC_MEETING_TEMPLATE = `## 🎯 1. Auditoria do Propósito
* **Motivação Original:** {motivation}
* **Veredito de Eficiência:** {efficiency_verdict}

## 📝 2. Pauta Retroativa (O que foi discutido)
{agenda_items}

## 🔑 3. Decisões e Insights Chave
{key_decisions}

## 🚀 4. Plano de Ação (Next Steps)
| Tarefa | Responsável | Prioridade |
| :--- | :--- | :--- |
{action_items}

## ⚠️ 5. Pontos de Atenção / Bloqueios
{attention_points}

---
**Transcrição da Reunião:**
{full_transcription}`;

/**
 * Processa áudio e gera ata estratégica usando IA
 */
export class MeetingAIService {
  private static instance: MeetingAIService;
  
  // URLs dos serviços (configurar conforme ambiente)
  private readonly TRANSCRIPTION_API = '/api/transcribe'; // Whisper/Gemini
  private readonly AI_ANALYSIS_API = '/api/analyze-meeting'; // GPT-4/Gemini

  static getInstance(): MeetingAIService {
    if (!MeetingAIService.instance) {
      MeetingAIService.instance = new MeetingAIService();
    }
    return MeetingAIService.instance;
  }

  /**
   * Processa áudio da reunião e gera ata completa
   */
  async processAudioMeeting(
    audioBlob: Blob, 
    meetingTitle: string, 
    participants: string[]
  ): Promise<AIResponse> {
    try {
      // 1. Transcrever áudio
      console.log('🎤 Iniciando transcrição do áudio...');
      const transcription = await this.transcribeAudio(audioBlob);
      
      if (!transcription) {
        throw new Error('Falha na transcrição do áudio');
      }

      // 2. Analisar transcrição e gerar ata estratégica
      console.log('🧠 Analisando transcrição e gerando ata...');
      const meetingMinutes = await this.generateStrategicMinutes(
        transcription, 
        meetingTitle, 
        participants
      );

      return {
        transcription,
        meetingMinutes,
        success: true
      };

    } catch (error) {
      console.error('Erro no processamento da reunião:', error);
      return {
        transcription: '',
        meetingMinutes: this.getFallbackMinutes(meetingTitle, participants),
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Transcreve áudio usando Whisper/Gemini API
   */
  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    // Preparar FormData para upload
    const formData = new FormData();
    formData.append('audio', audioBlob, 'meeting.wav');
    formData.append('language', 'pt-BR');
    formData.append('model', 'whisper-1');

    try {
      // Opção 1: Whisper API (OpenAI)
      if (this.hasOpenAIKey()) {
        return await this.transcribeWithWhisper(formData);
      }
      
      // Opção 2: Gemini API (Google)
      if (this.hasGeminiKey()) {
        return await this.transcribeWithGemini(audioBlob);
      }

      // Opção 3: API local/customizada
      return await this.transcribeWithLocalAPI(formData);

    } catch (error) {
      console.error('Erro na transcrição:', error);
      return 'Transcrição não disponível - erro no processamento do áudio.';
    }
  }

  /**
   * Transcrição usando Whisper (OpenAI)
   */
  private async transcribeWithWhisper(formData: FormData): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  }

  /**
   * Transcrição usando Gemini (Google)
   */
  private async transcribeWithGemini(audioBlob: Blob): Promise<string> {
    // Converter para base64 para Gemini
    const base64Audio = await this.blobToBase64(audioBlob);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Transcreva este áudio em português brasileiro. Retorne apenas o texto transcrito:"
          }, {
            inline_data: {
              mime_type: "audio/wav",
              data: base64Audio
            }
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * Transcrição via API local
   */
  private async transcribeWithLocalAPI(formData: FormData): Promise<string> {
    const response = await fetch(this.TRANSCRIPTION_API, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Local transcription API error: ${response.status}`);
    }

    const data = await response.json();
    return data.transcription || '';
  }

  /**
   * Gera ata estratégica usando o framework especificado
   */
  private async generateStrategicMinutes(
    transcription: string,
    meetingTitle: string,
    participants: string[]
  ): Promise<string> {
    const analysisPrompt = `
# CONTEXTO E PERSONA
Você é um Gerente de Projetos Sênior e Analista de Negócios especialista em eficiência corporativa. Sua tarefa é analisar a transcrição de uma reunião gravada fornecida abaixo.

# OBJETIVO PRINCIPAL
Transformar o texto bruto da conversa em um documento estratégico. Não quero apenas um resumo; quero entender a "alma" da reunião: por que ela aconteceu, o que foi decidido e se ela foi útil.

# INSTRUÇÕES DE ANÁLISE (O "FRAMEWORK")
Analise o texto buscando responder explicitamente a estes 4 pilares:
1. O PROPÓSITO (O "Porquê"): Qual foi a dor, problema ou oportunidade que motivou esse encontro?
2. O CONTEÚDO (O "O que"): Quais tópicos foram debatidos para endereçar o propósito?
3. O RESULTADO (A "Conclusão"): O propósito foi atingido? Chegaram a um consenso?
4. A AÇÃO (O "E agora?"): Quem faz o que e quando?

# DADOS DA REUNIÃO
- **Título:** ${meetingTitle}
- **Participantes:** ${participants.join(', ')}
- **Data:** ${new Date().toLocaleDateString('pt-BR')}

# TRANSCRIÇÃO
${transcription}

# FORMATO DE SAÍDA
Gere a resposta em Markdown seguindo exatamente esta estrutura:

## 🎯 1. Auditoria do Propósito
* **Motivação Original:** (Identifique o motivo explícito ou implícito da reunião).
* **Veredito de Eficiência:** (A reunião cumpriu seu propósito? Responda: "Sim", "Parcialmente" ou "Não" e justifique em 1 frase).

## 📝 2. Pauta Retroativa (O que foi discutido)
(Liste os 3 a 5 principais tópicos discutidos, como se fosse a agenda da reunião).
* Tópico A
* Tópico B

## 🔑 3. Decisões e Insights Chave
(O que foi definido? O que aprendemos de novo? Use bullet points).

## 🚀 4. Plano de Ação (Next Steps)
(Crie uma tabela com as colunas: "Tarefa", "Responsável", "Prazo Estimado/Prioridade").
| Tarefa | Responsável | Prioridade |
| :--- | :--- | :--- |
| [Ação] | [Nome] | [Alta/Média/Baixa] |

## ⚠️ 5. Pontos de Atenção / Bloqueios
(Algo ficou sem resposta? Houve conflito ou incerteza sobre algum ponto? Liste aqui).

---
**Transcrição Completa:**
${transcription}`;

    try {
      // Usar Gemini/GPT para análise
      if (this.hasGeminiKey()) {
        return await this.analyzeWithGemini(analysisPrompt);
      }
      
      if (this.hasOpenAIKey()) {
        return await this.analyzeWithOpenAI(analysisPrompt);
      }

      // Fallback para API local
      return await this.analyzeWithLocalAPI(analysisPrompt);

    } catch (error) {
      console.error('Erro na análise da reunião:', error);
      return this.getFallbackMinutes(meetingTitle, participants, transcription);
    }
  }

  /**
   * Análise usando Gemini
   */
  private async analyzeWithGemini(prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini analysis error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * Análise usando OpenAI GPT
   */
  private async analyzeWithOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI analysis error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Análise via API local
   */
  private async analyzeWithLocalAPI(prompt: string): Promise<string> {
    const response = await fetch(this.AI_ANALYSIS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`Local AI analysis error: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis || '';
  }

  /**
   * Ata de fallback caso a IA falhe
   */
  private getFallbackMinutes(
    meetingTitle: string, 
    participants: string[], 
    transcription?: string
  ): string {
    return `## 🎯 1. Auditoria do Propósito
* **Motivação Original:** ${meetingTitle}
* **Veredito de Eficiência:** Processamento automático não disponível - revisar manualmente.

## 📝 2. Pauta Retroativa (O que foi discutido)
* Aguardando análise manual da transcrição
* Revisar áudio ou transcrição para identificar tópicos

## 🔑 3. Decisões e Insights Chave
* Revisar manualmente a transcrição para identificar decisões
* Completar esta seção após análise

## 🚀 4. Plano de Ação (Next Steps)
| Tarefa | Responsável | Prioridade |
| :--- | :--- | :--- |
| Revisar e completar ata manualmente | A definir | Alta |

## ⚠️ 5. Pontos de Atenção / Bloqueios
* Processamento automático indisponível
* Requer revisão manual da transcrição

---
**Transcrição da Reunião:**
${transcription || 'Transcrição não disponível - verifique o áudio gravado.'}`;
  }

  /**
   * Helper: converte Blob para Base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Verifica se tem chave da OpenAI
   */
  private hasOpenAIKey(): boolean {
    return !!(process.env.OPENAI_API_KEY || (window as any).OPENAI_API_KEY);
  }

  /**
   * Verifica se tem chave do Gemini
   */
  private hasGeminiKey(): boolean {
    return !!(process.env.GEMINI_API_KEY || (window as any).GEMINI_API_KEY);
  }
}

// Instância singleton
export const meetingAIService = MeetingAIService.getInstance();