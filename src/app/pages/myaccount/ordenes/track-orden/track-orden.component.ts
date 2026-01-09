import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UsuarioService } from '../../../../services/usuario.service';
import { VentaService } from '../../../../services/venta.service';
import { environment } from '../../../../environments/environment';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-track-orden',
  templateUrl: './track-orden.component.html',
  styleUrls: ['./track-orden.component.css']
})
export class TrackOrdenComponent implements OnInit {

  public identity;
  public url!:string;
  public msm_error = false;
  public msm_success = false;
  public id!:string;
  public venta : any = {};

  public data_track : any = {};
  public data_origen : any = {};
  public data_destino : any = {};

  public loading = true;

  constructor(
    private _userService:UsuarioService,
    private _router : Router,
    private _route :ActivatedRoute,
    private http: HttpClient,
    private _ventaService: VentaService
  ) {
    this.identity = _userService.usuario;
  }

  ngOnInit(): void {

    if(this.identity){

      this.url = environment.baseUrl;

      this._route.params.subscribe(
        params=>{
          this.id = params['id'];
          this._ventaService.detalle(this.id).subscribe(
            response =>{
              this.venta = response.venta;

              this._ventaService.track(this.venta.tracking_number).subscribe(
                response=>{
                  this.loading = false;
                  this.data_track = response;
                  console.log(this.data_track);

                  this.data_origen = this.data_track.dat[0].track.z1;
                  this.data_destino = this.data_track.dat[0].track.z2;

                }
              );
            },
            error=>{

            }
          );
        }
      );
    }else{
      this._router.navigate(['/']);
    }


  }

 
}
