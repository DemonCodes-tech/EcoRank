import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate() {
  console.log('Generating pixel-cat-gray.png...');
  try {
    const response1 = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: 'A high quality 16-bit pixel art of a chubby grey Scottish Fold cat with big bright blue eyes, sitting on a white lace doily on a wooden table. The cat looks directly at the viewer. Clean pixel art style, isolated on a dark slate grey background.',
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });
    
    for (const part of response1.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        fs.writeFileSync(path.join(process.cwd(), 'public', 'pixel-cat-gray.png'), Buffer.from(base64EncodeString, 'base64'));
        console.log('Saved pixel-cat-gray.png');
      }
    }
  } catch (e) {
    console.error('Error generating pixel-cat-gray.png:', e);
  }

  console.log('Generating pixel-cat-white.png...');
  try {
    const response2 = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: 'A cute 16-bit pixel art of a white cat with big bright blue eyes sitting down and licking its nose with its pink tongue. Clean pixel art style, isolated on a dark slate grey background.',
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });
    
    for (const part of response2.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        fs.writeFileSync(path.join(process.cwd(), 'public', 'pixel-cat-white.png'), Buffer.from(base64EncodeString, 'base64'));
        console.log('Saved pixel-cat-white.png');
      }
    }
  } catch (e) {
    console.error('Error generating pixel-cat-white.png:', e);
  }
}

generate().catch(console.error);
