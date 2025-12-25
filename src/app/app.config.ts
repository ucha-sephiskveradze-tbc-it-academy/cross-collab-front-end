import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import MyPreset from './core/theme/mypreset';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ngrokInterceptor } from './core/interceptors/ngrok.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([ngrokInterceptor, authInterceptor])),

    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
