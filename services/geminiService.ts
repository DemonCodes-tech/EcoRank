import { GoogleGenAI, Type } from "@google/genai";
import { EcoAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeEcoAction = async (actionDescription: string): Promise<EcoAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Evaluate the following eco-friendly action: "${actionDescription}". 
      Assign a point value between 10 and 100 based on the positive environmental impact and effort. 
      Provide a short, encouraging 1-sentence comment. 
      Categorize it into one word (e.g., Recycling, Energy, Transport, Diet, Activism).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.INTEGER, description: "Points awarded (10-100)" },
            comment: { type: Type.STRING, description: "Short encouraging feedback" },
            category: { type: Type.STRING, description: "One word category" }
          },
          required: ["points", "comment", "category"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as EcoAnalysisResult;
  } catch (error) {
    console.error("Gemini analysis failed", error);
    // Fallback if API fails or key is missing
    return {
      points: 15,
      comment: "Great job taking care of the planet! (AI Offline)",
      category: "General"
    };
  }
};