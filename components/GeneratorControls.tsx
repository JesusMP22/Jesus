
import React from 'react';
import { StylePreset, SupportedLanguage } from '../types';

interface GeneratorControlsProps {
  fruit: string;
  setFruit: (val: string) => void;
  style: StylePreset;
  setStyle: (val: StylePreset) => void;
  details: string;
  setDetails: (val: string) => void;
  language: SupportedLanguage;
  setLanguage: (val: SupportedLanguage) => void;
  onGenerate: () => void;
  onSurprise: () => void;
  isGenerating: boolean;
  autoMode: boolean;
  setAutoMode: (val: boolean) => void;
}

const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  fruit, setFruit, style, setStyle, details, setDetails, language, setLanguage, onGenerate, onSurprise, isGenerating, autoMode, setAutoMode
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-5">
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <i className={`fas fa-robot ${autoMode ? 'text-green-500 animate-pulse' : 'text-slate-400'}`}></i>
            <span className="text-sm font-bold text-slate-800">Agente Autónomo (1h)</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">{autoMode ? 'ACTIVO: Publicando cada hora' : 'INACTIVO: Pulsa para activar'}</span>
        </div>
        <button 
          onClick={() => setAutoMode(!autoMode)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none ${autoMode ? 'bg-green-500 shadow-md shadow-green-100' : 'bg-slate-300'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${autoMode ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <section>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Idioma de Publicación</label>
        <div className="grid grid-cols-4 gap-2">
          {(['es', 'en', 'fr', 'pt'] as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`py-2 text-xs font-bold rounded-lg border transition-all ${language === lang ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {!autoMode ? (
        <>
          <section>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fruta o Composición</label>
            <input
              type="text"
              value={fruit}
              onChange={(e) => setFruit(e.target.value)}
              placeholder="Ej: Kiwis con hielo picado"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none text-sm"
            />
          </section>

          <section>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estilo de Fotografía</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value as StylePreset)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
            >
              {Object.values(StylePreset).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </section>
        </>
      ) : (
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-magic text-green-600"></i>
          </div>
          <p className="text-green-800 text-xs font-medium leading-tight">
            El Agente elegirá automáticamente la mejor fruta y estilo para tu próxima publicación.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={onGenerate}
          disabled={(!fruit && !autoMode) || isGenerating}
          className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
            isGenerating 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200 active:scale-95'
          }`}
        >
          {isGenerating ? (
            <><i className="fas fa-spinner animate-spin"></i> Generando...</>
          ) : (
            <><i className="fas fa-rocket"></i> {autoMode ? 'Forzar Publicación Ahora' : 'Generar Imagen'}</>
          )}
        </button>

        {!autoMode && (
          <button
            onClick={onSurprise}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl font-bold text-xs text-slate-500 bg-white hover:bg-slate-50 flex items-center justify-center gap-2 transition-all border border-slate-200 uppercase tracking-tighter"
          >
            <i className="fas fa-lightbulb"></i>
            Idea Aleatoria
          </button>
        )}
      </div>
    </div>
  );
};

export default GeneratorControls;
