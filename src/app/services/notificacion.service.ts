import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

const BackendApi = environment.baseUrl;

export interface Notificacion {
  _id: string;
  usuario: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  leido: boolean;
  referenciaId?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
 private http = inject(HttpClient);
  public toastr = inject(ToastrService);
  public router = inject(Router);
  // Este observable le dirá a cualquier componente si el usuario está suscrito
  public isSubscribed$ = new BehaviorSubject<boolean>(false);
  public isProcessing$ = new BehaviorSubject<boolean>(false);

// Estado reactivo para el contador de no leídas
  private unreadCountSub = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSub.asObservable();

  // Helper privado para no repetir los headers del token en cada método
  private getOptions() {
    return {
      headers: { 'x-token': localStorage.getItem('token') || '' }
    };
  }

 /**
   * 1. Carga el número de pendientes y actualiza el stream reactivo
   */
  cargarContador(): void {
    this.http.get<{ ok: boolean; count: number }>(
      `${BackendApi}/notificaciones/unread-count`, 
      this.getOptions()
    ).subscribe({
      next: (res) => this.unreadCountSub.next(res.count),
      error: () => this.unreadCountSub.next(0)
    });
  }

  /**
   * 2. Consulta el historial (para renderizar alertas visuales tipo Toastr)
   * CORRECCIÓN: Apunta a /historial para obtener el array e itera correctamente sin invertir títulos.
   */
  checkUnreadNotifications() {
    this.http.get<{ ok: boolean, notificaciones: Notificacion[] }>(
      `${BackendApi}/notificaciones/historial?page=1`, // Consultamos la primera página para los Toasts
      this.getOptions()
    ).subscribe(res => {
      if (res.ok && res.notificaciones && res.notificaciones.length > 0) {
        
        // Filtramos solo las que realmente no se han leído todavía
        const noLeidas = res.notificaciones.filter(n => !n.leido);
        
        // Actualizamos el contador global con las que encontramos
        this.unreadCountSub.next(noLeidas.length);

        noLeidas.forEach(notif => {
          let toast;
          const config = { timeOut: 10000, closeButton: true, tapToDismiss: true };

          switch (notif.tipo) {
            case 'PAGO_APROBADO':
              toast = this.toastr.success(notif.mensaje, '✅ Pago Aprobado', config);
              break;
            case 'PAGO_RECHAZADO':
              toast = this.toastr.error(notif.mensaje, '❌ Pago Rechazado', config);
              break;
            
            case 'PEDIDO_APROBADO':
              toast = this.toastr.success(notif.mensaje, '✅ Pedido Aprobada', config);
              break;
            case 'PEDIDO_RECHAZADO':
              toast = this.toastr.error(notif.mensaje, '❌ Pedido Rechazada', config);
              break;
            case 'PEDIDO_FINALIZADO':
              toast = this.toastr.error(notif.mensaje, '❌ Pedido Finalizado', config);
              break;
            case 'PEDIDO_ENVIADO':
              toast = this.toastr.error(notif.mensaje, '❌ Pedido Enviado', config);
              break;
            case 'RESERVACION_CONFIRMADA':
              toast = this.toastr.success(notif.mensaje, '✅ Reservación Confirmada', config);
              break;
            case 'RESERVACION_CANCELADA':
              toast = this.toastr.error(notif.mensaje, '❌ Reservación Cancelada', config);
              break;
            case 'RESERVACION_COMPLETADA':
              toast = this.toastr.error(notif.mensaje, '✅ Reservación Completada', config);
              break;
           
            default:
              toast = this.toastr.info(notif.mensaje, '🔔 Aviso Nuevo', config);
          }

          toast.onTap.subscribe(() => {
            // Marcamos solo esta notificación como leída al hacer click
            this.marcarUnaComoLeida(notif._id).subscribe(() => {
              this.router.navigate([this.determinarRuta(notif.tipo, notif.referenciaId)]);
            });
          });
        });
      }
    });
  }

  /**
   * 3. Marcar TODAS como leídas
   */
  marcarComoLeidas(): Observable<any> {
    return this.http.put(`${BackendApi}/notificaciones/marcar-leidas`, {}, this.getOptions()).pipe(
      tap(() => this.unreadCountSub.next(0)) // Limpia el contador instantáneamente en la UI
    );
  }

  /**
   * 4. Marcar UNA sola como leída
   */
  marcarUnaComoLeida(id: string): Observable<any> {
    return this.http.put(`${BackendApi}/notificaciones/${id}`, {}, this.getOptions()).pipe(
      tap(() => {
        const actual = this.unreadCountSub.value;
        if (actual > 0) this.unreadCountSub.next(actual - 1); // Resta 1 al contador global
      })
    );
  }

  /**
   * 5. Obtener historial completo paginado (Tu backend usa "page", adaptemos el parámetro)
   */
  obtenerHistorialCompleto(page: number = 1): Observable<{ ok: boolean, notificaciones: Notificacion[], proximo: number | null }> {
    return this.http.get<{ ok: boolean, notificaciones: Notificacion[], proximo: number | null }>(
      `${BackendApi}/notificaciones/historial?page=${page}`,
      this.getOptions()
    );
  }

  /**
   * Helper dinámico para resolver rutas basándose en tus ENUMs reales
   */
  private determinarRuta(tipo: string, refId?: string): string {
    if (!refId) return '/home';
    if (tipo.startsWith('PAGO_') || tipo === 'NUEVO_PAGO') return `/mis-pagos`;
    if (tipo.startsWith('PEDIDO_') || tipo === 'NUEVA_SOLICITUD') return `/solicitudes`;
    if (tipo.startsWith('RESERVACION_')) return `/reservaciones`;
    return '/home';
  }

    /**
   * 🟢 NUEVO: Eliminar una sola notificación por su ID en el panel del admin
   */
  borrarNotificacion(id: string): Observable<any> {
    return this.http.delete(`${BackendApi}/notificaciones/por_id/${id}`, this.getOptions()).pipe(
      tap(() => this.cargarContador()) // Recarga el número actual tras la eliminación
    );
  }

  /**
   * 🟢 NUEVO: Vaciar completamente el buzón de notificaciones del admin
   */
  limpiarBuzonCompleto(): Observable<any> {
    return this.http.delete(`${BackendApi}/notificaciones/limpiar/todas`, this.getOptions()).pipe(
      tap(() => this.unreadCountSub.next(0)) // Resetea inmediatamente en la UI
    );
  }
}
