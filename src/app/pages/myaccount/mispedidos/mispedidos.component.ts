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

@Component({
  selector: 'app-mispedidos',
  imports:[
      HeaderComponent,
      CommonModule,
      AsideCuentaComponent,
      RouterModule,
      ReactiveFormsModule,
      FormsModule,
      
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

  constructor(
    private usuarioService: UsuarioService,
    private _router : Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private ventaService: VentaService,
    private pedidoService: PedidomenuService
  ) {
    // this.usuario = usuarioService.usuario;
     let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
      // console.log(this.identity);
    }
  }

  ngOnInit(): void {

    this.listar_pedidos();

  }

  listar_pedidos(){
   this.pedidoService.getByUserId(this.identity.uid!).subscribe(
      (resp:any)=>{
        this.pedidos = resp;
        console.log(this.pedidos);

      },
      error=>{

      }
    );
  }


}
