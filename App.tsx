
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import GeneratorControls from './components/GeneratorControls';
import Gallery from './components/Gallery';
import { StylePreset, GeneratedImage, SupportedLanguage } from './types';
import { generateFruitImage, generatePostText, getRandomFruitIdea } from './services/geminiService';

const ONE_HOUR_MS = 3600000;

const App: React.FC = () => {
  // Estado básico
  const [fruit, setFruit] = useState<string>('');
  const [style, setStyle] = useState<StylePreset>(StylePreset.STUDIO);
  const [details, setDetails] = useState<string>('');
  const [language, setLanguage] = useState<SupportedLanguage>('es');
  
  // Estado de control
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  
  const timerRef = useRef<number | null>(null);

  // Inicialización (Solo una vez al montar)
  useEffect(() => {
    const savedHistory = localStorage.getItem('fruit-ai-history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error("History load failed", e); }
    }
    
    const savedAuto = localStorage.getItem('fruit-ai-automode');
    if (savedAuto === 'true') setAutoMode(true);

    const savedLang = localStorage.getItem('fruit-ai-lang') as SupportedLanguage;
    if (savedLang) setLanguage(savedLang);
  }, []);

  // Persistencia de estados
  useEffect(() => {
    localStorage.setItem('fruit-ai-history', JSON.stringify(history.slice(0, 50)));
    localStorage.setItem('fruit-ai-automode', autoMode.toString());
    localStorage.setItem('fruit-ai-lang', language);
  }, [history, autoMode, language]);

  const runGeneration = useCallback(async (customFruit?: string, customStyle?: StylePreset, customDetails?: string) => {
    const f = customFruit || fruit;
    const s = customStyle || style;
    const d = customDetails || details;

    if (!f && !autoMode) return;

    setError(null);
    setIsGenerating(true);

    try {
      const [imageUrl, captionText] = await Promise.all([
        generateFruitImage(f, s, d),
        generatePostText(f, s, d, language)
      ]);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: `Photography of ${f}`,
        fruit: f,
        caption: captionText,
        timestamp: Date.now()
      };

      setHistory(prev => [newImage, ...prev]);
      localStorage.setItem('fruit-ai-last-gen', Date.now().toString());
      return true;
    } catch (err: any) {
      setError(err.message || 'Error inesperado.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [fruit, style, details, autoMode, language]);

  const handleSurprise = async () => {
    setIsGenerating(true);
    try {
      const idea = await getRandomFruitIdea();
      setFruit(idea.fruit);
      setStyle(idea.style);
      setDetails(idea.details);
      await runGeneration(idea.fruit, idea.style, idea.details);
    } catch (e: any) {
      setError(e.message);
      setIsGenerating(false);
    }
  };

  // Lógica del Temporizador (Cron inteligente)
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (autoMode) {
      const updateTimer = () => {
        const lastGen = parseInt(localStorage.getItem('fruit-ai-last-gen') || '0');
        const now = Date.now();
        const elapsed = now - lastGen;
        
        if (elapsed >= ONE_HOUR_MS) {
          if (!isGenerating) {
            getRandomFruitIdea().then(idea => {
              setFruit(idea.fruit);
              setStyle(idea.style);
              runGeneration(idea.fruit, idea.style, idea.details);
            });
          }
        } else {
          setTimeLeft(Math.max(0, Math.floor((ONE_HOUR_MS - elapsed) / 1000)));
        }
      };

      updateTimer(); // Primera ejecución inmediata
      timerRef.current = window.setInterval(updateTimer, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoMode, isGenerating, runGeneration]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const downloadImage = (base64Url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">
                Agente <span className="text-orange-600">Frutal</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Genera automáticamente imágenes de frutas realistas para Facebook cada hora en el idioma que prefieras.
              </p>
            </div>

            <GeneratorControls
              fruit={fruit} setFruit={setFruit}
              style={style} setStyle={setStyle}
              details={details} setDetails={setDetails}
              language={language} setLanguage={setLanguage}
              onGenerate={() => runGeneration()}
              onSurprise={handleSurprise}
              isGenerating={isGenerating}
              autoMode={autoMode}
              setAutoMode={setAutoMode}
            />

            {autoMode && (
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center shadow-xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-green-500/20">
                    <i className="fas fa-bolt text-white"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Próxima Entrega</p>
                    <p className="text-xl font-mono font-black">{formatTime(timeLeft)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAutoMode(false)}
                  className="bg-white/10 hover:bg-red-500/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10"
                >
                  DETENER AGENTE
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex flex-col gap-3 text-red-800 shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-circle-exclamation text-red-500 text-lg mt-0.5"></i>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-1">Error de Generación</p>
                    <p className="text-xs font-medium leading-relaxed opacity-90">{error}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-[10px] font-black text-red-600 hover:text-red-800 uppercase"
                >
                  Entendido, cerrar
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <div className="bg-white rounded-[2.5rem] aspect-[4/5] overflow-hidden shadow-2xl relative group border-[10px] border-white ring-1 ring-slate-200">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl z-20 text-center px-8">
                    <div className="relative">
                      <div className="w-28 h-28 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin"></div>
                      <i className="fas fa-lemon absolute inset-0 flex items-center justify-center text-orange-500 text-3xl animate-bounce"></i>
                    </div>
                    <div className="mt-8">
                      <p className="font-black text-slate-900 text-2xl tracking-tighter uppercase italic">Generando Frescura...</p>
                      <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">Garantía 100% Realista</p>
                    </div>
                  </div>
                ) : history.length > 0 ? (
                  <>
                    <img 
                      src={history[0].url} 
                      alt="Current" 
                      className="w-full h-full object-cover animate-in fade-in duration-700"
                    />
                    <div className="absolute bottom-6 left-6 right-6">
                       <div className="bg-black/40 backdrop-blur-md border border-white/20 p-5 rounded-3xl text-white shadow-2xl">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Caption Generada ({language})</span>
                             <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(history[0].caption);
                                  setCopyFeedback(true);
                                  setTimeout(() => setCopyFeedback(false), 2000);
                                }}
                                className={`text-[10px] font-black uppercase px-2 py-1 rounded bg-white/20 hover:bg-white/40 transition-all ${copyFeedback ? 'text-green-400' : 'text-white'}`}
                             >
                               {copyFeedback ? 'Copiado!' : 'Copiar'}
                             </button>
                          </div>
                          <p className="text-sm font-medium leading-relaxed italic line-clamp-3">"{history[0].caption}"</p>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                    <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                      <i className="fas fa-camera text-7xl opacity-20"></i>
                    </div>
                    <p className="text-2xl font-black text-slate-400 mb-2 uppercase tracking-tighter">Estudio Vacío</p>
                    <p className="text-sm font-medium text-slate-300 max-w-xs">Configura una fruta o activa el Agente para llenar tu galería de frescura.</p>
                  </div>
                )}
              </div>
              
              {history.length > 0 && !isGenerating && (
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => downloadImage(history[0].url, `fruit-${Date.now()}.png`)}
                    className="bg-white border-2 border-slate-200 text-slate-800 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    <i className="fas fa-file-export"></i>
                    Exportar 4:5
                  </button>
                  <button 
                    onClick={handleSurprise}
                    className="bg-orange-500 text-white py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                  >
                    <i className="fas fa-sync"></i>
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Gallery images={history} onDownload={downloadImage} />
      </main>
      
      <footer className="bg-white border-t border-slate-100 py-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
           <i className="fab fa-facebook text-slate-300 text-xl"></i>
           <i className="fab fa-instagram text-slate-300 text-xl"></i>
           <i className="fab fa-pinterest text-slate-300 text-xl"></i>
        </div>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">
           FruitVision AI System • Infinite Freshness Engine • v2.0
        </p>
      </footer>
    </div>
  );
};

export default App;
