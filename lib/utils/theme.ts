// Theme system for dark/light mode

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgHover: string;
  bgActive: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Borders
  borderPrimary: string;
  borderSecondary: string;
  
  // Accents
  accentPrimary: string;
  accentSecondary: string;
  accentGradientFrom: string;
  accentGradientTo: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Shadows
  shadowColor: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
}

export const DARK_THEME: Theme = {
  mode: 'dark',
  colors: {
    bgPrimary: '#0f0f1a',
    bgSecondary: '#1a1a2e',
    bgTertiary: '#252540',
    bgHover: '#2a2a45',
    bgActive: '#3a3a55',
    
    textPrimary: '#ffffff',
    textSecondary: '#a0a0b0',
    textMuted: '#6b6b80',
    
    borderPrimary: '#3a3a55',
    borderSecondary: '#252540',
    
    accentPrimary: '#8B5CF6',
    accentSecondary: '#EC4899',
    accentGradientFrom: '#8B5CF6',
    accentGradientTo: '#EC4899',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    shadowColor: 'rgba(0, 0, 0, 0.5)',
  },
};

export const LIGHT_THEME: Theme = {
  mode: 'light',
  colors: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f8f9fa',
    bgTertiary: '#e9ecef',
    bgHover: '#dee2e6',
    bgActive: '#ced4da',
    
    textPrimary: '#1a1a2e',
    textSecondary: '#495057',
    textMuted: '#868e96',
    
    borderPrimary: '#dee2e6',
    borderSecondary: '#e9ecef',
    
    accentPrimary: '#7C3AED',
    accentSecondary: '#DB2777',
    accentGradientFrom: '#7C3AED',
    accentGradientTo: '#DB2777',
    
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
    
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
};

const THEME_STORAGE_KEY = 'cartoon-studio-theme';

// Get stored theme preference
export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to get stored theme:', error);
  }
  
  return 'dark'; // Default to dark
}

// Save theme preference
export function saveThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    console.warn('Failed to save theme:', error);
  }
}

// Get system preference
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Resolve theme mode to actual theme
export function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'system') {
    return getSystemTheme() === 'dark' ? DARK_THEME : LIGHT_THEME;
  }
  return mode === 'dark' ? DARK_THEME : LIGHT_THEME;
}

// Apply theme to document
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Set CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${camelToKebab(key)}`, value);
  });
  
  // Set data attribute for CSS selectors
  root.setAttribute('data-theme', theme.mode);
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.colors.bgPrimary);
  }
}

// Convert camelCase to kebab-case
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Generate CSS variables string
export function generateCSSVariables(theme: Theme): string {
  return Object.entries(theme.colors)
    .map(([key, value]) => `--${camelToKebab(key)}: ${value};`)
    .join('\n  ');
}

// Theme context types for React
export interface ThemeContextValue {
  mode: ThemeMode;
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// Watch for system theme changes
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
}

// Tailwind-compatible class generator
export function themeClass(
  lightClass: string,
  darkClass: string,
  currentMode: 'light' | 'dark'
): string {
  return currentMode === 'dark' ? darkClass : lightClass;
}

// Get contrasting text color
export function getContrastColor(bgColor: string): string {
  // Simple luminance check
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
