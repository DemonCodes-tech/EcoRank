import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  // We need a test image. Let's just create a simple prompt first.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: 'A 16-bit pixel art of a cute dog on a solid #00FF00 green background.',
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      fs.writeFileSync('test-dog.png', Buffer.from(part.inlineData.data, 'base64'));
      console.log('Saved test-dog.png');
    }
  }
}

test().catch(console.error);
