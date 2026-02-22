
import { GoogleGenAI } from "@google/genai";

// Always initialize with strictly process.env.API_KEY as per coding guidelines
// Lazy initialization of the AI client to allow the app to run without an API key.
let ai: GoogleGenAI | null = null;
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("VITE_GEMINI_API_KEY is not set. AI features will be disabled.");
}

interface EvaluationData {
  subject: string;
  A: number;
  fullMark: number;
}

interface ScoutData {
  totalSaves: number;
  cleanSheets: number;
  totalGames: number;
}

export const getPerformanceSummary = async (keeperName: string, evaluationData: EvaluationData[], scoutData: ScoutData) => {
  try {
    const prompt = `
      Você é um especialista em treinamento de goleiros de elite. 
      Analise os dados do goleiro ${keeperName}.
      Avaliações Recentes: ${JSON.stringify(evaluationData)}
      Scout de Jogo Recente: ${JSON.stringify(scoutData)}
      
      Forneça um breve resumo técnico (máximo 150 palavras) em português destacando:
      1. Principal ponto forte atual.
      2. Área crítica de desenvolvimento.
      3. Uma sugestão prática de exercício.
    `;

    if (!ai) {
      return "Análise inteligente indisponível. Configure a VITE_GEMINI_API_KEY.";
    }

    // Use ai.models.generateContent with the appropriate gemini-3 model
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Access text directly from the response property
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar a análise inteligente no momento.";
  }
};
