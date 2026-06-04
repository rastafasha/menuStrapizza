import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { BusquedasService } from '../../../../services/busqueda.service';
import { ReservacionService } from '../../../../services/reservacion.service';
import { TiendaService } from '../../../../services/tienda.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { HeaderComponent } from '../../../../shared/header/header.component';
import { AsideCuentaComponent } from '../../aside-cuenta/aside-cuenta.component';
import { ReservaCrearComponent } from '../reserva-crear/reserva-crear.component';
import { Reservacion } from '../../../../models/reservacion.model';
import { ModalInstruccionesComponent } from '../../../../components/modal-instrucciones/modal-instrucciones.component';
declare var bootstrap: any;

@Component({
  selector: 'app-reservaciones',
  imports: [
    CommonModule,
    HeaderComponent,
    InfiniteScrollModule,
    FormsModule,
     ModalInstruccionesComponent,
    AsideCuentaComponent,
    ReservaCrearComponent,
],
  templateUrl: './reservaciones.component.html',
  styleUrl: './reservaciones.component.scss'
})
export class ReservacionesComponent {

  reservaciones = signal<any[]>([]);
  loading = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  isFiltering = signal(false);
  showToast = signal(false);
  showToastReservacion = signal(false);
  isFilteringReservacion = signal(false);
  reservacionSeleccionado = signal<any>(null);
  page = 1;
  userId!: string;
  query: string = '';
  user: any;
  status!: string;
  statusPago: string = '';
  tienda_moneda: string = '';
  tiendaSelected!: any;

  presupuestoSeleccionado = signal<any>(null);

  info = `
  <h2>Sección: Mis Reservaciones</h2>
  <p>En este apartado podrás:</p>
  <ul>
    <li><strong>Consultar el historial</strong> de tus reservaciones, identificadas con colores según su estatus (Pendiente, Aprobada o Rechazada).</li>
    <li><strong>Localizar transacciones</strong> rápidamente buscando por fecha, número de referencia o monto.</li>
    <li><strong>Filtrar la lista</strong> para ver solo los pagos que te interesen según su estado actual.</li>
    <li><strong>Acceder al detalle</strong> completo de cada operación utilizando el botón "Ver Ticket".</li>
  </ul>`;



  private router = inject(Router);
  private busquedasService = inject(BusquedasService);
  private usuarioService = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private reservacionService = inject(ReservacionService);
  private tiendaService = inject(TiendaService);

  ngOnInit() {
    window.scrollTo(0, 0);
    // this.user = this.usuarioService.getLocalStorage();
     let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.userId = this.user.uid;

    this.getReservacionUsuario();

    // LEER PARÁMETROS DE LA URL
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        // Asignamos 'RECHAZADO' según envíes desde el Home
        this.status = params['status'];
        this.isFilteringReservacion.set(true);
      }

      // Ahora ejecutamos la carga (que ya usa this.status)
      this.getReservacionUsuario();
      this.escucharTiendaActiva();
    });
  }

  

    escucharTiendaActiva() {
    this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      if (tienda) {
        this.tiendaSelected = tienda;
        this.tienda_moneda  = this.tiendaSelected.moneda
      }
    });
  }

  onScroll(): void {
    if (this.loading() || !this.hasMore()) return;

    // Si hay búsqueda por TEXTO (query), normalmente el backend devuelve todo de golpe.
    // Pero si es por ESTATUS, queremos seguir bajando:
    this.page++;
    this.getReservacionUsuario();
  }

  getReservacionUsuario() {
    if (!this.hasMore()) return; // Si ya sabemos que no hay más en el servidor, paramos.
    this.loading.set(true);

    this.reservacionService.getReservacionByUser(this.userId, this.page).subscribe({
      next: (newData: any[]) => {
        if (newData.length === 0) {
          this.hasMore.set(false);
          this.loading.set(false);
        } else {
          // 1. Filtrado local por estatus
          let filteredData = newData;
          if (this.status) {
            filteredData = newData.filter(p => p.status === this.status);
          }


          // 2. Agregamos los únicos a la lista visible
          this.reservaciones.update(current => {
            const ids = new Set(current.map(p => p._id));
            const unique = filteredData.filter(p => !ids.has(p._id));
            return [...current, ...unique];
          });

          // 3. LA CLAVE: Si estamos filtrando y trajo muy pocos (ej. menos de 5) 
          // o ninguno, pero el API dice que hay más páginas, pedimos la siguiente YA.
          if (this.status && filteredData.length < 5 && newData.length > 0) {
            this.page++;
            this.getReservacionUsuario(); // Llamada recursiva controlada
          } else {
            this.loading.set(false);
          }
        }
      },
      error: () => this.loading.set(false)
    });
  }

  search(): void {
    // 1. Resetear estados de paginación cada vez que filtramos
    this.page = 1;
    this.hasMore.set(true);
    this.reservaciones.set([]);

    // CASO A: El usuario escribió algo en el buscador (Texto)
    if (this.query && this.query.trim() !== '') {
      this.isFiltering.set(true);
      this.loading.set(true);

      this.busquedasService.buscar('reservaciones', this.query).subscribe({
        next: (resultados: any[]) => {
          let filtered = resultados;
          // Si además de texto seleccionó un estatus, filtramos el array
          if (this.status) {
            filtered = resultados.filter((p: any) => p.status === this.status);
          }
          this.reservaciones.set(filtered);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }

    // CASO B: No hay texto, pero quizás seleccionó un Estatus (o "Todos")
    else {
      // Si seleccionó un estatus o volvió a "Todos", usamos la carga normal
      // getReservacionUsuario ahora debe enviar this.status al servicio
      this.isFiltering.set(this.status !== '');
      this.getReservacionUsuario();
    }
  }


  clearFilters(): void {
    // Vibración y reset de filtros
    if (navigator.vibrate) navigator.vibrate(50);

    this.query = '';
    this.status = '';
    this.isFiltering.set(false);
    this.page = 1;
    this.hasMore.set(true);
    this.reservaciones.set([]);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. ACTIVAR EL TOAST Y PROGRAMAR CIERRE
    this.showToast.set(true);

    setTimeout(() => {
      this.showToast.set(false);
    }, 2500); // Se ocultará solo después de 2.5 segundos

    this.getReservacionUsuario();
  }

  verDetallePago(resev: any) {
    this.reservacionSeleccionado.set(resev);

    const el = document.getElementById('offcanvasPago');
    const bsOffcanvas = new bootstrap.Offcanvas(el);
    bsOffcanvas.show();
  }

  

  onEditProject(resev: Reservacion) {
      this.reservacionSeleccionado.set(resev);
      
    }

}
