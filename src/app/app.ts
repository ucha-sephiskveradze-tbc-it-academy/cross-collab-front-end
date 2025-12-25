import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('cross-colab');
  private themeService = inject(ThemeService);

  constructor() {
    // Apply the custom palette for preview
    this.themeService.setTheme('theme-custom');
  }
}
