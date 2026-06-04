import { inject, Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const claveVapidApi = environment.VAPI_KEY_PUBLIC;
const urlBackend = environment.urlBackedNotification;

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  readonly VAPID_PUBLIC_KEY = claveVapidApi;

  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  public toastr = inject(ToastrService);
  public router = inject(Router);
  // Este observable le dirá a cualquier componente si el usuario está suscrito
  public isSubscribed$ = new BehaviorSubject<boolean>(false);
  public isProcessing$ = new BehaviorSubject<boolean>(false);


  constructor() {
    this.checkSubscriptionStatus();
    this.checkInitialStatus();
  }
  async checkInitialStatus() {
    // Verificamos si el navegador ya tiene una suscripción activa
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    this.isSubscribed$.next(!!sub);
  }
  setSubscriptionStatus(status: boolean) {
    this.isSubscribed$.next(status);
  }
  async checkSubscriptionStatus() {
    // 1. Esperamos a que el Service Worker esté listo
    const reg = await navigator.serviceWorker.ready;
    // 2. Buscamos si ya hay una suscripción
    const sub = await reg.pushManager.getSubscription();
    // 3. Si hay suscripción, avisamos a la App
    this.isSubscribed$.next(!!sub);
  }

  subscribeToNotifications() {
    this.isProcessing$.next(true);
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then(sub => {
        // 1. EXTRAER EL TOKEN (Usa 'token' porque así lo guardas)
        const miToken = localStorage.getItem('token') || '';

        // 2. CONFIGURAR EL HEADER (Asegúrate de que coincida con tu validarJWT en Node)
        // Si tu middleware usa req.header('x-token'), pon 'x-token' aquí:
        const headers = {
          'x-token': miToken
        };
        this.isSubscribed$.next(true);
        console.log('Enviando con token:', miToken);

        // 3. HACER EL POST AL BACKEND
        this.http.post(urlBackend, sub, { headers }).subscribe({
          next: () => console.log('✅ ¡Suscripción guardada en Render!'),
          error: err => console.error('❌ Error 401 persistente:', err)
        });

        this.isSubscribed$.next(true);
        this.isProcessing$.next(false);
        this.toastr.success('¡Notificaciones activadas!'); // Feedback visual
      })
  }

 


 




}
