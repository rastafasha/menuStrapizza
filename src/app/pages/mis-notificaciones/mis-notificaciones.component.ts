import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificacionService } from '../../services/notificacion.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ToastrService } from 'ngx-toastr';
// import { ModalInstruccionesComponent } from '../../components/modal-instrucciones/modal-instrucciones.component';
import { MenuFooterComponent } from '../../shared/menu-footer/menu-footer.component';
// import { BackButtnComponent } from '../../shared/backButtn/backButtn.component';


declare var bootstrap: any;

@Component({
  selector: 'app-mis-notificaciones',
  imports: [
    CommonModule,
    InfiniteScrollModule,
    // ModalInstruccionesComponent,
    MenuFooterComponent,
    // BackButtnComponent
  ],
  templateUrl: './mis-notificaciones.component.html',
  styleUrl: './mis-notificaciones.component.scss'
})
export class MisNotificacionesComponent implements OnInit {

  public notificaciones = signal<any[]>([]);
  public loading = signal(false);
  public hasMoreNotif = signal(true);
  public pageNotif = 1;

  public cargando: boolean = true;
  title = 'Notificaciones';
  public notifSeleccionada: any;

  info = `
  <h2>Sección: Notificaciones</h2>
  <p>Mantente al día con el estatus de tu cuenta y los avisos de la comunidad:</p>
  <ul>
    <li><strong>Historial de Pagos:</strong> Consulta las actualizaciones en tiempo real sobre tus reportes (Aprobados o Rechazados).</li> 
    <li><strong>Alertas del Complejo:</strong> Recibe avisos generales y comunicados oficiales del <strong>Complejo Parque Central</strong>.</li> 
    <li><strong>Vista Rápida:</strong> Cada notificación muestra un resumen inicial y la fecha de emisión para tu control.</li> 
    <li><strong>Gestión de Rechazos:</strong> Si un pago es rechazado, verás el <strong>motivo exacto</strong> y tendrás un botón directo para gestionar tus reportes pendientes de corrección.</li>
    <li><strong>Acceso a Detalles:</strong> Utiliza el <strong>botón azul</strong> en cada tarjeta para ampliar la información recibida.</li>
  </ul>`;


  public notificacionService = inject(NotificacionService);
  public router = inject(Router);
  public toastr = inject(ToastrService);

  ngOnInit() {
    window.scrollTo(0, 0);
    this.getNotificaciones();
  }

  onScroll(): void {
    if (this.loading() || !this.hasMoreNotif()) return;

    this.pageNotif++;
    this.getNotificaciones();
  }

  getNotificaciones() {
    if (!this.hasMoreNotif()) return;
    this.loading.set(true);

    // Pasamos la página actual al servicio
    this.notificacionService.obtenerHistorialCompleto(this.pageNotif).subscribe({
      next: (resp: any) => {
        const newData = resp.notificaciones || [];

        if (newData.length === 0) {
          this.hasMoreNotif.set(false);
          this.loading.set(false);
          return;
        }

        // Actualizamos la señal de notificaciones evitando duplicados
        this.notificaciones.update(current => {
          const ids = new Set(current.map(n => n._id));
          const unique = newData.filter((n: any) => !ids.has(n._id));
          return [...current, ...unique];
        });

        // Si el backend nos dice que ya no hay más páginas (proximo === null)
        if (resp.proximo === null) {
          this.hasMoreNotif.set(false);
        }

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }


  limpiarCampana() {
    this.notificacionService.marcarComoLeidas().subscribe({
      next: (res: any) => {

        // 1. Usamos .update() para modificar el contenido de la Signal
        this.notificaciones.update(current => {
          // Modificamos cada notificación en el array actual
          current.forEach(n => n.leido = true);

          // 2. Retornamos una copia del array para que Angular detecte el cambio
          return [...current];
        });

        this.toastr.success('Historial actualizado');
      },
      error: (err) => console.error('Error al marcar como leídas', err)
    });
  }


  abrirDetalle(notificacion: any) {
    this.notifSeleccionada = notificacion;

    // 1. Abrir Offcanvas
    const el = document.getElementById('offcanvasNotif');
    const bsOffcanvas = new bootstrap.Offcanvas(el);
    bsOffcanvas.show();

    // 2. Si no está leída, marcarla en el Backend
    if (!notificacion.leido) {
      // Usamos el endpoint individual (debes tener router.put('/:id', marcarLeida) en Node)
      this.notificacionService.marcarUnaComoLeida(notificacion._id).subscribe(() => {
        notificacion.leido = true; // Actualiza la vista localmente
        this.notificacionService.checkUnreadNotifications(); // Actualiza el badge del Navbar
      });
    }
  }



  irAPagos(tipo: string) {
    if (tipo === 'PAGO_RECHAZADO') {
      this.router.navigate(['/mis-pagos'], {
        queryParams: { status: 'RECHAZADO' }
      });
    }
  }

  irAFacturas(tipo: string) {
    if (tipo === 'NUEVA_FACTURA') {
      this.router.navigate(['/mis-facturas'], {
        queryParams: { estado: 'PENDIENTE' }
      });
    }
  }



}
