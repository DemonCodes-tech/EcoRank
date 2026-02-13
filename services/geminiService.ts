import { GoogleGenAI, Type } from "@google/genai";
import { EcoAnalysisResult } from "../types";

// Helper to safely get key and prevent crash if process is undefined
const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    console.error("Error accessing process.env.API_KEY", e);
    return undefined;
  }
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key_to_init' });

export const analyzeEcoAction = async (
  actionDescription: string, 
  mediaBase64?: string, 
  mimeType?: string
): Promise<EcoAnalysisResult> => {
  if (!apiKey) {
    console.error("API Key is missing. Check your .env configuration.");
    return {
        points: 0,
        comment: "System Error: API Key Missing.",
        category: "Error",
        isVerified: false
    };
  }

  try {
    const parts: any[] = [];
    
    // Add media if provided
    if (mediaBase64 && mimeType) {
      // Clean mimeType (remove parameters like codecs, e.g., 'video/webm;codecs=vp9' -> 'video/webm')
      const cleanMimeType = mimeType.split(';')[0].trim();
      
      parts.push({
        inlineData: {
          mimeType: cleanMimeType,
          data: mediaBase64
        }
      });
    }

    // Add text prompt
    parts.push({
      text: `You are an AI referee for a student eco-points competition.
      
      User Claim: "${actionDescription}"
      
      Your Task:
      1. Analyze the video/image evidence for an eco-friendly action (specifically throwing trash in a bin, recycling, or cleaning up).
      
      2. **LOW RESOLUTION PROTOCOL**:
         - The video might be low quality (480p) and fast. This is expected.
         - Focus on **MOTION VECTORS**: Objects moving from hand to bin.
         - Focus on **INTENT**: Does it look like they are disposing of something?
         - If you see a hand extending towards a bin/container and releasing, COUNT IT.
      
      3. **VERIFICATION RULES**:
         - **VERIFY (10 PTS)**: Valid disposal, even if blurry or dark.
         - **REJECT (0 PTS)**: Clearly unrelated footage (face only, gaming, ceiling) or obvious fake.
      
      Scoring Rules:
      - Verified Action: Award exactly 10 points.
      - Unverified/Fake: Award 0 points.
      
      Output JSON only.`
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.INTEGER, description: "Must be exactly 10 if verified, 0 if rejected" },
            comment: { type: Type.STRING, description: "Short feedback on the action" },
            category: { type: Type.STRING, description: "One word category (e.g. Recycling, Waste)" },
            isVerified: { type: Type.BOOLEAN, description: "True if action looks legitimate, False if fake/unclear" }
          },
          required: ["points", "comment", "category", "isVerified"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      // Safety filters might have blocked it
      console.warn("Empty response from AI, possibly blocked.");
      return {
          points: 0,
          comment: "Analysis inconclusive. Please try a clearer angle.",
          category: "Unknown",
          isVerified: false
      };
    }

    return JSON.parse(text) as EcoAnalysisResult;
  } catch (error: any) {
    console.error("Gemini analysis failed", error);
    
    // Handle typical 413 Payload Too Large or Timeout
    let comment = "Connection error. Please retry.";
    if (error.message && error.message.includes('413')) {
        comment = "Video too large. Please record a shorter clip (max 30s).";
    }

    return {
      points: 0,
      comment: comment,
      category: "Error",
      isVerified: false
    };
  }
};