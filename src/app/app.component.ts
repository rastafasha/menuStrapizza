import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { ConectividadService } from './services/conectividad.service';
import { NotificacionService } from './services/notificacion.service';
import { environment } from '../environments/environment';
import { Title } from '@angular/platform-browser';

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
  private titleService = inject(Title);
  // private menuService = inject(MenuService); // Descomenta cuando uses el servicio


  ngOnInit() {
   this.inicializarRestaurante();
    this.configurarNotificaciones();
  }

  private inicializarRestaurante() {
    const hostname = window.location.hostname; // Ej: ://zlipmenu.com
    const partes = hostname.split('.');
    let slug = '';

    // 1. Control para desarrollo local en tu computadora
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      slug = 'pizzeria-de-prueba'; // Pon un slug real de tu BD para probar local
    } else if (partes.length >= 3) {
      // 2. Extrae el subdominio si hay suficientes partes en la URL
      const subdominio = partes[0]; 

      // Evitamos que intente buscar 'www' o el dominio base como restaurante
      if (subdominio !== 'www' && subdominio !== 'zlipmenu') {
        slug = subdominio;
      }
    }

    if (slug) {
      // Cambia el título temporalmente con el slug estilizado
      const nombreFormateado = slug.charAt(0).toUpperCase() + slug.slice(1);
      this.titleService.setTitle(`Zlipmenu | ${nombreFormateado}`);

      // 3. AQUÍ LLAMAS A TU BACKEND DE RENDER CON EL SLUG
      // this.menuService.obtenerPorSlug(slug).subscribe({
      //   next: (res) => {
      //     // Guarda los datos del menú en un servicio global o estado para que tus componentes lo pinten
      //     this.titleService.setTitle(`Zlipmenu | ${res.name}`);
      //   },
      //   error: (err) => console.error('Restaurante no encontrado', err)
      // });
    } else {
      // Si entran a zlipmenu.com a secas sin subdominio
      this.titleService.setTitle('Zlipmenu | Encuentra tu Menú');
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
