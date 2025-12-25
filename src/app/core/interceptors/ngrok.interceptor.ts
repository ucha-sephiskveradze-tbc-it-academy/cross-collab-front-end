import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment.test';

/**
 * Interceptor to add ngrok-specific headers to bypass browser warning
 * and handle CORS preflight requests
 */
export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {
  // Only apply to requests going to ngrok URL
  if (req.url.startsWith(environment.authApiUrl)) {
    // Only add ngrok header, let Angular handle Content-Type automatically
    const ngrokReq = req.clone({
      setHeaders: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    return next(ngrokReq);
  }

  return next(req);
};

