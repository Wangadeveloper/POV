
import React from 'react';
import { PRODUCTS, BRANDS } from '../constants';
import { Product } from '../types';

interface BrandStoreProps {
  onCheckFit: (product: Product) => void;
}

const BrandStore: React.FC<BrandStoreProps> = ({ onCheckFit }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Our Collection</h2>
          <p className="text-zinc-500 font-medium">Shop the latest styles, verified by POV Intelligence.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-full text-xs font-bold border border-zinc-200">All Categories</button>
           <button className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-full text-xs font-bold border border-zinc-200">Sale</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {PRODUCTS.map(product => {
          const brand = BRANDS.find(b => b.id === product.brandId);
          return (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 mb-4 border border-zinc-200">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                   <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-zinc-900 shadow-sm border border-white/20 uppercase tracking-widest">
                     {brand?.tendency}
                   </span>
                </div>
              </div>
              
              <div className="space-y-1 px-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{brand?.name}</p>
                    <h3 className="font-bold text-zinc-900 text-lg leading-tight">{product.name}</h3>
                  </div>
                  <p className="font-black text-zinc-900">{product.price}</p>
                </div>
                
                <div className="pt-4 flex gap-2">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onCheckFit(product); }}
                    className="flex-1 bg-black text-white text-[11px] font-bold py-3 rounded-lg hover:bg-zinc-800 transition-colors uppercase tracking-widest"
                   >
                     Check My Size
                   </button>
                   <button className="w-12 h-12 flex items-center justify-center border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                   </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BrandStore;
