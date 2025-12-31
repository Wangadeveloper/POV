
import React from 'react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="py-6 px-4 md:px-8 flex items-center justify-between border-b bg-white/50 sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('engine')}>
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">POV</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Point Of View</h1>
      </div>
      <nav className="hidden md:flex gap-6 text-sm font-bold text-zinc-500">
        <button 
          onClick={() => onNavigate('engine')}
          className={`transition-colors ${currentView === 'engine' ? 'text-black underline decoration-2 underline-offset-8' : 'hover:text-black'}`}
        >
          Fit Engine
        </button>
        <button 
          onClick={() => onNavigate('charts')}
          className={`transition-colors ${currentView === 'charts' ? 'text-black underline decoration-2 underline-offset-8' : 'hover:text-black'}`}
        >
          Brand Store
        </button>
        <button 
          onClick={() => onNavigate('privacy')}
          className={`transition-colors ${currentView === 'privacy' ? 'text-black underline decoration-2 underline-offset-8' : 'hover:text-black'}`}
        >
          Privacy
        </button>
      </nav>
      <button className="px-4 py-2 bg-black text-white text-sm rounded-full font-bold hover:bg-zinc-800 transition-colors">
        Log In
      </button>
    </header>
  );
};

export default Header;
