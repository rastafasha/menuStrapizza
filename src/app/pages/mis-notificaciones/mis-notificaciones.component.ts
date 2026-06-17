import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificacionService } from '../../services/notificacion.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ToastrService } from 'ngx-toastr';
import { MenuFooterComponent } from '../../shared/menu-footer/menu-footer.component';
import { TranslatePipe } from '@ngx-translate/core';
import { TiendaService } from '../../services/tienda.service';
import { Subscription } from 'rxjs';
import { Tienda } from '../../models/tienda.model';


declare var bootstrap: any;

@Component({
  selector: 'app-mis-notificaciones',
  imports: [
    CommonModule,
    InfiniteScrollModule,
    MenuFooterComponent,
    TranslatePipe
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
  tiendaSelected: Tienda | undefined | null = null;

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

  private tiendaSubscription!: Subscription;
  
    private tiendaService = inject(TiendaService);

  public notificacionService = inject(NotificacionService);
  public router = inject(Router);
  public toastr = inject(ToastrService);

  ngOnInit() {
    window.scrollTo(0, 0);
    this.getNotificaciones();
    this.getTienda();
  }

  getTienda(){
    this.tiendaSubscription = this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      this.tiendaSelected = tienda;
    });
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
    this.notificacionService.obtenerHistorialCompleto(this.pageNotif, this.tiendaSelected?._id, false).subscribe({
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

  cerrarOffcanvas() {
  const el = document.getElementById('offcanvasNotif');
  // Obtenemos la instancia existente de Bootstrap en ese elemento
  const bsOffcanvas = bootstrap.Offcanvas.getInstance(el);
  
  // Si la instancia existe, la cerramos
  if (bsOffcanvas) {
    bsOffcanvas.hide();
  }
}



  irAPagos(tipo: string) {
    if (tipo === 'PAGO_RECHAZADO') {
      this.router.navigate(['/mis-pagos'], {
        queryParams: { status: 'RECHAZADO' }
      });
    }
  }

  irAReservaciones(tipo: string) {
    if (tipo === 'RESERVACION_CANCELADA') {
      this.router.navigate(['/reservaciones'], {
        queryParams: { estado: 'Cancelada' }
      });
    }
  }
  irAPedidos(tipo: string) {
    if (tipo === 'PEDIDO_RECHAZADO') {
      this.router.navigate(['/my-account/pedidos'], {
        queryParams: { estado: 'PENDIENTE' }
      });
    }
  }

  eliminarIndividual(id: string) {
    this.notificacionService.borrarNotificacion(id).subscribe(() => {
      this.toastr.success('Notificación Eliminada');
      this.cerrarOffcanvas();
      this.ngOnInit();
    });
  }

  // 1. Este botón abre el modal en lugar del confirm feo
vaciarTodo() {
  const el = document.getElementById('modalConfirmarVaciar');
  const modal = new bootstrap.Modal(el);
  modal.show();
}

// 2. Esta función se ejecuta solo si le da al botón "Sí, borrar todo"
confirmarVaciarTodo() {
  this.notificacionService.limpiarBuzonCompleto().subscribe(() => {
    this.getNotificaciones(); 
    
    // Cerramos el modal de forma limpia
    const el = document.getElementById('modalConfirmarVaciar');
    const modal = bootstrap.Modal.getInstance(el);
    if (modal) modal.hide();
  });
}



}
