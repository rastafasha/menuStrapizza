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
export class FavoritoService {

  public favorito: any;
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



  registro(favorito: any){
    const url = `${base_url}/favoritos/registro`;
    return this._http.post(url, favorito, this.headers);
  }

  listarFavoritos():Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url + '/favoritos/',{headers:headers})
  }

  listarFaoritosporUsuario(userId:any):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type','application/json');
    return this._http.get(this.url + '/favoritos/user/'+userId,{headers:headers})

  }

  // existeEnFavoritos(producto:any){
  //   for (let i in this.favorito) {
  //     if(this.favorito[i].id == producto.id)
  //     return true;
  //   }
  // }

  getFavorito(id:string){
    const url = `${base_url}/favoritos/${id}`;
    return this._http.get<any>(url, this.headers)
      .pipe(
        map((resp:{ok: boolean, direccion: Direccion}) => resp.direccion)
        );
  }

  update(favorito:any){
    const url = `${base_url}/favoritos/update/${favorito._id}`;
    return this._http.put(url, favorito, this.headers);
  }

  eliminar(id:string){
    const url = `${base_url}/favoritos/remove/${id}`;
    return this._http.delete(url, this.headers);
  }


}
