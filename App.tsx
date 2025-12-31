
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
  FitRecommendation,
  VisionFitSignals,
  Product
} from './types';
import { calculateRecommendations } from './services/sizingEngine';
import { analyzeVisionFit, validateInput, generateVirtualTryOn } from './services/geminiService';

type Mode = 'measurements' | 'baseline' | 'vision';
type View = 'engine' | 'charts' | 'privacy';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('engine');
  const [mode, setMode] = useState<Mode>('measurements');
  const [loading, setLoading] = useState(false);
  const [fittingLoading, setFittingLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    gender: Gender.FEMALE,
    category: ClothingCategory.JEANS,
    fitPreference: FitPreference.REGULAR,
    material: MaterialType.DENIM,
  });
  
  const [recommendations, setRecommendations] = useState<FitRecommendation[]>([]);
  const [visionSignals, setVisionSignals] = useState<VisionFitSignals | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'measurements' && profile.measurements) {
        const validation = await validateInput(profile.measurements);
        if (!validation.isValid) {
          setError(validation.warning || "Invalid measurements");
          setLoading(false);
          return;
        }
      }

      const results = await calculateRecommendations(profile);
      setRecommendations(results);
    } catch (err) {
      setError("Failed to calculate fit. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreCheckFit = async (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('engine');
    
    // If the user has uploaded an image, trigger virtual try-on automatically
    if (uploadedImages.length > 0) {
      setFittingLoading(true);
      try {
        const result = await generateVirtualTryOn(uploadedImages[0], product, profile);
        setTryOnImage(result);
        
        // Also run the calculation for the specific brand
        const results = await calculateRecommendations(profile);
        setRecommendations(results);
      } catch (err) {
        console.error("Try-on failed", err);
      } finally {
        setFittingLoading(false);
      }
    } else {
       setMode('vision');
       setError("Upload a photo first for a Visual Fit.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const base64Images: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
      });
      reader.readAsDataURL(file);
      base64Images.push(await promise);
    }

    setUploadedImages(base64Images);

    try {
      const signals = await analyzeVisionFit(base64Images);
      setVisionSignals(signals);
    } catch (err) {
      setError("Vision analysis failed. Ensure photos show the garment clearly.");
    } finally {
      setLoading(false);
    }
  };

  const renderEngine = () => (
    <>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black tracking-tight mb-2 text-zinc-900">Find Your Perfect Fit</h2>
        <p className="text-zinc-500 font-medium">Cross-brand sizing intelligence for the modern shopper.</p>
      </div>

      <PrivacyDisclaimer />

      {/* Mode Selector */}
      <div className="flex bg-zinc-200 p-1 rounded-full mb-8 max-w-md mx-auto">
        {(['measurements', 'baseline', 'vision'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${
              mode === m ? 'bg-white shadow-sm text-black' : 'text-zinc-600 hover:text-black'
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-zinc-900">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              Basic Info
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1 block">Category</label>
                <select 
                  className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-black outline-none"
                  value={profile.category}
                  onChange={(e) => setProfile({...profile, category: e.target.value as ClothingCategory})}
                >
                  {Object.values(ClothingCategory).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1 block">Preference</label>
                  <select 
                    className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-black outline-none"
                    value={profile.fitPreference}
                    onChange={(e) => setProfile({...profile, fitPreference: e.target.value as FitPreference})}
                  >
                    {Object.values(FitPreference).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1 block">Material</label>
                  <select 
                    className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-black outline-none"
                    value={profile.material}
                    onChange={(e) => setProfile({...profile, material: e.target.value as MaterialType})}
                  >
                    {Object.values(MaterialType).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-zinc-200" />

            {mode === 'measurements' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400">Measurements (cm)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" 
                    placeholder="Waist" 
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-black outline-none"
                    onChange={(e) => setProfile({
                      ...profile, 
                      measurements: { ...profile.measurements, waist: parseFloat(e.target.value), unit: 'cm' }
                    })}
                  />
                  <input 
                    type="number" 
                    placeholder="Hips" 
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-black outline-none"
                    onChange={(e) => setProfile({
                      ...profile, 
                      measurements: { ...profile.measurements, hips: parseFloat(e.target.value), unit: 'cm' }
                    })}
                  />
                </div>
              </div>
            )}

            {mode === 'baseline' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400">Your Best Fit</h3>
                <input 
                  type="text" 
                  placeholder="e.g. Zara size 38 jeans" 
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-black outline-none"
                  value={profile.baseline || ''}
                  onChange={(e) => setProfile({...profile, baseline: e.target.value})}
                />
                <p className="text-xs text-zinc-500 italic font-medium">We use this to infer your fit profile across other brands.</p>
              </div>
            )}

            {mode === 'vision' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                 <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400">Fit Analysis Photos</h3>
                 
                 {uploadedImages.length > 0 && (
                   <div className="grid grid-cols-3 gap-2 mb-4">
                     {uploadedImages.map((src, i) => (
                       <div key={i} className="aspect-square rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm">
                         <img src={src} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                       </div>
                     ))}
                   </div>
                 )}

                 <div className="border-2 border-dashed border-zinc-300 rounded-xl p-6 text-center hover:border-black transition-colors group">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      id="vision-upload"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="vision-upload" className="cursor-pointer">
                      <svg className="mx-auto h-8 w-8 text-zinc-400 group-hover:text-black transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className="mt-2 block text-sm font-black text-zinc-900">
                        {uploadedImages.length > 0 ? 'Replace photos' : 'Upload 2-3 fit photos'}
                      </span>
                      <p className="mt-1 text-xs text-zinc-500 font-medium">Privacy guaranteed. Automated purging active.</p>
                    </label>
                 </div>
                 
                 {visionSignals && (
                   <div className="bg-zinc-100 p-3 rounded-lg border border-zinc-200">
                      <h4 className="text-[10px] font-black uppercase text-zinc-600 mb-2 tracking-widest">Qualitative Fit Signals</h4>
                      <div className="flex flex-wrap gap-2">
                         <span className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-bold text-zinc-900 rounded-full">Waist: {visionSignals.waist_fit}</span>
                         <span className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-bold text-zinc-900 rounded-full">Length: {visionSignals.length}</span>
                         <span className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-bold text-zinc-900 rounded-full">Silhouette: {visionSignals.overall_silhouette}</span>
                      </div>
                   </div>
                 )}
              </div>
            )}

            <button 
              onClick={handleCalculate}
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl font-black text-sm hover:bg-zinc-800 transition-all disabled:bg-zinc-400 shadow-lg shadow-black/10 uppercase tracking-widest"
            >
              {loading ? 'Analyzing...' : 'Calculate My Fit'}
            </button>
            
            {error && <p className="text-red-600 text-xs font-bold text-center mt-2">{error}</p>}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          {(fittingLoading || tryOnImage) ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Virtual Studio</h3>
                  {selectedProduct && <span className="text-[10px] font-black bg-zinc-100 px-3 py-1 rounded-full text-zinc-500 uppercase tracking-widest">Fitting: {selectedProduct.name}</span>}
               </div>

               <div className="relative aspect-[3/4] md:aspect-auto md:h-[600px] w-full rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-2xl">
                  {fittingLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl z-10">
                       <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="text-zinc-900 font-black uppercase tracking-widest text-xs animate-pulse">Draping Fabric...</p>
                    </div>
                  ) : null}
                  
                  {tryOnImage ? (
                    <img src={tryOnImage} className="w-full h-full object-cover" alt="Virtual Try-On Result" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                       <p className="text-zinc-400 font-bold italic">Processing your POV...</p>
                    </div>
                  )}

                  <div className="absolute bottom-6 left-6 right-6">
                     {recommendations.length > 0 && recommendations.find(r => r.brandId === selectedProduct?.brandId) && (
                       <div className="glass-panel p-4 rounded-2xl shadow-xl border-white/40 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                          <div className="flex justify-between items-end">
                             <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recommended Size</p>
                                <h4 className="text-2xl font-black text-zinc-900">
                                   {recommendations.find(r => r.brandId === selectedProduct?.brandId)?.recommendedSize}
                                </h4>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Fit Match</p>
                                <p className="text-sm font-bold text-zinc-900">{recommendations.find(r => r.brandId === selectedProduct?.brandId)?.confidenceScore}% Confidence</p>
                             </div>
                          </div>
                          <p className="mt-3 text-xs text-zinc-700 leading-relaxed italic border-t pt-3 border-zinc-200">
                             "{recommendations.find(r => r.brandId === selectedProduct?.brandId)?.reasoning}"
                          </p>
                       </div>
                     )}
                  </div>
               </div>
               
               <div className="mt-4 flex gap-4">
                  <button className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 shadow-xl shadow-black/10 transition-all">Add to Cart</button>
                  <button onClick={() => { setTryOnImage(null); setSelectedProduct(null); }} className="px-6 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all">Reset Studio</button>
               </div>
            </div>
          ) : (
            <>
              {!loading && recommendations.length === 0 && (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-10 border border-zinc-200 rounded-3xl bg-white/30 border-dashed">
                  <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Ready for your POV?</h3>
                  <p className="text-zinc-500 mt-2 font-medium max-w-sm mx-auto">Upload your photo in Vision mode or select an item from the Store to see your Virtual Fit result here.</p>
                  <button onClick={() => setCurrentView('charts')} className="mt-8 px-6 py-3 bg-black text-white rounded-full font-black uppercase tracking-widest text-[11px]">Go to Brand Store</button>
                </div>
              )}

              {loading && (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 bg-zinc-100 rounded-3xl animate-pulse" />
                  ))}
                </div>
              )}

              {!loading && recommendations.length > 0 && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Global Sizing Report</h3>
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full uppercase tracking-tighter border border-green-100">Verified Fit</span>
                  </div>
                  {recommendations.map((rec) => (
                    <div key={rec.brandId} className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <img src={rec.brandName === "Levi's" ? "https://logo.clearbit.com/levis.com" : `https://logo.clearbit.com/${rec.brandName.toLowerCase()}.com`} 
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/40/40" }}
                            className="w-12 h-12 rounded-xl object-contain bg-zinc-50 border border-zinc-100 p-2" 
                          />
                          <div>
                            <h4 className="font-black text-lg text-zinc-900">{rec.brandName}</h4>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{rec.fitAssessment}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-zinc-900">{rec.recommendedSize}</div>
                          <div className="text-[10px] font-black uppercase text-zinc-400">Match</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                         <p className="text-sm text-zinc-800 leading-relaxed italic font-medium">
                           "{rec.reasoning}"
                         </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                         <div className="flex flex-wrap gap-2">
                            {rec.warnings.map((w, idx) => (
                              <span key={idx} className="text-[9px] bg-amber-50 text-amber-700 px-2 py-1 rounded font-black uppercase tracking-tight border border-amber-100">
                                  {w}
                              </span>
                            ))}
                            <div className="flex items-center gap-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">
                               {rec.confidenceScore}% Score
                            </div>
                         </div>
                         <button 
                          onClick={() => setCurrentView('charts')}
                          className="text-[10px] font-black flex items-center gap-1 hover:underline text-zinc-900 uppercase tracking-widest bg-zinc-100 px-3 py-2 rounded-lg"
                         >
                            Shop
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={currentView} onNavigate={(v) => setCurrentView(v as View)} />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:py-12">
        {currentView === 'engine' && renderEngine()}
        {currentView === 'charts' && <BrandStore onCheckFit={handleStoreCheckFit} />}
        {currentView === 'privacy' && <PrivacyPolicy />}
      </main>

      <footer className="py-10 border-t bg-zinc-50 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-zinc-400 text-[11px] font-bold uppercase tracking-widest">
          <div className="mb-4 md:mb-0">© 2024 POV Intelligence. Sizing the future.</div>
          <div className="flex gap-6">
            <button onClick={() => setCurrentView('privacy')} className="hover:text-black transition-colors">Privacy Policy</button>
            <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-black transition-colors">Ethical AI Report</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
