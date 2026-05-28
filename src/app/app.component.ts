import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { ConectividadService } from './services/conectividad.service';
import { NotificacionService } from './services/notificacion.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'menuapp';
  private swPush = inject(SwPush);
  private router = inject(Router);
  private connectivity = inject(ConectividadService);
  private notificacionService = inject(NotificacionService);

  ngOnInit() {
  this.notificacionService.checkUnreadNotifications();
  // 1. Escuchar el CLICK en la notificación
  this.swPush.notificationClicks.subscribe(({ notification }) => {
    console.log('Notificación clickeada:', notification);

    // Extraemos la URL del objeto 'data' que viene de Node.js
    const targetUrl = notification.data?.url;

    // Ejecutamos la navegación AQUÍ ADENTRO, donde la variable existe
    if (targetUrl) {
      this.router.navigateByUrl(targetUrl);
    } else {
      this.router.navigate(['/home']);
    }
  });

  // 2. Escuchar cuando llega una notificación con la APP ABIERTA
  this.swPush.messages.subscribe(msg => {
    console.log('Mensaje recibido con la app abierta:', msg);
  });
}
}
