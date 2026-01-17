
export enum StylePreset {
  STUDIO = 'Studio Macro',
  SPLASH = 'Water Splash',
  NATURE = 'Natural sunlight',
  CREATIVE = 'Abstract/Artistic',
  MINIMAL = 'Minimalist White'
}

export type SupportedLanguage = 'es' | 'en' | 'fr' | 'pt';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  fruit: string;
  caption: string;
  timestamp: number;
}

export interface GenerationConfig {
  fruit: string;
  style: StylePreset;
  details: string;
  language: SupportedLanguage;
}
