import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Promocion } from '../models/promocion.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const base_url = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class PromocionService {


  constructor(
    private http: HttpClient
  ) { }

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


  cargarPromocions(){

    const url = `${base_url}/promocions`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, promocions: Promocion[]}) => resp.promocions)
      )

  }


  getPromocionById(_id: string){
    const url = `${base_url}/promocions/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, promocion: Promocion}) => resp.promocion)
        );

  }
  getPromocionByIdLocal(_id: string){
    const url = `${base_url}/promocions/local/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, promociones: Promocion}) => resp.promociones)
        );

  }
  getPromocionActivoByIdLocal(_id: any){
    const url = `${base_url}/promocions/active-local/${_id}`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, promociones: Promocion}) => resp.promociones)
        );

  }


  crearPromocion(promocion: Promocion){
    const url = `${base_url}/promocions`;
    return this.http.post(url, promocion, this.headers);
  }

  actualizarPromocion(promocion: Promocion){
    const url = `${base_url}/promocions/${promocion._id}`;
    return this.http.put(url, promocion, this.headers);
  }

  borrarPromocion(_id:string){
    const url = `${base_url}/promocions/${_id}`;
    return this.http.delete(url, this.headers);
  }


  desactivar(id:string):Observable<any>{
      const url = `${base_url}/promocions/desactivar/`+id;
      return this.http.get(url,  this.headers);
    }
  
    activar(id:string):Observable<any>{
      const url = `${base_url}/promocions/activar/`+id;
      return this.http.get(url,  this.headers);
    }
  


}
