
import React from 'react';

const PrivacyDisclaimer: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 flex gap-3 items-start">
      <div className="p-1 bg-blue-100 rounded text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-blue-900">Privacy First Commitment</h4>
        <p className="text-sm text-blue-700 mt-0.5 leading-relaxed">
          Your photos are analyzed only for garment-to-body interaction. We do not perform face recognition, 
          estimate health metrics, or store identifiable body measurements. Images are purged after processing.
        </p>
      </div>
    </div>
  );
};

export default PrivacyDisclaimer;
