
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  UNISEX = 'Unisex'
}

export enum ClothingCategory {
  JEANS = 'Jeans',
  TOPS = 'Tops',
  DRESSES = 'Dresses',
  JACKETS = 'Jackets'
}

export enum FitPreference {
  TIGHT = 'Tight',
  REGULAR = 'Regular',
  BAGGY = 'Baggy'
}

export enum MaterialType {
  DENIM = 'Denim',
  COTTON = 'Cotton',
  STRETCH = 'Stretch Blend',
  LINEN = 'Linen'
}

export interface SizeSpecs {
  chest?: number;
  waist?: number;
  hips?: number;
  inseam?: number;
  length?: number;
}

export interface BodyMeasurements {
  height?: number;
  weight?: number;
  waist?: number;
  hips?: number;
  inseam?: number;
  chest?: number;
  shoulders?: number;
  unit: 'cm' | 'inch';
}

export interface UserProfile {
  gender: Gender;
  category: ClothingCategory;
  fitPreference: FitPreference;
  material: MaterialType;
  measurements?: BodyMeasurements;
  baseline?: string;
  images?: string[];
}

export interface HeatmapZone {
  name: string;
  status: 'tight' | 'perfect' | 'loose';
  label: string;
}

export interface Product {
  id: string;
  name: string;
  brandId: string;
  price: string;
  image: string;
  category: ClothingCategory;
  material: string;
  fit_type: 'slim' | 'regular' | 'relaxed';
  size_chart: {
    unit: 'cm' | 'inch';
    sizes: Record<string, SizeSpecs>;
  };
}

export interface Brand {
  id: string;
  name: string;
  tendency: string; 
  logo: string;
  // Added size_chart to satisfy legacy sizingEngine.ts requirements
  size_chart: Array<{ size: string; waist?: number; chest?: number; }>;
}

export interface FitRecommendation {
  recommended_size: string;
  confidence: number;
  heatmap: Record<string, 'red' | 'green' | 'blue'>;
  explanation: string;
  sku: string;
}

export interface VisionFitSignals {
  waist_fit: string;
  hip_fit: string;
  length: string;
  overall_silhouette: string;
  overall_fit: string;
  heatmap?: HeatmapZone[];
}
