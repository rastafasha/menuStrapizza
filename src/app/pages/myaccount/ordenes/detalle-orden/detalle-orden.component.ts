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
import { environment } from '../../../../../environments/environment';
import { TiendaService } from '../../../../services/tienda.service';
import { ComentarioService } from '../../../../services/comentario.service';
import { Venta } from '../../../../models/ventas.model';
import { ModalCancelarComponent } from '../modal-cancelar/modal-cancelar.component';
import { ModalComentariosComponent } from '../modalComentarios/modalComentarios.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AsignardeliveryService } from '../../../../services/asignardelivery.service';
import { Asignacion } from '../../../../models/asignaciondelivery.model';
import { PedidomenuService } from '../../../../services/pedidomenu.service';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-detalle-orden',
  imports: [
    HeaderComponent,
    CommonModule,
    AsideCuentaComponent,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ImagenPipe,
    ModalCancelarComponent,
    ModalComentariosComponent,
    TranslatePipe

  ],
  templateUrl: './detalle-orden.component.html',
  styleUrls: ['./detalle-orden.component.css']
})
export class DetalleOrdenComponent implements OnInit {

  public identity!: Usuario | null;
  public url!: string;
  public msm_error = false;
  public msm_success = false;
  public usaDelivery = false;
  public id!: string;
  public detalle: any = {};
  public venta!: Venta;


  public msm_error_review = '';
  public data_comentarios: Array<any> = [];
  public btn_cancelar!: string;

  public cancelacion: any = {};
  public msm_error_cancelar = '';
  public data_cancelacion: any = {};

  public local!: string;
  public tienda_moneda!: any;
  public itemSeleccionado!: any;

  asignacion!: Asignacion;
  pedido:any;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _ventaService: VentaService,
    private tiendaService: TiendaService,
    private asignacionDServices: AsignardeliveryService,
    private pedidoService: PedidomenuService,
    public translate: TranslateService
  ) {
    let USER = localStorage.getItem('user');
    if (USER) {
      this.identity = JSON.parse(USER);
    }
  }

 



  ngOnInit(): void {
    window.scrollTo(0, 0);
    if (this.identity) {
      this.url = environment.baseUrl;
      this._route.params.subscribe(
        params => {
          this.id = params['id'];
          this.init_data();
          this.get_cancelacion();

        }
      );

      this.cancelacion = {
        mensaje: '',
        user: this.identity.uid,
        venta: this.id
      };

    } else {
      this._router.navigate(['/']);
    }

  }

  init_data() {
    this._ventaService.detalle(this.id).subscribe(
      response => {
        this.detalle = response.detalle;
        this.venta = response.venta;
        this.local = this.venta.local
        // this.data_reviews();
        this.evaluar_cancelacion();
        this.getTienda();
      },
      error => {
      }
    );
  }

  getTienda() {
    this.tiendaService.getTiendaById(this.local).subscribe((resp: any) => {
      this.tienda_moneda = resp.moneda;
      this.usaDelivery = resp.usaDelivery;

    })
  }
  getasignacion(){
    // this.asignacionDServices.getById().subscribe((resp:any)=>{

    // })
  }

  get_cancelacion() {

    this._ventaService.listarCancelacionporUser(this.id).subscribe(
      response => {
        this.data_cancelacion = response.cancelacion;
      },
      error => {
        this.data_cancelacion = null;

      }
    );
  }

  evaluar_cancelacion() {
    this._ventaService.evaluar_cancelacion(this.id).subscribe(
      response => {
        this.btn_cancelar = response.data;
      },
      error => {

      }
    );
  }

  finalizar(id: string) {
    this._ventaService.finalizar(id).subscribe(
      response => {
        this._ventaService.detalle(this.id).subscribe(
          response => {
            this.detalle = response.detalle;
            this.venta = response.venta;
            $('#finalizar').modal('hide');
            $('.modal-backdrop').removeClass('show');
            // this.data_reviews();
            this.marcarRecibido();
          });
      },
    );
  }
  marcarRecibido() {
    this.asignacionDServices.recibido(this.asignacion._id).subscribe((resp: any) => {
      // console.log(resp);
      this.asignacion = resp.asignacion;
      this.updatePedidoEntregado();
      this.ngOnInit();
    });
  }

  updatePedidoEntregado() {
    const data = {
      id: this.asignacion.pedido,
      status: 'Recibidas'
    }
    this.pedidoService.actualizarStatusPedido(data).subscribe((resp: any) => {
      this.pedido = resp
    })
  }

  

  cancelar(cancelarForm: any) {
    if (cancelarForm.valid) {
      this.msm_error_cancelar = '';
      this.cancelacion.mensaje = cancelarForm.value.mensaje;

      this._ventaService.cancelar(this.cancelacion).subscribe(
        response => {
          $('#sol_cancelar').modal('hide');
          $('.modal-backdrop').removeClass('show');
          this.evaluar_cancelacion();
          this.init_data();
          this.get_cancelacion();
        },
        error => {
          console.log(error);

        }
      );
    } else {
      this.msm_error_cancelar = 'Escribe el motivo de la cancelación.'
    }
  }


 onEditComentario(item: any) {
    this.itemSeleccionado = item;
    console.log(item)
  }


  close_alert() {
    this.msm_error_review = '';
    this.msm_error_cancelar = '';
  }


}
