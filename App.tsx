
import React, { useState } from 'react';
import Header from './components/Header';
import PrivacyDisclaimer from './components/PrivacyDisclaimer';
import BrandStore from './components/BrandStore';
import PrivacyPolicy from './components/PrivacyPolicy';
import { 
  Gender, 
  ClothingCategory, 
  FitPreference, 
  MaterialType, 
  UserProfile, 
  Product,
  HeatmapZone,
  FitRecommendation
} from './types';
import { checkFitAPI, analyzeVisionFit, generateVirtualTryOn } from './services/geminiService';

type Mode = 'measurements' | 'baseline' | 'vision';
type View = 'engine' | 'charts' | 'privacy';

const SilhouetteHeatmap: React.FC<{ heatmap: Record<string, string> }> = ({ heatmap }) => {
  const getColor = (status?: string) => {
    switch (status) {
      case 'red': return '#EF4444';
      case 'blue': return '#3B82F6';
      case 'green': return '#10B981';
      default: return '#F3F4F6';
    }
  };

  return (
    <div className="relative w-full max-w-[240px] mx-auto aspect-[1/2] flex items-center justify-center">
      <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-sm">
        <path d="M50,10 C55,10 60,15 60,20 C60,25 55,30 50,30 C45,30 40,25 40,20 C40,15 45,10 50,10" fill="#F3F4F6" />
        <path d="M40,30 L60,30 L75,50 L70,80 L60,80 L60,140 L70,190 L55,190 L50,140 L45,190 L30,190 L40,140 L40,80 L30,80 L25,50 Z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
        
        <ellipse cx="50" cy="55" rx="18" ry="8" fill={getColor(heatmap.chest)} opacity="0.6" />
        <ellipse cx="50" cy="85" rx="15" ry="6" fill={getColor(heatmap.waist)} opacity="0.6" />
        <ellipse cx="50" cy="110" rx="18" ry="8" fill={getColor(heatmap.hips)} opacity="0.6" />
        <path d="M45,140 L40,170" stroke={getColor(heatmap.inseam)} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      </svg>
      
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-zinc-100 shadow-sm whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter">
          <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div> Tight
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter">
          <div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Perfect
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div> Loose
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('engine');
  const [mode, setMode] = useState<Mode>('measurements');
  const [wizardStep, setWizardStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    gender: Gender.FEMALE,
    category: ClothingCategory.JEANS,
    fitPreference: FitPreference.REGULAR,
    material: MaterialType.DENIM,
    measurements: { unit: 'cm' }
  });
  
  const [recommendation, setRecommendation] = useState<FitRecommendation | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const wizardSteps = [
    { label: 'Height', key: 'height', placeholder: 'e.g. 175', unit: 'cm' },
    { label: 'Weight', key: 'weight', placeholder: 'e.g. 70', unit: 'kg' },
    { label: 'Chest', key: 'chest', placeholder: 'e.g. 95', unit: 'cm' },
    { label: 'Waist', key: 'waist', placeholder: 'e.g. 80', unit: 'cm' },
    { label: 'Hips', key: 'hips', placeholder: 'e.g. 102', unit: 'cm' }
  ];

  const handleCalculate = async () => {
    if (!selectedProduct) {
      setError("Please select a product from the Brand Store first.");
      setCurrentView('charts');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await checkFitAPI(selectedProduct, profile);
      setRecommendation(res);
    } catch (err) {
      setError("Tailor AI failed to process. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStoreCheckFit = (product: Product) => {
    setSelectedProduct(product);
    setRecommendation(null);
    setCurrentView('engine');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    const base64Images: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      const promise = new Promise<string>((res) => { reader.onload = (e) => res(e.target?.result as string); });
      reader.readAsDataURL(files[i]);
      base64Images.push(await promise);
    }
    setUploadedImages(base64Images);
    try {
      const signals = await analyzeVisionFit(base64Images);
      setProfile(p => ({ ...p, visionSignals: signals }));
      if (selectedProduct) {
        const res = await checkFitAPI(selectedProduct, { ...profile, images: base64Images });
        setRecommendation(res);
      }
    } catch (err) { setError("Vision analysis failed."); } 
    finally { setLoading(false); }
  };

  const currentStepData = wizardSteps[wizardStep];
  const currentValue = profile.measurements ? (profile.measurements as any)[currentStepData.key] : '';

  const renderEngine = () => (
    <div className="animate-in fade-in duration-700">
      <div className="mb-12 text-center max-w-xl mx-auto">
        <h2 className="text-4xl font-black tracking-tighter mb-4 text-zinc-900 uppercase">Virtual Fit Studio</h2>
        <p className="text-zinc-500 font-medium text-lg leading-relaxed italic">Precision sizing for the modern wardrobe.</p>
      </div>

      {selectedProduct && (
        <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm animate-in zoom-in-95">
          <img src={selectedProduct.image} className="w-32 h-40 object-cover rounded-xl shadow-md" alt={selectedProduct.name} />
          <div className="flex-1">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Context: {selectedProduct.category}</p>
             <h3 className="text-2xl font-black text-zinc-900">{selectedProduct.name}</h3>
             <p className="text-sm text-zinc-500 font-medium italic mt-1">{selectedProduct.material} • {selectedProduct.fit_type} cut</p>
          </div>
          <button onClick={() => setCurrentView('charts')} className="px-6 py-2 border border-zinc-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50">Change Item</button>
        </div>
      )}

      <div className="flex bg-zinc-100 p-1.5 rounded-full mb-12 max-w-sm mx-auto border border-zinc-200">
        {(['measurements', 'baseline', 'vision'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setWizardStep(0); }}
            className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-all ${
              mode === m ? 'bg-white shadow-lg text-black' : 'text-zinc-500 hover:text-black'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-panel p-8 rounded-[2.5rem] shadow-xl border border-white/50 space-y-8 max-w-md mx-auto w-full min-h-[450px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-400">01 Tailor Inputs</h3>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === (mode === 'measurements' ? 0 : mode === 'baseline' ? 1 : 2) ? 'bg-black' : 'bg-zinc-200'}`} />)}
              </div>
            </div>

            {mode === 'measurements' && (
              <div className="space-y-10 py-4 flex-1 flex flex-col justify-between">
                <div className="relative">
                   <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Step {wizardStep + 1} of {wizardSteps.length}</p>
                   <h4 className="text-3xl font-black text-zinc-900 mb-8">{currentStepData.label}</h4>
                   <div className="relative">
                    <input 
                        type="number"
                        placeholder={currentStepData.placeholder}
                        value={currentValue || ''}
                        className="w-full text-6xl font-black text-zinc-900 bg-transparent border-b-4 border-zinc-100 focus:border-black outline-none pb-6 transition-all placeholder:text-zinc-100 appearance-none"
                        onChange={(e) => setProfile({
                          ...profile,
                          measurements: { ...profile.measurements!, [currentStepData.key]: parseFloat(e.target.value) }
                        })}
                    />
                    <span className="absolute bottom-8 right-0 text-zinc-300 font-black italic text-xl uppercase tracking-widest">{currentStepData.unit}</span>
                   </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    disabled={wizardStep === 0}
                    onClick={() => setWizardStep(s => s - 1)}
                    className="flex-1 py-5 border border-zinc-200 rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-20 hover:bg-zinc-50 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    disabled={!currentValue}
                    onClick={() => {
                      if (wizardStep < wizardSteps.length - 1) {
                        setWizardStep(s => s + 1);
                      } else {
                        handleCalculate();
                      }
                    }}
                    className="flex-[2] py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 shadow-xl shadow-black/10 transition-all disabled:bg-zinc-200"
                  >
                    {wizardStep === wizardSteps.length - 1 ? 'Unlock Fit POV' : 'Continue'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'baseline' && (
              <div className="space-y-8 py-4 animate-in slide-in-from-right-4 duration-500">
                <h4 className="text-2xl font-black text-zinc-900">Reference Brand</h4>
                <p className="text-sm text-zinc-500 font-medium">Map your current favorites to the POV matrix.</p>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Brand and Tag Size</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Levi's 32" 
                    className="w-full border-b-2 border-zinc-100 py-5 text-xl font-bold text-zinc-900 outline-none focus:border-black transition-all"
                    value={profile.baseline || ''}
                    onChange={(e) => setProfile({...profile, baseline: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleCalculate}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 mt-12"
                >
                  Calculate Fit Logic
                </button>
              </div>
            )}

            {mode === 'vision' && (
              <div className="space-y-8 py-4 animate-in slide-in-from-right-4 duration-500">
                 <h4 className="text-2xl font-black text-zinc-900">Neural Vision</h4>
                 <div className="border-2 border-dashed border-zinc-200 rounded-[2rem] p-12 text-center hover:border-black transition-all group bg-zinc-50/50">
                    <input type="file" multiple accept="image/*" className="hidden" id="vision-upload" onChange={handleFileUpload} />
                    <label htmlFor="vision-upload" className="cursor-pointer block">
                      <svg className="mx-auto h-14 w-14 text-zinc-200 group-hover:text-black transition-colors mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-900 group-hover:underline">
                        {uploadedImages.length > 0 ? 'Replace Scans' : 'Start Fit Scan'}
                      </span>
                    </label>
                 </div>
                 {loading && (
                    <div className="flex items-center gap-4 p-5 bg-zinc-900 rounded-3xl text-white shadow-xl animate-pulse">
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Estimating Proportions...</span>
                    </div>
                 )}
              </div>
            )}
            
            {error && <p className="text-red-600 text-[10px] font-black uppercase text-center mt-auto bg-red-50 p-4 rounded-xl">{error}</p>}
          </div>
        </div>

        <div className="lg:col-span-7">
          {loading ? (
             <div className="space-y-10">
                <div className="h-80 bg-zinc-100 rounded-[3rem] animate-pulse" />
                <div className="h-32 bg-zinc-100 rounded-[3rem] animate-pulse" />
             </div>
          ) : recommendation ? (
            <div className="space-y-16 animate-in slide-in-from-bottom-8 duration-700">
               <div className="flex items-end justify-between border-b-2 border-zinc-100 pb-6">
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">02 Fit Outcome</h3>
                    <h4 className="text-4xl font-black text-zinc-900 tracking-tighter">Your POV Fit</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-7xl font-black text-zinc-900 tracking-tighter">{recommendation.recommended_size}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                  <div className="bg-white p-14 rounded-[4rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden">
                     <SilhouetteHeatmap heatmap={recommendation.heatmap} />
                  </div>

                  <div className="space-y-10 py-4">
                     <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                           <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Match Confidence</span>
                           <span className="text-sm font-black text-zinc-900">{Math.round(recommendation.confidence * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100 p-0.5">
                           <div className="h-full bg-black transition-all duration-1000 ease-out rounded-full" style={{ width: `${recommendation.confidence * 100}%` }} />
                        </div>
                     </div>

                     <div className="space-y-5">
                        <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900">Tailor Reasoning</h5>
                        <p className="text-xl text-zinc-700 font-medium leading-relaxed italic border-l-4 border-zinc-100 pl-6">
                          "{recommendation.explanation}"
                        </p>
                     </div>
                  </div>
               </div>

               <div className="flex gap-6 pb-20">
                  <button 
                    onClick={() => { setCartCount(c => c + 1); setRecommendation(null); setSelectedProduct(null); setCurrentView('charts'); }}
                    className="flex-[2] py-6 bg-black text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-zinc-800 shadow-2xl shadow-black/20 transition-all transform hover:-translate-y-1"
                  >
                    Add {recommendation.recommended_size} To Cart
                  </button>
                  <button onClick={() => setRecommendation(null)} className="flex-1 py-6 bg-white border-2 border-zinc-200 text-zinc-900 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-zinc-50 transition-all">
                    Reset Fit
                  </button>
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-20 border-4 border-zinc-100 rounded-[4rem] bg-white border-dashed group hover:border-zinc-200 transition-all">
              <div className="w-28 h-28 bg-zinc-50 rounded-full flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all duration-700 shadow-sm border border-zinc-100">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8l2-2 3 3L12 7l3 3 2-2M9 21h6"/></svg>
              </div>
              <h3 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase mb-4">Awaiting Fit POV</h3>
              <p className="text-zinc-500 font-medium max-w-md mx-auto mb-10 text-lg leading-relaxed italic">Complete your tailoring profile to unlock the POV fit matrix for this garment.</p>
              <button onClick={() => setCurrentView('charts')} className="px-12 py-4 bg-zinc-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all">Shop The Collection</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <Header currentView={currentView} onNavigate={(v) => setCurrentView(v as View)} cartCount={cartCount} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20">
        {currentView === 'engine' && renderEngine()}
        {currentView === 'charts' && <BrandStore onCheckFit={handleStoreCheckFit} />}
        {currentView === 'privacy' && <PrivacyPolicy />}
      </main>
      <footer className="py-20 border-t border-zinc-100 mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
          <div>© 2024 POV Intelligence. Sizing API v1.0.</div>
          <div className="flex gap-12 mt-4 md:mt-0">
            <button onClick={() => setCurrentView('privacy')} className="hover:text-black">Privacy Policy</button>
            <a href="#" className="hover:text-black">Terms of Service</a>
            <a href="#" className="hover:text-black">Partner API</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
