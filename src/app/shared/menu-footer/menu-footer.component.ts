import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Tienda } from '../../models/tienda.model';
import { Usuario } from '../../models/usuario.model';
import { CarritoService } from '../../services/carrito.service';
import { environment } from '../../../environments/environment';
import { PedidomenuService } from '../../services/pedidomenu.service';
import { Pedido } from '../../models/pedido.model';
import { UsuarioService } from '../../services/usuario.service';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-menu-footer',
  imports: [RouterModule, CommonModule],
  templateUrl: './menu-footer.component.html',
  styleUrls: ['./menu-footer.component.scss']
})
export class MenuFooterComponent {

  totalList: number = 0;
  tiendas: Tienda[] = [];
  tienda!: Tienda;
  tiendaSelected!: Tienda;
  bandejaList: any[] = [];

  year: number = new Date().getFullYear();
  nombreSelected = environment.nombreSelected;
  public user!: any;

  pedidoGuardado = false;
  userId: any;
  pedido: any;
  public pedidos!: Pedido[] | null;

   public unreadCount$!: Observable<number>;

  private pedidoService = inject(PedidomenuService);
  private carritoService = inject(CarritoService);
  private userService = inject(UsuarioService);
  private notifService = inject(NotificacionService);

  private cartSubscription!: Subscription;

  ngOnInit(): void {
    this.user = this.userService.getLocalStorage();
    this.userId = this.user?.uid;
    // 2. Vinculamos el flujo del servicio y disparamos la petición
    this.unreadCount$ = this.notifService.unreadCount$;
    this.notifService.cargarContador();
    // Subscribe to cart changes
    this.cartSubcrpt();
    this.chekpedidoguardado();

  }

  cartSubcrpt() {
    this.cartSubscription = this.carritoService.bandejaList$.subscribe(items => {
      this.bandejaList = items;
      this.totalList = items.length;
      // console.log(this.bandejaList)
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  chekpedidoguardado() {
    const storedItems = localStorage.getItem('bandejaItems');
    // Si no hay items en localStorage, no hay pedido guardado
    if (!storedItems) {
      this.pedidoGuardado = false;
      return;
    }

    // Si no hay userId, no hay pedido guardado
    if (!this.userId) {
      this.pedidoGuardado = false;
      return;
    }
    this.pedidoService.getByUserId(this.userId).subscribe((resp: any) => {
      this.pedidos = resp;
      // console.log('Pedidos del usuario:', resp);

      // resp es un array de pedidos
      // Si el array está vacío, no hay pedido guardado
      if (!resp || resp.length === 0) {
        this.pedidoGuardado = false;
        return;
      }

      // Convertir storedItems a objeto para comparar
      const bandejaItems = JSON.parse(storedItems);

      // Verificar si existe algún pedido que coincida con los items actuales
      // Comparamos el contenido de los arrays, no por referencia
      const pedidoCoincide = resp.some((pedido: any) => {
        // Comparamos que la tienda sea la misma
        const mismaTienda = pedido.tienda === this.tiendaSelected?._id;

        // Comparamos que los pedidos tengan los mismos items (misma longitud y mismos IDs)
        const mismaBandeja = pedido.pedido && pedido.pedido.length === bandejaItems.length;

        // Comparamos que el status sea PENDING
        const statusIgual = pedido.status === 'PENDING';

        // Comparamos que sea de la misma fecha
        const pedidoFecha = new Date(pedido.createdAt).toDateString();
        const todayFecha = new Date().toDateString();
        const mismaFecha = pedidoFecha === todayFecha;

        return mismaTienda && mismaBandeja && statusIgual && mismaFecha;
      });

      // pedidoGuardado es true solo si:
      // 1. Hay items en localStorage Y
      // 2. Hay un pedido en la BD que coincida con esos items
      this.pedidoGuardado = pedidoCoincide;

      this.pedido = resp[0]
      // this.borrarPedidoß()
      this.cartSubcrpt();
    })
  }

}
