import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface ThemeColors {
  primary: string;
  accent: string;
  bgStart: string;
  bgMid: string;
  bgEnd: string;
}

export const DEFAULT_THEME: ThemeColors = {
  primary: '#0ea5e9',
  accent: '#8b5cf6',
  bgStart: '#0f172a',
  bgMid: '#1e293b',
  bgEnd: '#0f172a',
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: ThemeColors = { ...DEFAULT_THEME };

  constructor(private supabase: SupabaseService) {}

  async loadTheme() {
    try {
      const profile = await this.supabase.getProfile();
      if (profile && (profile as any).theme_colors) {
        this.currentTheme = { ...DEFAULT_THEME, ...(profile as any).theme_colors };
      }
    } catch { /* use defaults */ }
    this.applyTheme();
  }

  getTheme(): ThemeColors {
    return { ...this.currentTheme };
  }

  async saveTheme(theme: ThemeColors) {
    this.currentTheme = { ...theme };
    this.applyTheme();
    try {
      await this.supabase.updateProfile({ theme_colors: theme } as any);
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  }

  applyTheme() {
    const t = this.currentTheme;
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', t.primary);
    root.style.setProperty('--theme-accent', t.accent);
    root.style.setProperty('--theme-bg-start', t.bgStart);
    root.style.setProperty('--theme-bg-mid', t.bgMid);
    root.style.setProperty('--theme-bg-end', t.bgEnd);

    // Convert hex to RGB for alpha compositing
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    };

    root.style.setProperty('--theme-primary-rgb', hexToRgb(t.primary));
    root.style.setProperty('--theme-accent-rgb', hexToRgb(t.accent));
  }

  resetTheme() {
    this.currentTheme = { ...DEFAULT_THEME };
    this.applyTheme();
  }
}
