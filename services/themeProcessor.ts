import { GoogleGenAI, Type } from '@google/genai';

export const processThemeImageLocally = async (imageBase64: string) => {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  
  // Use the API key injected by Vite
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  // 1. Analyze the image
  const analyzeResponse = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        },
        {
          text: 'Analyze this image. Is it too abstract to animate as a distinct floating sprite? If it is a distinct object, character, or item, it is not abstract. If it is a landscape, pattern, or just colors, it is abstract. Also provide a short description of the main subject to be used as a prompt for a pixel art generator, and suggest an animation style (float, bounce, spin, pulse). Return JSON.'
        }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isAbstract: { type: Type.BOOLEAN },
          subjectDescription: { type: Type.STRING },
          animationStyle: { type: Type.STRING, description: 'One of: float, bounce, spin, pulse, none' }
        },
        required: ['isAbstract', 'subjectDescription', 'animationStyle']
      }
    }
  });

  let analysisText = analyzeResponse.text || '{}';
  const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    analysisText = jsonMatch[0];
  }
  const analysis = JSON.parse(analysisText);

  if (analysis.isAbstract) {
    return { isAbstract: true };
  }

  // 2. Generate pixel art sprite
  const generateResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A 16-bit pixel art sprite of ${analysis.subjectDescription}. Clean pixel art style, isolated on a solid #00FF00 green background.`
        }
      ]
    }
  });

  let generatedBase64 = null;
  for (const part of generateResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      generatedBase64 = part.inlineData.data;
      break;
    }
  }

  if (!generatedBase64) {
    throw new Error('Failed to generate pixel art image');
  }

  return {
    isAbstract: false,
    animationStyle: analysis.animationStyle,
    pixelArtImage: `data:image/png;base64,${generatedBase64}`
  };
};
