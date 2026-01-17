
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <i className="fas fa-lemon text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              FruitVision AI
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <i className="fab fa-facebook text-blue-600"></i>
              4:5 Portrait Optimized
            </span>
            <a 
              href="https://ai.google.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Powered by Gemini
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
