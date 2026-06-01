import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AsideCuentaComponent } from '../aside-cuenta/aside-cuenta.component';
import { environment } from '../../../../environments/environment';
import { Venta, Cancelacion } from '../../../models/ventas.model';
import { UsuarioService } from '../../../services/usuario.service';
import { PedidomenuService } from '../../../services/pedidomenu.service';
import { Pedido } from '../../../models/pedido.model';
import { Tienda } from '../../../models/tienda.model';
import { TiendaService } from '../../../services/tienda.service';
import { ModalinfoPedidosComponent } from "../../../components/modalinfo-pedidos/modalinfo-pedidos.component";
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mispedidos',
  imports: [
    HeaderComponent,
    CommonModule,
    AsideCuentaComponent,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ModalinfoPedidosComponent,
    LoadingComponent
  ],
  templateUrl: './mispedidos.component.html',
  styleUrl: './mispedidos.component.scss'
})
export class MispedidosComponent {
  public url: any;
  public msm_error = false;
  public msm_success = false;
  public isLoading = false;
  public ordenes!: Venta;
  public cancelacion!: Cancelacion;
  public pedidos!: Pedido[] | null;
  public pedido!: Pedido;
  public tienda!: Tienda;
  public detalle: any = {};

  p: number = 1;
  count: number = 8;

  public id!: string;
  user: any;
  userId: any;

  // Modal control - Angular way (no jQuery needed)
  public modalAbierto: string | null = null;
  tiendaSelected: any;

  constructor(
    private pedidoService: PedidomenuService,
    private tiendaService: TiendaService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getLocalStorage();
    this.userId = this.user.uid;
    
    // 1. Comenzamos a escuchar el observable del servicio
    this.escucharTiendaActiva();

    // 2. Disparamos la petición inicial (usa el slug automático 'pizzeria')
    // Esto llenará el BehaviorSubject interno de tu servicio
    this.tiendaService.getTiendaByNameCached().subscribe();
}

escucharTiendaActiva() {
    this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      // Al principio será null, pero en cuanto getTiendaByNameCached responda, 
      // el tap del servicio emitirá la tienda real aquí.
      if (tienda) {
        this.tiendaSelected = tienda;
        
        // 3. Ahora que tiendaSelected tiene el _id, listamos los pedidos
        this.listar_pedidos();
      }
    });
}
listar_pedidos() {
    this.isLoading = true;
    this.pedidoService.getByTiendaUserId(this.tiendaSelected._id, this.userId).subscribe(
      (resp: any) => {
        this.pedidos = resp;
        console.log(resp);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al traer pedidos:', error);
        this.isLoading = false;
      }
    );
}

  // Modal control methods - Angular way (no jQuery needed)
  abrirModal(id: string): void {
    this.modalAbierto = id;
  }

  cerrarModal(): void {
    this.modalAbierto = null;
  }

  eliminar(id: any) {
    this.pedidoService.borrarPedido(id).subscribe(
      response => {
        this.cerrarModal();
        this.listar_pedidos();
      },
      error => {
        this.cerrarModal();
      }
    );
  }


}
