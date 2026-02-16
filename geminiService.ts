
import { GoogleGenAI } from "@google/genai";

// Always initialize with strictly process.env.API_KEY as per coding guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPerformanceSummary = async (keeperName: string, evaluationData: any, scoutData: any) => {
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
