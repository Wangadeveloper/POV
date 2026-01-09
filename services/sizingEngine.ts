
import { Brand, UserProfile, FitRecommendation, BodyMeasurements, FitPreference, MaterialType } from '../types';
import { BRANDS, UNIT_CONVERSION } from '../constants';
// Correctly import getFitExplanation which is now exported in geminiService.ts
import { getFitExplanation } from './geminiService';

/**
 * Maps common brand baseline sizes to approximate body dimensions.
 * Fixes the "Levi's Bug" where a tag size needs to be translated to CM.
 */
const mapBaselineToDimensions = (baseline: string): Partial<BodyMeasurements> => {
  const lower = baseline.toLowerCase();
  const digits = lower.match(/\d+/);
  const sizeNum = digits ? parseInt(digits[0]) : null;

  if (!sizeNum) return {};

  // Levi's / Denim sizing (Tag = Waist in Inches)
  if (lower.includes("levi") || lower.includes("denim")) {
    return { 
      waist: sizeNum * UNIT_CONVERSION.INCH_TO_CM, 
      unit: 'cm' 
    };
  }

  // European Sizing (Zara/H&M)
  if (lower.includes("zara") || lower.includes("eu")) {
    // Approx mapping for Zara Women's: 34=62cm, 36=66cm, 38=70cm, 40=74cm
    const zaraMap: Record<number, number> = { 34: 62, 36: 66, 38: 70, 40: 74, 42: 78 };
    return { 
      waist: zaraMap[sizeNum] || (sizeNum * 1.8), // Fallback rough linear scale
      unit: 'cm' 
    };
  }

  // International Sizing (S/M/L)
  if (lower.includes("small") || lower === "s") return { waist: 68, unit: 'cm' };
  if (lower.includes("medium") || lower === "m") return { waist: 74, unit: 'cm' };
  if (lower.includes("large") || lower === "l") return { waist: 82, unit: 'cm' };

  return {};
};

/**
 * Sizing Engine logic
 */
export const calculateRecommendations = async (profile: UserProfile): Promise<FitRecommendation[]> => {
  const results: FitRecommendation[] = [];

  // Merge direct measurements with baseline inferences
  let inferredMeasurements: Partial<BodyMeasurements> = {};
  if (profile.baseline) {
    inferredMeasurements = mapBaselineToDimensions(profile.baseline);
  }

  const baseMeasurements = profile.measurements || { unit: 'cm' };
  const mergedMeasurements: BodyMeasurements = {
    ...baseMeasurements,
    waist: baseMeasurements.waist || inferredMeasurements.waist,
    unit: baseMeasurements.unit || 'cm'
  };

  const measurements = normalizeMeasurements(mergedMeasurements);
  if (!measurements || !measurements.waist) {
      return [];
  }

  for (const brand of BRANDS) {
    // Fixed: Property name corrected to size_chart to match updated Brand interface
    let bestSize = brand.size_chart[0];
    let minDiff = Infinity;

    for (const size of brand.size_chart) {
        if (!size.waist) continue;
        const diff = Math.abs(size.waist - measurements.waist!);
        if (diff < minDiff) {
            minDiff = diff;
            bestSize = size;
        }
    }

    const { finalSize, warnings, score } = adjustForFactors(brand, bestSize, profile);

    // High-fidelity prompt context for Gemini
    const deltaInfo = `
      CONVERT TAGGED BRAND SIZE TO BODY DIMENSIONS:
      User Baseline: ${profile.baseline || 'None'}
      Calculated Waist: ${Math.round(measurements.waist!)}cm
      Target Brand: ${brand.name}
      Target Size: ${finalSize} (Brand Chart: ${bestSize.waist}cm)
      Preference: ${profile.fitPreference}
      Material: ${profile.material}
    `;

    const reasoning = await getFitExplanation(profile, brand.name, finalSize, deltaInfo);

    // Fixed: Return object aligned with the FitRecommendation type definition
    results.push({
      recommended_size: finalSize,
      confidence: score / 100,
      heatmap: { waist: 'green' },
      explanation: reasoning,
      sku: `${brand.id}-${finalSize}`
    });
  }

  return results;
};

const normalizeMeasurements = (m: BodyMeasurements): BodyMeasurements => {
  if (m.unit === 'cm') return m;
  return {
    ...m,
    height: m.height ? m.height * UNIT_CONVERSION.INCH_TO_CM : undefined,
    waist: m.waist ? m.waist * UNIT_CONVERSION.INCH_TO_CM : undefined,
    hips: m.hips ? m.hips * UNIT_CONVERSION.INCH_TO_CM : undefined,
    chest: m.chest ? m.chest * UNIT_CONVERSION.INCH_TO_CM : undefined,
    inseam: m.inseam ? m.inseam * UNIT_CONVERSION.INCH_TO_CM : undefined,
    unit: 'cm'
  };
};

const adjustForFactors = (brand: Brand, base: any, profile: UserProfile) => {
    let finalSize = base.size;
    const warnings: string[] = [];
    let score = 92;

    if (profile.material === MaterialType.STRETCH) {
        score += 3;
    } else if (profile.material === MaterialType.DENIM && profile.fitPreference === FitPreference.TIGHT) {
        warnings.push("Rigid denim - limited stretch");
        score -= 8;
    }

    if (profile.fitPreference === FitPreference.BAGGY) {
        // Fixed: Property name corrected to size_chart
        const idx = brand.size_chart.findIndex(s => s.size === finalSize);
        if (idx !== -1 && idx < brand.size_chart.length - 1) {
            finalSize = brand.size_chart[idx + 1].size;
            warnings.push("Upsized for baggy aesthetic");
        }
    }

    return { finalSize, warnings, score: Math.min(100, score) };
};
