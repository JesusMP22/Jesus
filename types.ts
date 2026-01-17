
export enum StylePreset {
  STUDIO = 'Studio Macro',
  SPLASH = 'Water Splash',
  NATURE = 'Natural sunlight',
  CREATIVE = 'Abstract/Artistic',
  MINIMAL = 'Minimalist White'
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  fruit: string;
  caption: string; // New property for Facebook post text
  timestamp: number;
}

export interface GenerationConfig {
  fruit: string;
  style: StylePreset;
  details: string;
}
