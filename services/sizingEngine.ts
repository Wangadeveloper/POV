
import { Brand, UserProfile, FitRecommendation, BodyMeasurements, FitPreference, MaterialType } from '../types';
import { BRANDS, UNIT_CONVERSION } from '../constants';
import { getFitExplanation } from './geminiService';

/**
 * Sizing Engine logic
 * 1. Normalize measurements to CM
 * 2. Find the closest match in the brand size chart
 * 3. Adjust for material (stretch) and fit preference
 * 4. Call Gemini for qualitative explanation
 */
export const calculateRecommendations = async (profile: UserProfile): Promise<FitRecommendation[]> => {
  const results: FitRecommendation[] = [];

  // 1. Normalize measurements
  const measurements = normalizeMeasurements(profile.measurements);
  if (!measurements) {
      // If we only have baseline, we'd ideally map baseline to measurements first.
      // For MVP, if no measurements, we use a default logic or mock baseline mapping.
      return [];
  }

  for (const brand of BRANDS) {
    let bestSize = brand.sizeChart[0];
    let minDiff = Infinity;

    // Basic matching logic (prioritizing waist for bottom-wear)
    for (const size of brand.sizeChart) {
        if (!size.waist) continue;
        const diff = Math.abs(size.waist - measurements.waist!);
        if (diff < minDiff) {
            minDiff = diff;
            bestSize = size;
        }
    }

    // Apply adjustments
    const { finalSize, warnings, score } = adjustForFactors(brand, bestSize, profile);

    const deltaInfo = `Waist delta: ${Math.round(bestSize.waist! - measurements.waist!)}cm. Preference: ${profile.fitPreference}. Material: ${profile.material}`;
    const reasoning = await getFitExplanation(profile, brand.name, finalSize, deltaInfo);

    results.push({
      brandId: brand.id,
      brandName: brand.name,
      recommendedSize: finalSize,
      fitAssessment: `${brand.tendency}`,
      warnings,
      confidenceScore: score,
      reasoning
    });
  }

  return results;
};

const normalizeMeasurements = (m?: BodyMeasurements): BodyMeasurements | undefined => {
  if (!m) return undefined;
  if (m.unit === 'cm') return m;
  
  return {
    ...m,
    waist: m.waist ? m.waist * UNIT_CONVERSION.INCH_TO_CM : undefined,
    hips: m.hips ? m.hips * UNIT_CONVERSION.INCH_TO_CM : undefined,
    inseam: m.inseam ? m.inseam * UNIT_CONVERSION.INCH_TO_CM : undefined,
    unit: 'cm'
  };
};

const adjustForFactors = (brand: Brand, base: any, profile: UserProfile) => {
    let finalSize = base.size;
    const warnings: string[] = [];
    let score = 90;

    // Material logic
    if (profile.material === MaterialType.STRETCH) {
        score += 5;
    } else if (profile.material === MaterialType.DENIM && profile.fitPreference === FitPreference.TIGHT) {
        warnings.push("Rigid denim - might feel restrictive");
        score -= 10;
    }

    // Fit preference logic
    if (profile.fitPreference === FitPreference.BAGGY) {
        // Try to find one size up if possible
        const idx = brand.sizeChart.findIndex(s => s.size === finalSize);
        if (idx < brand.sizeChart.length - 1) {
            finalSize = brand.sizeChart[idx + 1].size;
            warnings.push("Sized up for baggy preference");
        }
    }

    return { finalSize, warnings, score: Math.min(100, score) };
};
