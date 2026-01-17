
import React from 'react';
import { GeneratedImage } from '../types';

interface GalleryProps {
  images: GeneratedImage[];
  onDownload: (url: string, name: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ images, onDownload }) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <i className="fas fa-images text-orange-500"></i>
        Historial de Creaciones
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <div key={img.id} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="aspect-[4/5] relative bg-slate-100 overflow-hidden">
              <img 
                src={img.url} 
                alt={img.prompt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => onDownload(img.url, `fruit-${img.fruit}.png`)}
                  className="bg-white text-slate-900 p-3 rounded-full hover:bg-orange-500 hover:text-white transition-colors"
                  title="Descargar"
                >
                  <i className="fas fa-download"></i>
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(img.caption).then(() => alert('¡Texto copiado al portapapeles!'));
                  }}
                  className="bg-white text-slate-900 p-3 rounded-full hover:bg-orange-600 hover:text-white transition-colors"
                  title="Copiar Texto"
                >
                  <i className="fas fa-quote-left text-sm"></i>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 capitalize">{img.fruit}</h3>
                <span className="text-[10px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded uppercase font-black tracking-wider">
                  Post IA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                Prompt: {img.prompt}
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-600 line-clamp-3 italic">
                  "{img.caption}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
