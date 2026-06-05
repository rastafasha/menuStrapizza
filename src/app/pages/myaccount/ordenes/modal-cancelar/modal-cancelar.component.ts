import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Usuario } from '../../../../models/usuario.model';
import { VentaService } from '../../../../services/venta.service';
import { CommonModule } from '@angular/common';
declare var bootstrap: any;
declare var $:any;
@Component({
  selector: 'app-modal-cancelar',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './modal-cancelar.component.html',
  styleUrl: './modal-cancelar.component.scss'
})
export class ModalCancelarComponent {

  public cancelacion : any = {};
  public msm_error_cancelar = '';
  public data_cancelacion : any = {};
  public identity!: Usuario | null;
  public msm_error_review='';
  public data_comentarios : Array<any> = [];
  public btn_cancelar!:string;
  id!:string;

   constructor(
    private _ventaService: VentaService,
  ) {
     let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
    }
  }
  
  cancelar(cancelarForm:any){
    if(cancelarForm.valid){
      this.msm_error_cancelar = '';
      this.cancelacion.mensaje = cancelarForm.value.mensaje;

      this._ventaService.cancelar(this.cancelacion).subscribe(
        (response:any) =>{
          $('#sol_cancelar').modal('hide');
          $('.modal-backdrop').removeClass('show');
          this.evaluar_cancelacion();
          // this.init_data();
          // this.get_cancelacion();
        },
        error=>{
          console.log(error);

        }
      );
    }else{
      this.msm_error_cancelar = 'Escribe el motivo de la cancelación.'
    }
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
  close_alert(){
    this.msm_error_review = '';
    this.msm_error_cancelar = '';
  }
}
