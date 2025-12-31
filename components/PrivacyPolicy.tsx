
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-4xl font-black text-zinc-900 tracking-tighter mb-8">Privacy Policy</h2>
      <p className="text-zinc-600 mb-8 font-medium leading-relaxed">
        Last updated: October 2024. Your privacy is not a feature; it's our foundation.
      </p>

      <div className="space-y-12">
        <section>
          <h3 className="text-xl font-bold text-zinc-900 mb-3 uppercase tracking-wider text-[14px]">01. Data Collection</h3>
          <p className="text-zinc-600 leading-relaxed font-medium">
            We collect visual data specifically to analyze fabric interaction and silhouette alignment. 
            We do not scan for biological identification, facial features, or health-related metrics. 
            Measurements you input are used strictly for local calculation against brand size charts.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-zinc-900 mb-3 uppercase tracking-wider text-[14px]">02. Image Processing</h3>
          <p className="text-zinc-600 leading-relaxed font-medium">
            Images uploaded via the "Vision" mode are processed in real-time. We use high-security API endpoints 
            to perform transient analysis. POV does not store your images in a permanent database. Once your session 
            is closed, binary image data is purged from our active memory.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-zinc-900 mb-3 uppercase tracking-wider text-[14px]">03. Third Party Brands</h3>
          <p className="text-zinc-600 leading-relaxed font-medium">
            We do not share your physical profile with retailers. When we redirect you to a store, we only pass 
            the recommended size label (e.g., "Size 38"). Your specific measurements stay with you.
          </p>
        </section>
        
        <div className="p-6 bg-zinc-900 rounded-2xl text-white">
          <h4 className="font-bold mb-2">Questions?</h4>
          <p className="text-zinc-400 text-sm">Reach out to privacy@povintelligence.ai for a full technical breakdown of our blurring and purging algorithms.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
