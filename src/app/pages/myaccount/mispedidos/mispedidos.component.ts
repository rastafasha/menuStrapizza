import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AsideCuentaComponent } from '../aside-cuenta/aside-cuenta.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Venta, Cancelacion } from '../../../models/ventas.model';
import { UsuarioService } from '../../../services/usuario.service';
import { VentaService } from '../../../services/venta.service';
import { PedidomenuService } from '../../../services/pedidomenu.service';
import { Pedido } from '../../../models/pedido.model';
import { Tienda } from '../../../models/tienda.model';
import { MenuFooterComponent } from "../../../shared/menu-footer/menu-footer.component";
import { TiendaService } from '../../../services/tienda.service';

@Component({
  selector: 'app-mispedidos',
  imports: [
    HeaderComponent,
    CommonModule,
    AsideCuentaComponent,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MenuFooterComponent
],
  templateUrl: './mispedidos.component.html',
  styleUrl: './mispedidos.component.scss'
})
export class MispedidosComponent {
  public identity;
  public url:any;
  public msm_error = false;
  public msm_success = false;
  public ordenes!:Venta;
  public cancelacion!: Cancelacion;
  public pedidos!: Pedido[]|null;
  public pedido!: Pedido;
  public tienda!: Tienda;
  public detalle : any = {};

  p: number = 1;
  count: number = 8;

  public id!:string;
  
  // Modal control - Angular way (no jQuery needed)
  public modalAbierto: string | null = null;
  nombreSelected = environment.nombreSelected;
  tiendaSelected: any;

  constructor(
    private pedidoService: PedidomenuService,
     private tiendaService: TiendaService,
  ) {
    // this.usuario = usuarioService.usuario;
     let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
      // console.log(this.identity);
    }
  }

  ngOnInit(): void {
    this.getTienda();
  }

   getTienda() {
    this.tiendaService.getTiendaByName(this.nombreSelected).subscribe((resp: Tienda) => {
      this.tiendaSelected = resp;
      this.listar_pedidos();

    })
  }

  listar_pedidos(){
   this.pedidoService.getByTiendaUserId(this.tiendaSelected._id, this.identity.uid!).subscribe(
      (resp:any)=>{
        this.pedidos = resp;
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
