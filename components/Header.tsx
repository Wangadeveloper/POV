
import React from 'react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount?: number;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, cartCount = 0 }) => {
  return (
    <header className="py-6 px-4 md:px-8 flex items-center justify-between border-b bg-white/50 sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('engine')}>
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-black uppercase tracking-tighter">POV</span>
        </div>
        <h1 className="text-xl font-black tracking-tighter text-zinc-900 uppercase">Point Of View</h1>
      </div>
      <nav className="hidden md:flex gap-10 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        <button 
          onClick={() => onNavigate('engine')}
          className={`transition-colors ${currentView === 'engine' ? 'text-black' : 'hover:text-black'}`}
        >
          Virtual Studio
        </button>
        <button 
          onClick={() => onNavigate('charts')}
          className={`transition-colors ${currentView === 'charts' ? 'text-black' : 'hover:text-black'}`}
        >
          Collection
        </button>
        <button 
          onClick={() => onNavigate('privacy')}
          className={`transition-colors ${currentView === 'privacy' ? 'text-black' : 'hover:text-black'}`}
        >
          Privacy
        </button>
      </nav>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-zinc-900">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
           {cartCount > 0 && (
             <span className="absolute top-0 right-0 bg-black text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
               {cartCount}
             </span>
           )}
        </button>
        <button className="px-5 py-2.5 bg-zinc-100 text-zinc-900 text-[10px] rounded-full font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
          Account
        </button>
      </div>
    </header>
  );
};

export default Header;
