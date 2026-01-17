
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import GeneratorControls from './components/GeneratorControls';
import Gallery from './components/Gallery';
import { StylePreset, GeneratedImage } from './types';
import { generateFruitImage, generatePostText, getRandomFruitIdea } from './services/geminiService';

const ONE_HOUR_MS = 3600000;

const App: React.FC = () => {
  const [fruit, setFruit] = useState<string>('');
  const [style, setStyle] = useState<StylePreset>(StylePreset.STUDIO);
  const [details, setDetails] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const autoTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  // Inicialización y carga de historial
  useEffect(() => {
    const savedHistory = localStorage.getItem('fruit-ai-history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    
    const savedAuto = localStorage.getItem('fruit-ai-automode');
    if (savedAuto === 'true') setAutoMode(true);
  }, []);

  // Guardar historial y modo
  useEffect(() => {
    localStorage.setItem('fruit-ai-history', JSON.stringify(history));
    localStorage.setItem('fruit-ai-automode', autoMode.toString());
  }, [history, autoMode]);

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
        generatePostText(f, s, d)
      ]);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: `A ${s} of ${f}`,
        fruit: f,
        caption: captionText,
        timestamp: Date.now()
      };

      setHistory(prev => [newImage, ...prev].slice(0, 50));
      localStorage.setItem('fruit-ai-last-gen', Date.now().toString());
      return true;
    } catch (err: any) {
      setError(err.message || 'Error en la generación.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [fruit, style, details, autoMode]);

  const handleSurprise = async () => {
    const idea = await getRandomFruitIdea();
    setFruit(idea.fruit);
    setStyle(idea.style);
    setDetails(idea.details);
    await runGeneration(idea.fruit, idea.style, idea.details);
  };

  // Lógica de cronómetro y autogeneración cada hora
  useEffect(() => {
    if (!autoMode) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    const checkAndRun = async () => {
      const lastGen = parseInt(localStorage.getItem('fruit-ai-last-gen') || '0');
      const now = Date.now();
      const elapsed = now - lastGen;

      if (elapsed >= ONE_HOUR_MS) {
        console.log("Agente: Es hora de una nueva fruta.");
        const idea = await getRandomFruitIdea();
        await runGeneration(idea.fruit, idea.style, idea.details);
      } else {
        const remaining = ONE_HOUR_MS - elapsed;
        setTimeLeft(Math.floor(remaining / 1000));
      }
    };

    checkAndRun();
    
    countdownRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          checkAndRun();
          return 3600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoMode, runGeneration]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="mb-2">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Agente Frutal 24/7
              </h2>
              <p className="text-slate-600">
                Este agente genera una fruta espectacular cada hora. Asegúrate de mantener la pestaña abierta para el ciclo continuo.
              </p>
            </div>

            <GeneratorControls
              fruit={fruit} setFruit={setFruit}
              style={style} setStyle={setStyle}
              details={details} setDetails={setDetails}
              onGenerate={() => runGeneration()}
              onSurprise={handleSurprise}
              isGenerating={isGenerating}
              autoMode={autoMode}
              setAutoMode={setAutoMode}
            />

            {autoMode && (
              <div className="bg-blue-600 text-white p-4 rounded-xl flex justify-between items-center shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <i className="fas fa-clock"></i>
                  <span className="font-bold text-sm">Próxima fruta en:</span>
                </div>
                <span className="text-xl font-mono font-black">{formatTime(timeLeft)}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-xl flex gap-3 items-start text-red-700 shadow-sm">
                <i className="fas fa-exclamation-triangle mt-1"></i>
                <div>
                  <p className="text-sm font-bold">Error del Agente</p>
                  <p className="text-xs opacity-90">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <div className="bg-slate-200 rounded-3xl aspect-[4/5] overflow-hidden shadow-2xl relative group border-[12px] border-white ring-1 ring-slate-200">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md z-10 text-center px-8">
                    <div className="relative">
                      <div className="w-24 h-24 border-8 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                      <i className="fas fa-leaf absolute inset-0 flex items-center justify-center text-green-500 text-2xl animate-bounce"></i>
                    </div>
                    <div className="mt-8">
                      <p className="font-black text-slate-800 text-xl tracking-tight">CULTIVANDO IMAGEN...</p>
                      <p className="text-slate-500 font-medium mt-1">Solo frutas frescas, nada más.</p>
                    </div>
                  </div>
                ) : history.length > 0 ? (
                  <>
                    <img 
                      src={history[0].url} 
                      alt="Current Fruit" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 border border-white/20">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                      ÚLTIMA COSECHA
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                    <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <i className="fas fa-seedling text-5xl opacity-20"></i>
                    </div>
                    <p className="text-xl font-bold text-slate-500 mb-2">Agente en Espera</p>
                    <p className="text-sm max-w-xs">El agente está listo para generar frutas realistas cada hora. Activa el modo automático para empezar.</p>
                  </div>
                )}
              </div>
              
              {history.length > 0 && !isGenerating && (
                <div className="mt-8 flex flex-col gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Sugerencia de Post</span>
                      <button 
                        onClick={() => copyToClipboard(history[0].caption)}
                        className={`text-xs flex items-center gap-2 font-bold px-3 py-1 rounded-lg transition-all ${copyFeedback ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        <i className={`fas ${copyFeedback ? 'fa-check' : 'fa-copy'}`}></i>
                        {copyFeedback ? 'Copiado' : 'Copiar Texto'}
                      </button>
                    </div>
                    <p className="text-slate-700 text-base leading-relaxed font-medium">
                      {history[0].caption}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => downloadImage(history[0].url, `fruta-premium-${Date.now()}.png`)}
                      className="bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg"
                    >
                      <i className="fas fa-download"></i>
                      Descargar 4:5
                    </button>
                    <button 
                      onClick={handleSurprise}
                      className="bg-white border-2 border-slate-200 text-slate-800 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                    >
                      <i className="fas fa-sync-alt"></i>
                      Nueva Ahora
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Gallery images={history} onDownload={downloadImage} />
      </main>
      
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-slate-400 text-xs">
        <p>© 2024 FruitVision AI Agent • Generación por hora habilitada • Formato Facebook 4:5</p>
      </footer>
    </div>
  );
};

export default App;
