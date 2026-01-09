
import { Brand, ClothingCategory, Product } from './types';

export const BRANDS: Brand[] = [
  {
    id: 'levis',
    name: "Levi's",
    tendency: "True to size",
    logo: "https://logo.clearbit.com/levis.com",
    size_chart: [
      { size: '28', waist: 71 },
      { size: '30', waist: 76 },
      { size: '32', waist: 81 },
      { size: '34', waist: 86 }
    ]
  },
  {
    id: 'zara',
    name: "Zara",
    tendency: "Runs small",
    logo: "https://logo.clearbit.com/zara.com",
    size_chart: [
      { size: '34', waist: 62 },
      { size: '36', waist: 66 },
      { size: '38', waist: 70 },
      { size: '40', waist: 74 }
    ]
  },
  {
    id: 'uniqlo',
    name: "Uniqlo",
    tendency: "Generous fit",
    logo: "https://logo.clearbit.com/uniqlo.com",
    size_chart: [
      { size: 'S', waist: 68 },
      { size: 'M', waist: 74 },
      { size: 'L', waist: 82 },
      { size: 'XL', waist: 90 }
    ]
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    brandId: 'levis',
    name: '501® Original Fit Jeans',
    price: '$98.00',
    category: ClothingCategory.JEANS,
    material: '100% Cotton, Non-Stretch',
    fit_type: 'regular',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400',
    size_chart: {
      unit: 'inch',
      sizes: {
        '28': { waist: 28, hips: 35, inseam: 32 },
        '30': { waist: 30, hips: 37, inseam: 32 },
        '32': { waist: 32, hips: 39, inseam: 32 },
        '34': { waist: 34, hips: 41, inseam: 32 }
      }
    }
  },
  {
    id: 'p5',
    brandId: 'uniqlo',
    name: 'Supima Cotton Crew Neck',
    price: '$19.90',
    category: ClothingCategory.TOPS,
    material: '95% Supima Cotton, 5% Spandex',
    fit_type: 'regular',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400',
    size_chart: {
      unit: 'cm',
      sizes: {
        'S': { chest: 92, length: 66 },
        'M': { chest: 98, length: 68 },
        'L': { chest: 104, length: 70 },
        'XL': { chest: 110, length: 72 }
      }
    }
  }
];

export const UNIT_CONVERSION = {
  INCH_TO_CM: 2.54,
  CM_TO_INCH: 0.393701
};
