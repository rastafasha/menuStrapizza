import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";
import { Router } from '@angular/router';
import{Usuario} from '../models/usuario.model';
import { environment } from '../environments/environment';
import { Producto } from '../models/producto.model';


const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  public url;
  rapidapiK = environment.rapidapiKey;
  rapidapiH = environment.rapidapiHost;
  clientIdPaypal = environment.clientIdPaypal;
  sandboxPaypal = environment.sandboxPaypal;

  user!:Usuario;
  producto!:Producto;

  constructor(
    private _http: HttpClient,
    private router: Router,
    ) {
      this.url = environment.baseUrl;
  }

  get token():string{
    return localStorage.getItem('token') || '';
  }


  get headers(){
    return{
      headers: {
        'x-token': this.token
      }
    }
  }
  registro(data:any):Observable<any>{

    const url = `${base_url}/ventas/store`;
    return this._http.post(url, data, this.headers);
  }

  getVenta(id:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/'+id,{headers:headers});
  }

  listarporUser(id:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/user_order/'+id,{headers:headers});
  }

  detalle(id:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/venta_track/detalle/'+id,{headers:headers});
  }

  finalizar(id:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/venta_finalizar/venta/'+id,{headers:headers});
  }

  update_envio(id:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/venta_enviado/update/'+id,{headers:headers});
  }

  listarCancelacionporUser(id:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/user_cancelacion/'+id,{headers:headers});
  }

  evaluar_cancelacion(id:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/cancelacion_evaluar/venta/'+id,{headers:headers});
  }

  reembolsar(id:string,idticket:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/cancelacion_send/reembolsar/'+id+'/'+idticket,{headers:headers});
  }


  cancelar(data:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.post(this.url+'/ventas/cancelacion_send/cancelar',data,{headers:headers});
  }


  denegar(id:string,idticket:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/cancelacion_send/denegar/'+id+'/'+idticket,{headers:headers});
  }

  listar_cancelaciones(wr:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/get_cancelacion_admin/data/'+wr,{headers:headers});
  }

  get_cancelacion(id:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/cancelacion/'+id,{headers:headers});
  }

  get_token():Observable<any>{
    let headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${this.clientIdPaypal}:${this.sandboxPaypal}`),
      // 'Authorization': 'Basic ' + btoa('AVTHn-IitbqsInQ7Y_Ald2kPSvEjTd3RRm_OevRxyzv_tXo7XskvFK6w2IxFuZLeKSXWUqoDg_JdWu5V:AXlazeNsZ0CmjfJIronSzcqzw4hLHkcoVEM5fO5BY7AbD-_GhKoKezRcavq6-T4kQuRqaTXFB_VXmheG'),
    });
    return this._http.post('https://api.sandbox.paypal.com/v1/oauth2/token','grant_type=client_credentials',{headers:headers});
  }

  set_reembolso(token:any,id:string):Observable<any>{
    let headers = new HttpHeaders({
      'Content-Type':'application/json',
      'Authorization': 'Bearer ' + token,
    });
    return this._http.post('https://api.sandbox.paypal.com/v1/payments/capture/'+id+'/refund',{},{headers:headers});
  }

  track(number:any){
    let headers = new HttpHeaders()
    .set('x-rapidapi-host', this.rapidapiH)
    .set("x-rapidapi-key", this.rapidapiK)
    .set("useQueryString", "true");
    return this._http.get('https://apidojo-17track-v1.p.rapidapi.com/track?timeZoneOffset=0&codes='+number,{headers:headers});
  }

  get_cancelacion_venta(id:string):Observable<any>{

    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/cancelacion_venta/obtener_data/'+id,{headers:headers});
  }

  evaluar_venta_user(user:string,producto:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/evaluar_venta/data/'+user+'/'+producto,{headers:headers});
  }

  get_data_venta_admin(search: string,orden: string,tipo: string):Observable<any>{

    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/venta_admin/listar/'+search+'/'+orden+'/'+tipo,{headers:headers});
  }

  set_track(id:string,data:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.post(this.url+'/ventas/venta_track/set/'+id,data,{headers:headers});
  }

  get_data_dashboard():Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/venta_data/dashboard',{headers:headers});
  }

  get_detalle_hoy():Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/venta_data/detalles/hoy',{headers:headers});
  }

  init_data_admin():Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url+'/ventas/venta_admin_init/init_data',{headers:headers});
  }


}
