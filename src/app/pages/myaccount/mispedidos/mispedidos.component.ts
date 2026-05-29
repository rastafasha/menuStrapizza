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
  public url:any;
  public msm_error = false;
  public msm_success = false;
  public isLoading = false;
  public ordenes!:Venta;
  public cancelacion!: Cancelacion;
  public pedidos!: Pedido[]|null;
  public pedido!: Pedido;
  public tienda!: Tienda;
  public detalle : any = {};

  p: number = 1;
  count: number = 8;

  public id!:string;
  user:any;
  
  // Modal control - Angular way (no jQuery needed)
  public modalAbierto: string | null = null;
  nombreSelected = environment.nombreSelected;
  tiendaSelected: any;

  constructor(
    private pedidoService: PedidomenuService,
     private tiendaService: TiendaService,
     private usuarioService: UsuarioService,
  ) {
    // this.usuario = usuarioService.usuario;
    
   

  }

  ngOnInit(): void {
     let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this. getTienda();
  }

   getTienda() {
    this.tiendaService.getTiendaByName(this.nombreSelected).subscribe((resp: Tienda) => {
      this.tiendaSelected = resp;
      this.listar_pedidos();

    })
  }

 

  listar_pedidos(){
    this.isLoading = true;
   this.pedidoService.getByTiendaUserId(this.tiendaSelected._id, this.user.uid).subscribe(
      (resp:any)=>{
        this.pedidos = resp;
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

  eliminar(id:any){
    this.pedidoService.borrarPedido(id).subscribe(
      response=>{
        this.cerrarModal();
        this.listar_pedidos();
      },
      error=>{
        this.cerrarModal();
      }
    );
  }


}
