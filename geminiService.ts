import { GoogleGenAI, Type } from "@google/genai";
import { EcoAnalysisResult } from "./types";

// Use the environment variable for the API key
const apiKey = process.env.GEMINI_API_KEY;

// Initialize the SDK directly with your key
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeEcoAction = async (
  actionDescription: string, 
  mediaBase64?: string, 
  mimeType?: string,
  isLowPowerMode: boolean = false,
  locationData?: { lat: number, lng: number } | null
): Promise<EcoAnalysisResult> => {
  
    // 1. Guard check for the API key
  if (!apiKey) {
    console.error("API Key is missing. Check your .env configuration.");
    return {
        points: 0,
        comment: "System Error: API Key Missing.",
        category: "Error",
        isVerified: false,
        confidenceScore: 0
    };
  }

  try {
    // 2. Build the parts array for the AI
    const parts: any[] = [];
    
    // Add media if provided
    if (mediaBase64 && mimeType) {
      // Clean mimeType (e.g., 'video/webm;codecs=vp9' -> 'video/webm')
      const cleanMimeType = mimeType.split(';')[0].trim();
      
      if (cleanMimeType) {
        parts.push({
          inlineData: {
            mimeType: cleanMimeType,
            data: mediaBase64
          }
        });
      }
    }

    // Add the strict referee text prompt
    parts.push({
      text: `You are an ELITE AI sustainability referee and dynamic scoring system.
      
      User Claim: "${actionDescription}"
      
      **MISSION**: Verify genuine eco-actions and calculate a dynamic Sustainability Score. You must be extremely smart and observant.

      **ANTI-CHEATING & FRAUD DETECTION (CRITICAL)**:
      1. **Image Manipulation**: Scrutinize the image/video for signs of Photoshop, AI generation artifacts, unnatural lighting, or inconsistent shadows.
      2. **Video Repetition**: If a video is provided, check for looping frames, unnatural cuts, or signs of a reused clip.
      3. **Location Cross-Reference**: ${locationData ? `The user's device reported location is Latitude: ${locationData.lat}, Longitude: ${locationData.lng}. Check if the background environment is plausible for a real-world location and not a green screen or digitally altered background.` : 'No location data provided. Rely strictly on visual evidence.'}
      4. **Environmental Context**: Analyze the background to ensure it aligns with typical outdoor or indoor environments where eco-actions occur, rather than artificial settings like studios or green screens. Check for natural lighting conditions and common environmental cues (e.g., presence of trees, sky, buildings, or typical indoor elements). If the background seems artificial or inconsistent with a real-world location, reduce the confidence score and add a comment like 'Background context seems artificial or inconsistent.'
      If ANY fraud is detected, set isVerified to false, points to 0, and mention the fraud in the comment.

      **TRASH & TRASH CAN IDENTIFICATION TRAINING**:
      1. **The Receptacle**: You MUST identify a valid trash can, recycling bin, compost bin, or public waste receptacle in the image/video. Look for typical bin shapes, plastic liners, recycling symbols, or designated waste areas.
      2. **The Trash**: Identify the specific piece of trash. Look for crumpling, dents, tears, irregular shapes, stains, residue, or moisture.
      3. **The Action**: The object must be visibly entering or inside the valid receptacle. If the user is just holding trash in a room without a bin, REJECT it.
      4. **Anti-Cheat**: Reject images of clean, unused items (like a full water bottle or a clean piece of paper) being thrown away. Reject images of computer screens showing trash.

      **DYNAMIC SCORING SYSTEM (0-50 Points)**:
      Calculate a precise score based on the following criteria:
      1. **Material Impact (1-20 pts)**: E-waste/Batteries (20) > Plastic/Metal recycling (15) > Composting (10) > Paper (5) > General Landfill Trash (2).
      2. **Volume/Effort (1-15 pts)**: Large bags of trash or multiple items (15) > Medium items like bottles (8) > Tiny items like wrappers (2).
      3. **Action Quality (1-15 pts)**: Perfectly sorted clean recyclables (15) > Standard disposal (8) > Sloppy disposal (2).

      **DANGEROUS ITEM MULTIPLIER (x2)**:
      If the item being disposed of is dangerous (e.g., broken glass, sharp metal, hazardous chemicals, exposed batteries, medical waste), DOUBLE the final calculated points (up to 100 points max). Mention the danger bonus in your comment!

      **SCORE TIERS**:
      - **0 PTS (REJECT)**: No trash can visible, no trash visible, fake action, clean/unused item, or not an eco-action. Set isVerified to false.
      - **1-15 PTS (BASIC)**: E.g., Throwing a single small wrapper into a general trash can.
      - **16-35 PTS (GOOD)**: E.g., Properly recycling a plastic bottle, aluminum can, or composting an apple core in the correct bin.
      - **36-50 PTS (EXCELLENT)**: E.g., Disposing of multiple items, recycling e-waste, or cleaning up significant litter into a bin.
      - **50-100 PTS (DANGEROUS)**: E.g., Safely disposing of broken glass or hazardous waste.

      **CONFIDENCE SCORE**:
      You MUST provide a \`confidenceScore\` between 0 and 100. This represents how sure you are that the video is real, authentic, and not manipulated or fake. 
      - 90-100: Extremely clear, obviously real, no signs of tampering.
      - 50-89: Looks real but maybe slightly blurry or less clear.
      - 0-49: Suspicious, unclear, potential fraud, or hard to verify.

      Output JSON only.`
    });

    // 3. Send the request to Gemini
    const modelName = isLowPowerMode ? "gemini-3-flash-preview" : "gemini-3.1-pro-preview";
    const response = await ai.models.generateContent({
      model: modelName, 
      contents: { parts: parts }, 
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: { type: Type.INTEGER, description: "Dynamic score from 0 to 100 based on the scoring system rubric" },
            comment: { type: Type.STRING, description: "Short feedback explaining the score and item identified" },
            category: { type: Type.STRING, description: "One word category (e.g. Plastic, Paper, Organic, Metal, E-Waste, Trash, Dangerous)" },
            isVerified: { type: Type.BOOLEAN, description: "True if action looks legitimate, False if fake/unclear" },
            confidenceScore: { type: Type.INTEGER, description: "Percentage from 0 to 100 indicating how sure the AI is that the video is real and authentic" }
          },
          required: ["points", "comment", "category", "isVerified", "confidenceScore"],
        },
      },
    });

    let text = response.text;
    
    // 4. Handle Empty Responses
    if (!text) {
      console.warn("Empty response from AI, possibly blocked by safety filters.");
      return {
          points: 0,
          comment: "Analysis inconclusive. Please try a clearer angle.",
          category: "Unknown",
          isVerified: false,
          confidenceScore: 0
      };
    }

    // FIX: Safely strip any potential markdown wrapping (```json ... ```) before parsing
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

    // 5. Return the parsed JSON
    return JSON.parse(text) as EcoAnalysisResult;

  } catch (error: any) {
    console.error("Gemini analysis failed", error);
    
    // Handle typical API errors
    let comment = "Connection error. Please retry.";
    if (error.message && error.message.includes('413')) {
        comment = "Video too large. Please record a shorter clip (max 30s).";
    }

    return {
      points: 0,
      comment: comment,
      category: "Error",
      isVerified: false,
      confidenceScore: 0
    };
  }
};