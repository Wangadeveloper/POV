
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, VisionFitSignals, BodyMeasurements, Product, FitRecommendation } from '../types';

// Use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * The 'Magic Moment' Sizing Engine using Gemini 3 Pro reasoning.
 */
export const checkFitAPI = async (product: Product, userProfile: UserProfile): Promise<FitRecommendation> => {
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    Act as a Master Digital Tailor for POV (Point Of View).
    
    PRODUCT DATA:
    ${JSON.stringify(product, null, 2)}
    
    USER PROFILE:
    ${JSON.stringify(userProfile, null, 2)}
    
    TASK:
    1. Reason about the fit based on the product's category, material, and fit_type.
    2. Compare user measurements (or inferred dimensions from baseline) against the size_chart.
    3. If material is rigid (e.g., non-stretch denim), prioritize exact or slightly loose waist fits.
    4. If product is a Top, prioritize Chest and Shoulders. If Trousers, prioritize Waist and Inseam.
    5. Determine the 'Magic' size.
    
    OUTPUT FORMAT (JSON):
    {
      "recommended_size": "string",
      "confidence": number (0-1),
      "heatmap": {
        "chest": "red | green | blue",
        "waist": "red | green | blue",
        "hips": "red | green | blue",
        "inseam": "red | green | blue"
      },
      "explanation": "Short, human-friendly explanation of why this fits.",
      "sku": "string (brand-size-code)"
    }
    
    Heatmap classification:
    - Red: Tight / restrictive
    - Green: Ideal fit
    - Blue: Loose / relaxed
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommended_size: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          heatmap: {
            type: Type.OBJECT,
            properties: {
              chest: { type: Type.STRING },
              waist: { type: Type.STRING },
              hips: { type: Type.STRING },
              inseam: { type: Type.STRING }
            }
          },
          explanation: { type: Type.STRING },
          sku: { type: Type.STRING }
        },
        required: ["recommended_size", "confidence", "heatmap", "explanation", "sku"]
      }
    }
  });

  return JSON.parse(response.text);
};

/**
 * Generates a descriptive explanation for sizing logic (used by sizingEngine.ts)
 */
export const getFitExplanation = async (profile: UserProfile, brandName: string, finalSize: string, deltaInfo: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain why size ${finalSize} of ${brandName} is recommended. Logic details: ${deltaInfo}. User profile: ${JSON.stringify(profile)}`,
  });
  return response.text || "Perfect alignment based on your reference profile.";
};

export const generateVirtualTryOn = async (userImageBase64: string, product: Product, profile: UserProfile): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  const userImagePart = {
    inlineData: {
      data: userImageBase64.split(',')[1],
      mimeType: 'image/jpeg'
    }
  };
  const prompt = `Editorial fashion try-on: Dress the person in the provided image in ${product.name}. High-end photography style.`;
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [userImagePart, { text: prompt }] },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image generated");
};

export const analyzeVisionFit = async (images: string[]): Promise<VisionFitSignals> => {
  const model = 'gemini-3-flash-preview';
  const imageParts = images.map(img => ({
    inlineData: { data: img.split(',')[1], mimeType: 'image/jpeg' }
  }));
  const prompt = `Analyze body proportions from photos. Return JSON with heatmap: Chest, Waist, Hips, Inseam.`;
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [...imageParts, { text: prompt }] },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
};

export const validateInput = async (measurements: BodyMeasurements): Promise<{ isValid: boolean; warning?: string }> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Validate fashion measurements: ${JSON.stringify(measurements)}. Return JSON: {isValid: boolean, warning: string}`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
};
