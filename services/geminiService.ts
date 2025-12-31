
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, VisionFitSignals, BodyMeasurements, Product } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Generates a virtual try-on visualization.
 */
export const generateVirtualTryOn = async (userImageBase64: string, product: Product, profile: UserProfile): Promise<string> => {
  // Use gemini-2.5-flash-image for image editing/generation
  const model = 'gemini-2.5-flash-image';
  
  const userImagePart = {
    inlineData: {
      data: userImageBase64.split(',')[1],
      mimeType: 'image/jpeg'
    }
  };

  const prompt = `Perform a high-end virtual try-on. 
    Take the person in the provided image and dress them in the "${product.name}" by "${product.brandId}". 
    The item is a ${product.category} made of ${profile.material}. 
    Style it with a ${profile.fitPreference} fit. 
    Maintain the person's original pose, background, and lighting. 
    The output should look like a professional fashion editorial.
    Focus on realistic fabric draping and texture.`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [userImagePart, { text: prompt }] },
  });

  // Find the image part in the response
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image was generated");
};

/**
 * Analyzes clothing fit from images using Gemini Vision.
 */
export const analyzeVisionFit = async (images: string[]): Promise<VisionFitSignals> => {
  const model = 'gemini-3-flash-preview';
  
  const imageParts = images.map(img => ({
    inlineData: {
      data: img.split(',')[1],
      mimeType: 'image/jpeg'
    }
  }));

  const prompt = `Analyze the clothing fit in these photos. 
    Focus ONLY on how the fabric interacts with the wearer's frame. 
    DO NOT estimate weight, health, or body measurements. 
    DO NOT identify faces.
    
    Evaluate:
    - waist_fit: (tight, snug, perfect, loose, gaping)
    - hip_fit: (tight, snug, perfect, loose)
    - length: (short, regular, slightly long, long)
    - overall_silhouette: (skinny, straight, tapered, wide, flare)
    - overall_fit: (undersized, regular, relaxed, oversized)`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [...imageParts, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          waist_fit: { type: Type.STRING },
          hip_fit: { type: Type.STRING },
          length: { type: Type.STRING },
          overall_silhouette: { type: Type.STRING },
          overall_fit: { type: Type.STRING }
        },
        required: ["waist_fit", "hip_fit", "length", "overall_silhouette", "overall_fit"]
      }
    }
  });

  return JSON.parse(response.text);
};

/**
 * Reasons about fit based on measurements or baseline strings.
 */
export const getFitExplanation = async (
  profile: UserProfile, 
  brandName: string, 
  recSize: string,
  delta: string
): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `User Profile:
    - Gender: ${profile.gender}
    - Category: ${profile.category}
    - Material: ${profile.material}
    - Preference: ${profile.fitPreference}
    - Measurements: ${JSON.stringify(profile.measurements || {})}
    - Baseline: ${profile.baseline || 'N/A'}

    The engine recommended size "${recSize}" for brand "${brandName}".
    Calculation notes: ${delta}

    Write a human-friendly, supportive, and non-judgmental explanation of how this will feel.
    Example: "The waist will feel slightly loose (about 2cm). The length runs long, so we suggest a cuff."
    Keep it under 3 sentences.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return response.text.trim();
};

/**
 * Validates and normalizes inputs.
 */
export const validateInput = async (measurements: BodyMeasurements): Promise<{ isValid: boolean; warning?: string }> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Validate these body measurements for clothing sizing (unit: ${measurements.unit}):
    ${JSON.stringify(measurements)}
    Check if they are physically impossible or likely typos (e.g., 200cm waist).
    Return JSON: { "isValid": boolean, "warning": "string message" }`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN },
          warning: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
};
