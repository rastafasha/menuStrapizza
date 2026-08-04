import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { ConectividadService } from './services/conectividad.service';
import { NotificacionService } from './services/notificacion.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'menuapp';
  user:any;
  private swPush = inject(SwPush);
  private router = inject(Router);
  private connectivity = inject(ConectividadService);
  private notificacionService = inject(NotificacionService);
  private authService = inject(AuthService);


  ngOnInit() {
    this.user = this.authService.getLocalStorage();
    if(this.user){
      this.configurarNotificaciones();

    }
  }

  private configurarNotificaciones() {
    this.notificacionService.checkUnreadNotifications();

    this.swPush.notificationClicks.subscribe(({ notification }) => {
      console.log('Notificación clickeada:', notification);
      const targetUrl = notification.data?.url;

      if (targetUrl) {
        this.router.navigateByUrl(targetUrl);
      } else {
        this.router.navigate(['/home']);
      }
    });

    this.swPush.messages.subscribe(msg => {
      console.log('Mensaje recibido con la app abierta:', msg);
    });
  }
}
