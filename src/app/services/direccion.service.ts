import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';
import { Observable } from "rxjs";
import { Router } from '@angular/router';
import { Direccion } from '../models/direccion.model';
import { map } from 'rxjs/operators';
const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class DireccionService {

  public direccion!: Direccion;
  public url;

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



  registro(direccion: Direccion){
    const url = `${base_url}/direccions/direccion/registro`;
    return this._http.post(url, direccion, this.headers);
  }

  listarDirecciones():Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url + '/direccions/',{headers:headers})
  }

  listarUsuario(id:string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url + '/direccions/direccionesusuario/'+id,{headers:headers})

  }

  get_direccion(id:string){
    const url = `${base_url}/direccions/direccion/${id}`;
    return this._http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, direccion: Direccion}) => resp.direccion)
        );
  }
  get_direccionNombre(id:any, nombre:any){
    const url = `${base_url}/direccions/nombre/${id}/${nombre}`;
    return this._http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, direccion: Direccion[]}) => resp.direccion[0])
        );
  }

  update(direccion:Direccion){
    const url = `${base_url}/direccions/direccion/update/${direccion._id}`;
    return this._http.put(url, direccion, this.headers);
  }

  eliminar(id:string){
    const url = `${base_url}/direccions/direccion/remove/${id}`;
    return this._http.delete(url, this.headers);
  }


}
