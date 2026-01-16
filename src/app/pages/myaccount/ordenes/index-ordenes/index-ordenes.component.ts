import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Venta, Cancelacion } from '../../../../models/ventas.model';
import { UsuarioService } from '../../../../services/usuario.service';
import { VentaService } from '../../../../services/venta.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../shared/header/header.component';
import { AsideCuentaComponent } from '../../aside-cuenta/aside-cuenta.component';
import { environment } from '../../../../../environments/environment';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-index-ordenes',
  imports:[
      HeaderComponent,
      CommonModule,
      AsideCuentaComponent,
      RouterModule,
      ReactiveFormsModule,
      FormsModule,
      
    ],
  templateUrl: './index-ordenes.component.html',
  styleUrls: ['./index-ordenes.component.css']
})
export class IndexOrdenesComponent implements OnInit {

  public identity;
  public url:any;
  public msm_error = false;
  public msm_success = false;
  public ordenes!:Venta;
  public cancelacion!: Cancelacion;
  public ventas!: Venta[]|null;
  public venta!: Venta;
  public detalle : any = {};

  p: number = 1;
  count: number = 8;

  public id!:string;

  constructor(
    private usuarioService: UsuarioService,
    private _router : Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private ventaService: VentaService
  ) {
    // this.usuario = usuarioService.usuario;
     let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
      console.log(this.identity);
    }
  }

  ngOnInit(): void {

    if(this.identity){
      this.listar_ventas();
      this.listar_cancelacion();
      this.url = environment.baseUrl;
    }else{
      this._router.navigate(['/']);
    }

  }

  listar_ventas(){
   this.ventaService.listarporUser(this.identity.uid!).subscribe(
      response=>{
        this.ventas = response.ventas;
        console.log(this.ventas);

      },
      error=>{

      }
    );
  }




  listar_cancelacion(){
    this.ventaService.listarCancelacionporUser(this.identity.uid!).subscribe(
      response=>{
        this.cancelacion = response.cancelacion;
        console.log(this.cancelacion);
      },
      error=>{

      }
    );
  }


}
