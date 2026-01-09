import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UsuarioService } from '../../../../services/usuario.service';
import { VentaService } from '../../../../services/venta.service';
import { Usuario } from '../../../../models/usuario.model';
import { HeaderComponent } from '../../../../shared/header/header.component';
import { CommonModule } from '@angular/common';
import { AsideCuentaComponent } from '../../aside-cuenta/aside-cuenta.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagenPipe } from '../../../../pipes/imagen-pipe.pipe';
import { environment } from '../../../../environments/environment';
declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-detalle-orden',
  imports:[
    HeaderComponent,
    CommonModule,
    AsideCuentaComponent,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ImagenPipe,

  ],
  templateUrl: './detalle-orden.component.html',
  styleUrls: ['./detalle-orden.component.css']
})
export class DetalleOrdenComponent implements OnInit {

  public identity!: Usuario | null;
  public url!:string;
  public msm_error = false;
  public msm_success = false;
  public id!:string;
  public detalle : any = {};
  public venta : any = {};

  public id_review_producto!:string;
  public review_comentario='';
  public review_pros='';
  public review_cons='';
  public review_estrellas='';
  public select_detalle='';

  public msm_error_review='';
  public data_comentarios : Array<any> = [];
  public btn_cancelar!:string;

  public cancelacion : any = {};
  public msm_error_cancelar = '';
  public data_cancelacion : any = {};

  constructor(
    private _userService: UsuarioService,
    private _router : Router,
    private _route :ActivatedRoute,
    private http: HttpClient,
    private _ventaService: VentaService,
  ) {
     let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
      console.log(this.identity);
    }
  }

  modal_data(idproducto:string,id:string){
    this.id_review_producto = idproducto;
    this.select_detalle = id;
    this.msm_error_review = '';
    this.review_comentario='';
    this.review_pros='';
    this.review_cons='';
    this.review_estrellas='';
  }



  ngOnInit(): void {

    if(this.identity){
      this.url = environment.baseUrl;
      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this.init_data();
          this.get_cancelacion();

        }
      );

      this.cancelacion = {
        mensaje: '',
        user : this.identity.uid,
        venta : this.id
      };

    }else{
      this._router.navigate(['/']);
    }

  }

  init_data(){
    this._ventaService.detalle(this.id).subscribe(
      response =>{
        this.detalle = response.detalle;
        this.venta = response.venta;
        // this.data_reviews();
        this.evaluar_cancelacion();
      },
      error=>{
      }
    );
  }

  get_cancelacion(){

    this._ventaService.listarCancelacionporUser(this.id).subscribe(
      response =>{
        this.data_cancelacion = response.cancelacion;


      },
      error =>{
        this.data_cancelacion = null;

      }
    );
  }

  evaluar_cancelacion(){
    this._ventaService.evaluar_cancelacion(this.id).subscribe(
      response =>{
        this.btn_cancelar = response.data;
      },
      error =>{

      }
    );
  }

  finalizar(id:string){
    this._ventaService.finalizar(id).subscribe(
      response =>{
        this._ventaService.detalle(this.id).subscribe(
          response =>{
            this.detalle = response.detalle;
            this.venta = response.venta;
            $('#finalizar').modal('hide');
            $('.modal-backdrop').removeClass('show');
            // this.data_reviews();

          },
          error=>{

          }
        );
      },
      error=>{

      }
    );
  }

  cancelar(cancelarForm:any){
    if(cancelarForm.valid){
      this.msm_error_cancelar = '';
      this.cancelacion.mensaje = cancelarForm.value.mensaje;

      this._ventaService.cancelar(this.cancelacion).subscribe(
        response =>{
          $('#sol_cancelar').modal('hide');
          $('.modal-backdrop').removeClass('show');
          this.evaluar_cancelacion();
          this.init_data();
          this.get_cancelacion();
        },
        error=>{
          console.log(error);

        }
      );
    }else{
      this.msm_error_cancelar = 'Escribe el motivo de la cancelación.'
    }
  }

  logout(){

    localStorage.removeItem('token');
    localStorage.removeItem('identity');

    this.identity = null;

    this._router.navigate(['/']);
  }

  

  close_alert(){
    this.msm_error_review = '';
    this.msm_error_cancelar = '';
  }


}
