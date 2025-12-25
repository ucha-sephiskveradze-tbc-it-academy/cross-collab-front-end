import { Injectable } from '@angular/core';

export type ThemeName = 'theme-light' | 'theme-dark' | 'theme-blue' | 'theme-custom';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'app:theme';
  private current: ThemeName = 'theme-light';

  constructor() {
    // If a theme is stored, use it; otherwise prefer system dark if present
    const saved = localStorage.getItem(this.storageKey) as ThemeName | null;
    const initial = saved ?? this.getSystemTheme() ?? 'theme-light';
    this.setTheme(initial);
  }

  setTheme(theme: ThemeName) {
    const body = document.body;
    body.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-custom');
    body.classList.add(theme);
    this.current = theme;
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (e) {
      // ignore storage errors
    }
  }

  getTheme(): ThemeName {
    return this.current;
  }

  getAvailableThemes(): ThemeName[] {
    return ['theme-light', 'theme-dark', 'theme-blue', 'theme-custom'];
  }

  private getSystemTheme(): ThemeName | null {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'theme-dark';
    }
    return null;
  }
}
