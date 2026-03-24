import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const CatImageGenerator: React.FC<{
  type: 'pixel-cat' | 'licking-cat';
  prompt: string;
  className?: string;
}> = ({ type, prompt, className }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateImage = async () => {
      try {
        const cached = localStorage.getItem(`cat_image_${type}`);
        if (cached) {
          setImageUrl(cached);
          setLoading(false);
          return;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: prompt,
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K"
            }
          }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const url = `data:image/png;base64,${base64EncodeString}`;
            setImageUrl(url);
            localStorage.setItem(`cat_image_${type}`, url);
            break;
          }
        }
      } catch (error) {
        console.error(`Failed to generate ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    generateImage();
  }, [type, prompt]);

  if (loading) {
    return <div className={`animate-pulse bg-white/10 rounded-xl flex items-center justify-center ${className}`}>
      <span className="text-white/50 text-xs text-center px-2">Generating Cat...</span>
    </div>;
  }

  if (!imageUrl) {
    return <div className={`bg-white/5 rounded-xl flex items-center justify-center ${className}`}>
      <span className="text-white/30 text-xs">Failed to load</span>
    </div>;
  }

  return <img src={imageUrl} alt={type} className={className} referrerPolicy="no-referrer" />;
};
