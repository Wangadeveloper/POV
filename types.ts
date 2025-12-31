
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

export interface BodyMeasurements {
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

export interface BrandSize {
  size: string;
  waist?: number;
  hips?: number;
  chest?: number;
  inseam?: number;
}

export interface Brand {
  id: string;
  name: string;
  tendency: string; // e.g., "Runs small", "True to size"
  logo: string;
  sizeChart: BrandSize[];
}

export interface Product {
  id: string;
  name: string;
  brandId: string;
  price: string;
  image: string;
  category: ClothingCategory;
}

export interface FitRecommendation {
  brandId: string;
  brandName: string;
  recommendedSize: string;
  fitAssessment: string;
  warnings: string[];
  confidenceScore: number;
  reasoning: string;
}

export interface VisionFitSignals {
  waist_fit: string;
  hip_fit: string;
  length: string;
  overall_silhouette: string;
  overall_fit: string;
}
