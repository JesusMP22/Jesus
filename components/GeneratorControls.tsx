
import React from 'react';
import { StylePreset } from '../types';

interface GeneratorControlsProps {
  fruit: string;
  setFruit: (val: string) => void;
  style: StylePreset;
  setStyle: (val: StylePreset) => void;
  details: string;
  setDetails: (val: string) => void;
  onGenerate: () => void;
  onSurprise: () => void;
  isGenerating: boolean;
  autoMode: boolean;
  setAutoMode: (val: boolean) => void;
}

const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  fruit, setFruit, style, setStyle, details, setDetails, onGenerate, onSurprise, isGenerating, autoMode, setAutoMode
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6">
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <i className="fas fa-robot text-orange-500"></i>
          <span className="text-sm font-bold text-slate-700">Piloto Automático</span>
        </div>
        <button 
          onClick={() => setAutoMode(!autoMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoMode ? 'bg-orange-500' : 'bg-slate-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoMode ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {!autoMode && (
        <>
          <section>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fruta o Arreglo</label>
            <input
              type="text"
              value={fruit}
              onChange={(e) => setFruit(e.target.value)}
              placeholder="Ej: Rodajas de Pitaya con miel"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
            />
          </section>

          <section>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Estilo Visual</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value as StylePreset)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
            >
              {Object.values(StylePreset).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </section>
        </>
      )}

      {autoMode && (
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 animate-pulse text-center">
          <p className="text-orange-700 text-xs font-bold uppercase tracking-widest mb-1 italic">El Agente está al mando</p>
          <p className="text-slate-600 text-sm">Elegirá frutas, estilos y textos de forma infinita y aleatoria.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onGenerate}
          disabled={(!fruit && !autoMode) || isGenerating}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
            isGenerating 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-orange-200'
          }`}
        >
          {isGenerating ? (
            <><i className="fas fa-circle-notch animate-spin"></i> Procesando...</>
          ) : (
            <><i className={`fas ${autoMode ? 'fa-play' : 'fa-wand-magic-sparkles'}`}></i> {autoMode ? 'Iniciar Ciclo' : 'Generar Ahora'}</>
          )}
        </button>

        {!autoMode && (
          <button
            onClick={onSurprise}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2 transition-all border border-slate-200"
          >
            <i className="fas fa-dice"></i>
            ¡Sorpréndeme! (Aleatorio)
          </button>
        )}
      </div>
    </div>
  );
};

export default GeneratorControls;
