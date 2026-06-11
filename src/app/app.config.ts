import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { HttpRequest, HttpHandlerFn, HttpEvent, provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

// Configuración moderna de internacionalización
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideTranslateHttpLoader, TranslateHttpLoader } from '@ngx-translate/http-loader';

// 1. Definimos la factoría fuera del objeto de configuración
export function HttpLoaderFactory(http: HttpClient) {
  // Nota: Busca los JSON por defecto en 'public/assets/i18n/es.json'
  return new TranslateHttpLoader();
  
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withInterceptors([imageInterceptor])
    ),
    
    // 2. Sustituto funcional moderno para Angular
    provideTranslateService({
      lang: 'es',
      fallbackLang: 'es',
      // ✅ SINTAXIS MODERNA DIRECTA: Sin useFactory ni dependencias manuales
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json'
      })
    }),
    
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
    }),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
};

function imageInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  // Check if the request is for an image
  if (req.url.endsWith('.jpg') || req.url.endsWith('.png') || req.url.endsWith('.jpeg')) {
    const jwtToken = window.localStorage.getItem('auth_token');
    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${jwtToken}`
      }
    });
    return next(modifiedReq);
  }
  // Pass through other requests unmodified
  return next(req);
}
