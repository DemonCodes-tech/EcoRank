export interface Theme {
  id: string;
  name: string;
  colors: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
    [key: string]: string;
  };
}

// Manually curated 12 themes
export const themes: Theme[] = [
  {
    id: 'matrix',
    name: 'Matrix Protocol',
    colors: { // Emerald
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
      500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Night City',
    colors: { // Fuchsia/Magenta
      50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9',
      500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75', 950: '#4a044e'
    }
  },
  {
    id: 'oceanic',
    name: 'Deep Dive',
    colors: { // Cyan
      50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee',
      500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344'
    }
  },
  {
    id: 'crimson',
    name: 'Red Alert',
    colors: { // Red
      50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
      500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a'
    }
  },
  {
    id: 'voltage',
    name: 'High Voltage',
    colors: { // Yellow/Amber
      50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15',
      500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006'
    }
  },
  {
    id: 'royal',
    name: 'Royal Void',
    colors: { // Violet
      50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
      500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065'
    }
  },
  {
    id: 'toxic',
    name: 'Bio Hazard',
    colors: { // Lime
      50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635',
      500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314', 950: '#1a2e05'
    }
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    colors: { // Zinc/Slate - monochrome
      50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa',
      500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b'
    }
  },
  {
    id: 'sunset',
    name: 'Solar Flare',
    colors: { // Orange
      50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
      500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407'
    }
  },
  {
    id: 'azure',
    name: 'Azure Sky',
    colors: { // Sky Blue
      50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8',
      500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49'
    }
  },
  {
    id: 'nebula',
    name: 'Cosmic Dust',
    colors: { // Pink
      50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6',
      500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724'
    }
  },
  {
    id: 'indigo',
    name: 'Deep Space',
    colors: { // Indigo
      50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
      500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'
    }
  }
];

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([shade, value]) => {
    root.style.setProperty(`--eco-${shade}`, value);
  });
  
  localStorage.setItem('ecorank_theme', JSON.stringify(theme));
};

export const getSavedTheme = (): Theme => {
  try {
    const saved = localStorage.getItem('ecorank_theme');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load theme", e);
  }
  return themes[0];
};