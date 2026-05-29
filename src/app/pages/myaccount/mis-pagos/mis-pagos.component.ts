import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HeaderComponent } from '../../../shared/header/header.component';
import { BusquedasService } from '../../../services/busqueda.service';
import { ImagenPipe } from '../../../pipes/imagen-pipe.pipe';
import { UsuarioService } from '../../../services/usuario.service';
import { AsideCuentaComponent } from '../aside-cuenta/aside-cuenta.component';
import { TransferenciasService } from '../../../services/transferencias.service';
import { TiendaService } from '../../../services/tienda.service';
import { environment } from '../../../../environments/environment';
import { SafePipe } from '../../../pipes/safe.pipe';

declare var bootstrap: any;
@Component({
  selector: 'app-mis-pagos',
  imports: [
    CommonModule,
    HeaderComponent,
    InfiniteScrollModule,
    FormsModule,
    //  ModalInstruccionesComponent,
    ImagenPipe,
    AsideCuentaComponent,
    SafePipe
  ],
  templateUrl: './mis-pagos.component.html',
  styleUrl: './mis-pagos.component.scss'
})
export class MisPagosComponent implements OnInit {

  transferencias = signal<any[]>([]);
  loading = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  isFiltering = signal(false);
  showToast = signal(false);
  showToastFactura = signal(false);
  isFilteringFactura = signal(false);
  pagoSeleccionado = signal<any>(null);
  page = 1;
  userId!: string;
  query: string = '';
  user: any;
  status!: string;
  statusPago: string = '';
  nombreSelected = environment.nombreSelected;
  tienda_moneda: string = '';

  info = `
  <h2>Sección: Mis Pagos</h2>
  <p>En este apartado podrás:</p>
  <ul>
    <li><strong>Consultar el historial</strong> de tus pagos, identificados con colores según su estatus (Pendiente, Aprobado o Rechazado).</li>
    <li><strong>Localizar transacciones</strong> rápidamente buscando por fecha, número de referencia o monto.</li>
    <li><strong>Filtrar la lista</strong> para ver solo los pagos que te interesen según su estado actual.</li>
    <li><strong>Acceder al detalle</strong> completo de cada operación utilizando el botón "Ver Ticket".</li>
  </ul>`;



  private router = inject(Router);
  private busquedasService = inject(BusquedasService);
  private usuarioService = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private transferenciasService = inject(TransferenciasService);
  private tiendaService = inject(TiendaService);

  ngOnInit() {
    window.scrollTo(0, 0);
    // this.user = this.usuarioService.getLocalStorage();
     let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.userId = this.user.uid;

    this.getPagosUsuario();

    // LEER PARÁMETROS DE LA URL
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        // Asignamos 'RECHAZADO' según envíes desde el Home
        this.status = params['status'];
        this.isFilteringFactura.set(true);
      }

      // Ahora ejecutamos la carga (que ya usa this.status)
      this.getPagosUsuario();
      this.getTienda();
    });
  }

   getTienda() {
      this.tiendaService.getTiendaByName(this.nombreSelected).subscribe((resp: any) => {
        this.tienda_moneda = resp.moneda;
      })
    }

  onScroll(): void {
    if (this.loading() || !this.hasMore()) return;

    // Si hay búsqueda por TEXTO (query), normalmente el backend devuelve todo de golpe.
    // Pero si es por ESTATUS, queremos seguir bajando:
    this.page++;
    this.getPagosUsuario();
  }

  getPagosUsuario() {
    if (!this.hasMore()) return; // Si ya sabemos que no hay más en el servidor, paramos.
    this.loading.set(true);

    this.transferenciasService.getByUser(this.userId, this.page).subscribe({
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
          this.transferencias.update(current => {
            const ids = new Set(current.map(p => p._id));
            const unique = filteredData.filter(p => !ids.has(p._id));
            return [...current, ...unique];
          });

          // 3. LA CLAVE: Si estamos filtrando y trajo muy pocos (ej. menos de 5) 
          // o ninguno, pero el API dice que hay más páginas, pedimos la siguiente YA.
          if (this.status && filteredData.length < 5 && newData.length > 0) {
            this.page++;
            this.getPagosUsuario(); // Llamada recursiva controlada
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
    this.transferencias.set([]);

    // CASO A: El usuario escribió algo en el buscador (Texto)
    if (this.query && this.query.trim() !== '') {
      this.isFiltering.set(true);
      this.loading.set(true);

      this.busquedasService.buscar('transferencias', this.query).subscribe({
        next: (resultados: any[]) => {
          let filtered = resultados;
          // Si además de texto seleccionó un estatus, filtramos el array
          if (this.status) {
            filtered = resultados.filter((p: any) => p.status === this.status);
          }
          this.transferencias.set(filtered);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }

    // CASO B: No hay texto, pero quizás seleccionó un Estatus (o "Todos")
    else {
      // Si seleccionó un estatus o volvió a "Todos", usamos la carga normal
      // getPagosUsuario ahora debe enviar this.status al servicio
      this.isFiltering.set(this.status !== '');
      this.getPagosUsuario();
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
    this.transferencias.set([]);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. ACTIVAR EL TOAST Y PROGRAMAR CIERRE
    this.showToast.set(true);

    setTimeout(() => {
      this.showToast.set(false);
    }, 2500); // Se ocultará solo después de 2.5 segundos

    this.getPagosUsuario();
  }

  verDetallePago(pago: any) {
    this.pagoSeleccionado.set(pago);

    const el = document.getElementById('offcanvasPago');
    const bsOffcanvas = new bootstrap.Offcanvas(el);
    bsOffcanvas.show();
  }

  reportarPago(payment: any) {
    // Verificamos si el objeto tiene el ID de la factura
    const facturaId = payment.factura?._id || payment.factura;

    if (facturaId) {
      this.router.navigate(['/reportar-pago', facturaId]);
    } else {
      // Si no hay factura (pago huérfano), podrías mandarlo a una ruta general
      console.warn('Este pago no tiene una factura asociada');
      this.router.navigate(['/reportar-pago', 'nuevo']);
    }
  }



}
