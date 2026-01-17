
import { GoogleGenAI } from "@google/genai";
import { StylePreset } from "../types";

const PROMPT_TEMPLATES: Record<StylePreset, string> = {
  [StylePreset.STUDIO]: "A professional studio macro photograph of {fruit}. ONLY FRUIT. Sharp focus, dramatic side-lighting, dark elegant background, hyper-realistic textures, water droplets, cinematic composition. No people, no animals.",
  [StylePreset.SPLASH]: "A dynamic high-speed photograph of {fruit} falling into clear water with a dramatic splash. ONLY FRUIT. Transparent bubbles, frozen motion, bright lighting, hyper-detailed. No humans.",
  [StylePreset.NATURE]: "A rustic, natural shot of {fruit} on a wooden branch. ONLY FRUIT. Soft morning sunlight, organic texture, realistic shadows. No animals, no people.",
  [StylePreset.CREATIVE]: "An artistic composition featuring {fruit}. ONLY FRUIT. Floating elements, vibrant color grading, high-end commercial photography style. Eye-catching. No living beings other than the fruit.",
  [StylePreset.MINIMAL]: "A minimalist clean shot of {fruit} on a pure white surface. ONLY FRUIT. Soft neutral shadows, perfect symmetry, sophisticated aesthetic, extremely high detail. No background clutter."
};

export async function getRandomFruitIdea(): Promise<{ fruit: string; details: string; style: StylePreset }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const styles = Object.values(StylePreset);
  
  const prompt = `Suggest a visually stunning and interesting fruit or combination of fruits for a high-end realistic photography shoot. 
  STRICT RULE: Only real edible fruits. No fictional plants.
  Return ONLY a JSON object: {"fruit": "fruit name", "details": "short description"}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        systemInstruction: "You are a specialized fruit photographer assistant. You only deal with real, edible fruits."
      }
    });
    const idea = JSON.parse(response.text || '{"fruit": "Mango", "details": "con gotas de agua"}');
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    return { ...idea, style: randomStyle };
  } catch (error) {
    console.error("Error fetching fruit idea:", error);
    return { fruit: "Cerezas", details: "en un fondo oscuro", style: StylePreset.STUDIO };
  }
}

export async function generateFruitImage(fruit: string, style: StylePreset, extraDetails: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const basePrompt = PROMPT_TEMPLATES[style].replace('{fruit}', fruit);
  const finalPrompt = `STRICTLY ONLY FRUIT: ${basePrompt} ${extraDetails}. No people, no hands, no faces, no animals. Just the fruit. Realistic 8k photography.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: finalPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4", 
        },
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned. Check API quota.");
    }

    const candidate = response.candidates[0];
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data in response.");
  } catch (error: any) {
    console.error("Gemini Image Error:", error);
    if (error.status === 403) {
      throw new Error("Error 403: Tu clave de API no tiene permisos para generar imágenes. Asegúrate de que el modelo gemini-2.5-flash-image esté habilitado en tu proyecto de Google Cloud/AI Studio.");
    }
    throw error;
  }
}

export async function generatePostText(fruit: string, style: StylePreset, extraDetails: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const prompt = `Escribe un post de Facebook irresistible en español para una foto hiperrealista de ${fruit}.
  - Usa emojis de frutas.
  - Habla de frescura y sabor.
  - Incluye hashtags como #FrutaReal #Saludable.
  - NO menciones que es IA.
  - Solo el texto del post.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "¡La frescura de hoy! 🍎";
  } catch (error) {
    return "¡Increíble captura de frescura! 🍎✨ #FrutaFresca";
  }
}
