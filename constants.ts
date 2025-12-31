
import { Brand, ClothingCategory, Product } from './types';

export const BRANDS: Brand[] = [
  {
    id: 'levis',
    name: "Levi's",
    tendency: "True to size",
    logo: "https://logo.clearbit.com/levis.com",
    sizeChart: [
      { size: '24', waist: 61, hips: 86 },
      { size: '25', waist: 63.5, hips: 89 },
      { size: '26', waist: 66, hips: 91 },
      { size: '27', waist: 68.5, hips: 94 },
      { size: '28', waist: 71, hips: 96.5 },
      { size: '29', waist: 73.5, hips: 99 },
      { size: '30', waist: 76, hips: 101.5 },
      { size: '32', waist: 81, hips: 106.5 },
    ]
  },
  {
    id: 'zara',
    name: "Zara",
    tendency: "Runs small",
    logo: "https://logo.clearbit.com/zara.com",
    sizeChart: [
      { size: '34', waist: 62, hips: 90 },
      { size: '36', waist: 66, hips: 94 },
      { size: '38', waist: 70, hips: 98 },
      { size: '40', waist: 74, hips: 102 },
      { size: '42', waist: 78, hips: 106 },
    ]
  },
  {
    id: 'uniqlo',
    name: "Uniqlo",
    tendency: "Generous fit",
    logo: "https://logo.clearbit.com/uniqlo.com",
    sizeChart: [
      { size: '23', waist: 58.5, hips: 85 },
      { size: '24', waist: 61, hips: 87.5 },
      { size: '25', waist: 63.5, hips: 90 },
      { size: '26', waist: 66, hips: 92.5 },
      { size: '27', waist: 68.5, hips: 95 },
      { size: '28', waist: 71, hips: 97.5 },
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
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p2',
    brandId: 'levis',
    name: '721 High Rise Skinny',
    price: '$89.50',
    category: ClothingCategory.JEANS,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p3',
    brandId: 'zara',
    name: 'Premium Marine Straight',
    price: '$59.90',
    category: ClothingCategory.JEANS,
    image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p4',
    brandId: 'zara',
    name: 'TRF Wide Leg Denim',
    price: '$49.90',
    category: ClothingCategory.JEANS,
    image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p5',
    brandId: 'uniqlo',
    name: 'Selvedge Regular Fit',
    price: '$49.90',
    category: ClothingCategory.JEANS,
    image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'p6',
    brandId: 'uniqlo',
    name: 'Ultra Stretch Skinny',
    price: '$39.90',
    category: ClothingCategory.JEANS,
    image: 'https://images.unsplash.com/photo-1555529669-2269763671c0?auto=format&fit=crop&q=80&w=400'
  }
];

export const UNIT_CONVERSION = {
  INCH_TO_CM: 2.54,
  CM_TO_INCH: 0.393701
};
